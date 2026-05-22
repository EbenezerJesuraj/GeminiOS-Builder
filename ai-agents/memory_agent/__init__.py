"""
Gemini OS — Memory Agent

Semantic memory system for the OS:
- Learns user preferences over time
- Context-aware suggestions
- Activity pattern recognition
- Smart file and app recall
- Persistent knowledge graph
"""

import asyncio
import json
import logging
from datetime import datetime
from pathlib import Path

from ..base import GeminiAgent, AgentCapability

logger = logging.getLogger("geminios.agent.memory")

MEMORY_DIR = Path("/var/lib/geminios/memory")


class MemoryAgent(GeminiAgent):
    name = "memory_agent"
    description = "Semantic memory and user preference learning"
    capabilities = [
        AgentCapability(
            name="memory_management",
            keywords=["remember", "recall", "history", "preference", "learn",
                       "forgot", "find", "recent", "last"],
            description="Manages OS memory and user preferences",
            priority=65,
        ),
    ]

    def __init__(self):
        super().__init__()
        self._memories: list[dict] = []
        self._preferences: dict = {}
        self._activity_log: list[dict] = []

    async def on_start(self):
        await self._load_memories()

    async def on_stop(self):
        await self._save_memories()

    async def handle(self, task) -> str:
        intent = task.intent.lower()
        if "remember" in intent:
            content = task.payload.get("content", task.intent)
            return await self._store_memory(content)
        elif "recall" in intent or "find" in intent or "recent" in intent:
            query = task.payload.get("query", task.intent)
            return await self._recall(query)
        elif "preference" in intent:
            return await self._get_preferences()
        return await self._recall(task.intent)

    async def _store_memory(self, content: str) -> str:
        """Store a memory entry."""
        entry = {
            "content": content,
            "timestamp": datetime.now().isoformat(),
            "type": "user_memory",
        }
        self._memories.append(entry)
        await self._save_memories()
        return f"Noted. I'll remember: {content[:80]}"

    async def _recall(self, query: str) -> str:
        """Recall memories matching a query."""
        query_lower = query.lower()
        matches = []
        for mem in reversed(self._memories):
            if any(word in mem["content"].lower() for word in query_lower.split()):
                matches.append(mem)
            if len(matches) >= 5:
                break

        if not matches:
            return "No matching memories found."

        lines = ["Here's what I remember:"]
        for m in matches:
            lines.append(f"  [{m['timestamp'][:10]}] {m['content'][:100]}")
        return "\n".join(lines)

    async def _get_preferences(self) -> str:
        """Return learned user preferences."""
        if not self._preferences:
            return "No preferences learned yet."
        lines = ["Your preferences:"]
        for key, value in self._preferences.items():
            lines.append(f"  {key}: {value}")
        return "\n".join(lines)

    async def log_activity(self, activity_type: str, details: str):
        """Log a user activity for pattern learning."""
        self._activity_log.append({
            "type": activity_type,
            "details": details,
            "timestamp": datetime.now().isoformat(),
        })
        if len(self._activity_log) > 1000:
            self._activity_log.pop(0)

    async def _load_memories(self):
        """Load memories from disk."""
        mem_file = MEMORY_DIR / "memories.json"
        if mem_file.exists():
            try:
                self._memories = json.loads(mem_file.read_text())
            except Exception:
                self._memories = []

        pref_file = MEMORY_DIR / "preferences.json"
        if pref_file.exists():
            try:
                self._preferences = json.loads(pref_file.read_text())
            except Exception:
                self._preferences = {}

    async def _save_memories(self):
        """Save memories to disk."""
        MEMORY_DIR.mkdir(parents=True, exist_ok=True)
        mem_file = MEMORY_DIR / "memories.json"
        mem_file.write_text(json.dumps(self._memories, indent=2))

        pref_file = MEMORY_DIR / "preferences.json"
        pref_file.write_text(json.dumps(self._preferences, indent=2))
