"""
Gemini OS — Orchestrator API Server

FastAPI-based REST + WebSocket API exposing orchestrator functionality
to the Gemini Shell UI and other system components.
"""

import asyncio
import json
import logging
from typing import Optional

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

logger = logging.getLogger("gemini-orchestrator.api")

app = FastAPI(
    title="Gemini OS Orchestrator API",
    version="0.1.0",
    description="Central AI orchestration API for Gemini OS",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global reference set by the orchestrator daemon at startup
orchestrator = None


class TaskRequest(BaseModel):
    intent: str
    source: str = "user"
    priority: int = 2
    payload: dict = {}


class ChatMessage(BaseModel):
    message: str
    context: dict = {}


class SelfEvolveRequest(BaseModel):
    prompt: str
    dry_run: bool = True


class SystemStatus(BaseModel):
    orchestrator: str = "unknown"
    agents: dict = {}
    resources: dict = {}
    llm_status: str = "unknown"


@app.get("/api/v1/status")
async def get_status():
    """Get system-wide status."""
    if not orchestrator:
        return {"status": "orchestrator not initialized"}

    agent_health = await orchestrator.agent_registry.health_check_all()
    resources = orchestrator.resource_manager.get_utilization_summary()

    return SystemStatus(
        orchestrator="operational",
        agents=agent_health,
        resources=resources,
        llm_status="available",
    )


@app.post("/api/v1/task")
async def submit_task(request: TaskRequest):
    """Submit an AI task to the orchestrator."""
    if not orchestrator:
        return {"error": "orchestrator not initialized"}

    from .orchestrator import TaskPriority
    priority = TaskPriority(request.priority)
    task_id = await orchestrator.submit_task(
        intent=request.intent,
        source=request.source,
        priority=priority,
        payload=request.payload,
    )
    return {"task_id": task_id, "status": "queued"}


@app.post("/api/v1/chat")
async def chat(message: ChatMessage):
    """Conversational AI endpoint for the Gemini Shell."""
    if not orchestrator:
        return {"error": "orchestrator not initialized"}

    result = await orchestrator.llm_router.route(
        type("Task", (), {
            "intent": message.message,
            "payload": {
                "system_prompt": (
                    "You are the Gemini OS AI assistant. You help users "
                    "interact with their operating system naturally. You can "
                    "launch apps, change settings, manage files, optimize "
                    "performance, and answer questions. Be concise and helpful."
                ),
                **message.context,
            },
        })()
    )
    return {"response": result}


@app.post("/api/v1/self-evolve")
async def self_evolve(request: SelfEvolveRequest):
    """Trigger the self-evolve engine to restructure the OS."""
    if not orchestrator:
        return {"error": "orchestrator not initialized"}

    task_id = await orchestrator.submit_task(
        intent=f"self-evolve: {request.prompt}",
        source="user",
        payload={"dry_run": request.dry_run, "prompt": request.prompt},
    )
    return {"task_id": task_id, "mode": "dry_run" if request.dry_run else "execute"}


@app.get("/api/v1/agents")
async def list_agents():
    """List all registered AI agents and their status."""
    if not orchestrator:
        return {"agents": []}

    health = await orchestrator.agent_registry.health_check_all()
    return {"agents": health}


@app.get("/api/v1/models")
async def list_models():
    """List available LLM models."""
    if not orchestrator:
        return {"models": []}

    return {
        "models": [
            {
                "name": m.name,
                "backend": m.backend.value,
                "purpose": m.purpose.value,
                "priority": m.priority,
            }
            for m in orchestrator.llm_router._models
        ]
    }


# WebSocket for real-time AI shell communication
connected_clients: list[WebSocket] = []


@app.websocket("/ws/shell")
async def websocket_shell(websocket: WebSocket):
    """WebSocket endpoint for real-time Gemini Shell communication."""
    await websocket.accept()
    connected_clients.append(websocket)

    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)

            if message.get("type") == "chat":
                response = await chat(ChatMessage(
                    message=message["content"],
                    context=message.get("context", {}),
                ))
                await websocket.send_json({
                    "type": "response",
                    "content": response["response"],
                })
            elif message.get("type") == "self-evolve":
                response = await self_evolve(SelfEvolveRequest(
                    prompt=message["content"],
                    dry_run=message.get("dry_run", True),
                ))
                await websocket.send_json({
                    "type": "evolve-result",
                    "content": response,
                })
    except WebSocketDisconnect:
        connected_clients.remove(websocket)
