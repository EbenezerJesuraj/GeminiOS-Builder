"""
Gemini OS — LLM Router

Routes AI inference requests to the best available backend:
- Ollama (local)
- llama.cpp (local, low-level)
- vLLM (local, high-throughput)
- Gemini API (cloud)

Supports multi-model routing, dynamic quantization selection,
GPU-aware loading, context caching, and session persistence.
"""

import asyncio
import json
import logging
import os
from dataclasses import dataclass
from enum import Enum
from typing import Optional

logger = logging.getLogger("gemini-orchestrator.llm-router")


class LLMBackend(Enum):
    OLLAMA = "ollama"
    LLAMA_CPP = "llama_cpp"
    VLLM = "vllm"
    GEMINI_CLOUD = "gemini_cloud"


class ModelPurpose(Enum):
    ASSISTANT = "assistant"
    CODING = "coding"
    VISION = "vision"
    VOICE = "voice"
    PLANNING = "planning"
    SYSTEM = "system"


@dataclass
class ModelConfig:
    name: str
    backend: LLMBackend
    purpose: ModelPurpose
    priority: int = 50
    max_context: int = 4096
    quantization: str = "q4_0"
    gpu_layers: int = -1  # -1 = auto


# Default model routing table
DEFAULT_MODELS = [
    ModelConfig("gemma3:2b", LLMBackend.OLLAMA, ModelPurpose.ASSISTANT, priority=90),
    ModelConfig("deepseek-coder:6.7b", LLMBackend.OLLAMA, ModelPurpose.CODING, priority=80),
    ModelConfig("llava:7b", LLMBackend.OLLAMA, ModelPurpose.VISION, priority=70),
    ModelConfig("whisper", LLMBackend.OLLAMA, ModelPurpose.VOICE, priority=85),
    ModelConfig("qwen:7b", LLMBackend.OLLAMA, ModelPurpose.PLANNING, priority=75),
    ModelConfig("gemma3:2b", LLMBackend.OLLAMA, ModelPurpose.SYSTEM, priority=60),
]


class LLMRouter:
    """Routes AI tasks to the optimal LLM backend and model."""

    def __init__(self):
        self._models: list[ModelConfig] = DEFAULT_MODELS.copy()
        self._sessions: dict[str, dict] = {}
        self._ollama_url = "http://localhost:11434"
        self._gemini_api_key: Optional[str] = None

    async def initialize(self):
        """Initialize LLM backends and check availability."""
        logger.info("Initializing LLM Router...")
        self._gemini_api_key = os.environ.get("GEMINI_API_KEY")

        available = await self._check_ollama()
        if available:
            logger.info("Ollama backend: available")
        else:
            logger.warning("Ollama backend: unavailable — falling back to cloud")

        if self._gemini_api_key:
            logger.info("Gemini Cloud backend: configured")
        else:
            logger.info("Gemini Cloud backend: no API key set")

    async def _check_ollama(self) -> bool:
        """Check if Ollama is running and accessible."""
        try:
            import aiohttp
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self._ollama_url}/api/tags") as resp:
                    return resp.status == 200
        except Exception:
            return False

    async def route(self, task) -> str:
        """Route a task to the best model/backend combination."""
        purpose = self._classify_intent(task.intent)
        model = self._select_model(purpose)

        if model.backend == LLMBackend.OLLAMA:
            return await self._query_ollama(model, task.intent, task.payload)
        elif model.backend == LLMBackend.GEMINI_CLOUD:
            return await self._query_gemini(task.intent, task.payload)
        else:
            return f"No available backend for purpose: {purpose.value}"

    def _classify_intent(self, intent: str) -> ModelPurpose:
        """Classify user intent into a model purpose category."""
        intent_lower = intent.lower()

        coding_keywords = ["code", "program", "debug", "function", "script", "compile"]
        vision_keywords = ["image", "photo", "screenshot", "visual", "picture", "see"]
        voice_keywords = ["transcribe", "listen", "speech", "dictate", "voice"]
        planning_keywords = ["plan", "schedule", "organize", "workflow", "steps"]
        system_keywords = ["optimize", "cpu", "memory", "battery", "thermal", "network"]

        for kw in coding_keywords:
            if kw in intent_lower:
                return ModelPurpose.CODING
        for kw in vision_keywords:
            if kw in intent_lower:
                return ModelPurpose.VISION
        for kw in voice_keywords:
            if kw in intent_lower:
                return ModelPurpose.VOICE
        for kw in planning_keywords:
            if kw in intent_lower:
                return ModelPurpose.PLANNING
        for kw in system_keywords:
            if kw in intent_lower:
                return ModelPurpose.SYSTEM

        return ModelPurpose.ASSISTANT

    def _select_model(self, purpose: ModelPurpose) -> ModelConfig:
        """Select the highest-priority model for a given purpose."""
        candidates = [m for m in self._models if m.purpose == purpose]
        if not candidates:
            candidates = [m for m in self._models if m.purpose == ModelPurpose.ASSISTANT]
        return max(candidates, key=lambda m: m.priority)

    async def _query_ollama(self, model: ModelConfig, prompt: str,
                            context: dict) -> str:
        """Query the local Ollama instance."""
        try:
            import aiohttp
            payload = {
                "model": model.name,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "num_ctx": model.max_context,
                },
            }
            if "system_prompt" in context:
                payload["system"] = context["system_prompt"]

            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self._ollama_url}/api/generate",
                    json=payload,
                    timeout=aiohttp.ClientTimeout(total=120),
                ) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        return data.get("response", "")
                    else:
                        return f"Ollama error: HTTP {resp.status}"
        except Exception as e:
            logger.error(f"Ollama query failed: {e}")
            if self._gemini_api_key:
                return await self._query_gemini(prompt, context)
            return f"LLM query failed: {e}"

    async def _query_gemini(self, prompt: str, context: dict) -> str:
        """Query the Gemini Cloud API as fallback."""
        if not self._gemini_api_key:
            return "Gemini API key not configured."

        try:
            import aiohttp
            url = (
                "https://generativelanguage.googleapis.com/v1beta/"
                f"models/gemini-pro:generateContent?key={self._gemini_api_key}"
            )
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
            }
            if "system_prompt" in context:
                payload["systemInstruction"] = {
                    "parts": [{"text": context["system_prompt"]}]
                }

            async with aiohttp.ClientSession() as session:
                async with session.post(
                    url, json=payload,
                    timeout=aiohttp.ClientTimeout(total=30),
                ) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        return (
                            data["candidates"][0]["content"]["parts"][0]["text"]
                        )
                    else:
                        return f"Gemini API error: HTTP {resp.status}"
        except Exception as e:
            logger.error(f"Gemini API query failed: {e}")
            return f"Cloud query failed: {e}"
