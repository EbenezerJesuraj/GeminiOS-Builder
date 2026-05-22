"""
Gemini OS — Central AI Orchestrator Daemon

The orchestrator is the brain of Gemini OS. It manages:
- Agent lifecycle (start, stop, health monitoring)
- AI task routing to appropriate agents or LLM backends
- Resource allocation and priority management
- Background optimization scheduling
- Inter-agent communication via the event bus
"""

import asyncio
import json
import logging
import signal
import sys
from dataclasses import dataclass, field
from enum import Enum
from pathlib import Path
from typing import Optional

from .event_bus import EventBus, Event
from .agent_registry import AgentRegistry
from .llm_router import LLMRouter
from .resource_manager import ResourceManager

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] [GeminiOS:Orchestrator] %(levelname)s — %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("gemini-orchestrator")

CONFIG_PATH = Path("/etc/geminios/config.yaml")
STATE_DIR = Path("/var/lib/geminios/state")


class TaskPriority(Enum):
    CRITICAL = 0
    HIGH = 1
    NORMAL = 2
    LOW = 3
    BACKGROUND = 4


@dataclass
class AITask:
    task_id: str
    intent: str
    source: str
    priority: TaskPriority = TaskPriority.NORMAL
    payload: dict = field(default_factory=dict)
    result: Optional[str] = None
    status: str = "pending"


class GeminiOrchestrator:
    """Central scheduler for all AI operations in Gemini OS."""

    def __init__(self):
        self.event_bus = EventBus()
        self.agent_registry = AgentRegistry()
        self.llm_router = LLMRouter()
        self.resource_manager = ResourceManager()
        self.task_queue: asyncio.PriorityQueue = asyncio.PriorityQueue()
        self.running = False
        self._task_counter = 0

    async def start(self):
        """Boot up the orchestrator and all registered agents."""
        logger.info("Starting Gemini OS Orchestrator...")
        self.running = True

        await self.event_bus.start()
        await self.resource_manager.start()
        await self.llm_router.initialize()
        await self.agent_registry.discover_and_start()

        await self.event_bus.publish(Event(
            topic="system.orchestrator",
            action="started",
            data={"status": "operational"},
        ))

        logger.info("Orchestrator is operational. Entering main loop.")
        await self._main_loop()

    async def _main_loop(self):
        """Process AI tasks from the priority queue."""
        while self.running:
            try:
                priority_val, task = await asyncio.wait_for(
                    self.task_queue.get(), timeout=1.0
                )
                await self._process_task(task)
            except asyncio.TimeoutError:
                await self._run_background_optimizations()
            except Exception as e:
                logger.error(f"Task processing error: {e}")

    async def _process_task(self, task: AITask):
        """Route a task to the appropriate agent or LLM backend."""
        logger.info(f"Processing task [{task.task_id}]: {task.intent}")
        task.status = "processing"

        try:
            agent = self.agent_registry.find_agent_for(task.intent)
            if agent:
                task.result = await agent.handle(task)
            else:
                task.result = await self.llm_router.route(task)

            task.status = "completed"
            await self.event_bus.publish(Event(
                topic="task.completed",
                action="result",
                data={"task_id": task.task_id, "result": task.result},
            ))
        except Exception as e:
            task.status = "failed"
            logger.error(f"Task [{task.task_id}] failed: {e}")

    async def submit_task(self, intent: str, source: str = "user",
                          priority: TaskPriority = TaskPriority.NORMAL,
                          payload: Optional[dict] = None) -> str:
        """Submit a new AI task to the orchestrator."""
        self._task_counter += 1
        task_id = f"task-{self._task_counter:06d}"
        task = AITask(
            task_id=task_id,
            intent=intent,
            source=source,
            priority=priority,
            payload=payload or {},
        )
        await self.task_queue.put((priority.value, task))
        logger.info(f"Task [{task_id}] queued: {intent}")
        return task_id

    async def _run_background_optimizations(self):
        """Periodic background optimization cycle."""
        await self.resource_manager.optimize()

    async def shutdown(self):
        """Gracefully shut down the orchestrator."""
        logger.info("Shutting down Gemini OS Orchestrator...")
        self.running = False
        await self.agent_registry.stop_all()
        await self.event_bus.stop()
        logger.info("Orchestrator stopped.")


async def main():
    orchestrator = GeminiOrchestrator()

    loop = asyncio.get_event_loop()
    for sig in (signal.SIGTERM, signal.SIGINT):
        loop.add_signal_handler(sig, lambda: asyncio.create_task(orchestrator.shutdown()))

    await orchestrator.start()


if __name__ == "__main__":
    asyncio.run(main())
