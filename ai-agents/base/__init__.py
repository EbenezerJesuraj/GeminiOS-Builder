"""
Gemini OS — Base Agent Framework

All AI agents inherit from GeminiAgent, which provides:
- Standardized lifecycle management
- Event bus integration
- Configuration loading
- Health monitoring
- Logging
"""

import asyncio
import logging
import os
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional

logger = logging.getLogger("geminios.agent")

STATE_DIR = Path("/var/lib/geminios/state")
CONFIG_DIR = Path("/etc/geminios")


@dataclass
class AgentCapability:
    name: str
    keywords: list[str]
    description: str = ""
    priority: int = 50


class GeminiAgent:
    """Base class for all Gemini OS AI agents."""

    name: str = "base"
    description: str = ""
    capabilities: list[AgentCapability] = []
    _running: bool = False

    def __init__(self):
        self.logger = logging.getLogger(f"geminios.agent.{self.name}")
        self._state: dict = {}

    async def start(self):
        """Initialize and start the agent."""
        self._running = True
        self.logger.info(f"Agent [{self.name}] started.")
        await self.on_start()

    async def stop(self):
        """Gracefully stop the agent."""
        self._running = False
        await self.on_stop()
        self.logger.info(f"Agent [{self.name}] stopped.")

    async def on_start(self):
        """Override this to add custom startup logic."""
        pass

    async def on_stop(self):
        """Override this to add custom shutdown logic."""
        pass

    async def handle(self, task) -> str:
        """Handle an AI task. Override in subclasses."""
        raise NotImplementedError(f"Agent [{self.name}] has no handler.")

    async def health_check(self) -> bool:
        """Return True if the agent is healthy."""
        return self._running

    async def save_state(self, key: str, value):
        """Persist agent state to disk."""
        import json
        state_file = STATE_DIR / f"{self.name}.json"
        state_file.parent.mkdir(parents=True, exist_ok=True)
        try:
            if state_file.exists():
                self._state = json.loads(state_file.read_text())
        except Exception:
            self._state = {}
        self._state[key] = value
        state_file.write_text(json.dumps(self._state, indent=2))

    async def load_state(self, key: str, default=None):
        """Load persisted agent state."""
        import json
        state_file = STATE_DIR / f"{self.name}.json"
        if state_file.exists():
            try:
                self._state = json.loads(state_file.read_text())
                return self._state.get(key, default)
            except Exception:
                pass
        return default
