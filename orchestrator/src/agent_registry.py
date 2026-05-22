"""
Gemini OS — Agent Registry

Discovers, registers, and manages the lifecycle of all AI agents.
Agents register themselves with capabilities so the orchestrator
can route tasks to the appropriate agent.
"""

import asyncio
import importlib
import logging
from pathlib import Path
from typing import Optional

logger = logging.getLogger("gemini-orchestrator.registry")

AGENTS_DIR = Path("/usr/lib/geminios/ai-agents")


class AgentCapability:
    """Describes what an agent can handle."""

    def __init__(self, name: str, keywords: list[str], priority: int = 50):
        self.name = name
        self.keywords = [kw.lower() for kw in keywords]
        self.priority = priority


class BaseAgent:
    """Base class for all Gemini OS AI agents."""

    name: str = "unnamed"
    capabilities: list[AgentCapability] = []

    async def start(self):
        logger.info(f"Agent [{self.name}] starting...")

    async def stop(self):
        logger.info(f"Agent [{self.name}] stopping...")

    async def handle(self, task) -> str:
        raise NotImplementedError

    async def health_check(self) -> bool:
        return True


class AgentRegistry:
    """Registry and lifecycle manager for all AI agents."""

    def __init__(self):
        self._agents: dict[str, BaseAgent] = {}

    async def discover_and_start(self):
        """Discover agents from the agents directory and start them."""
        logger.info("Discovering AI agents...")

        agent_modules = [
            "system_agent",
            "battery_agent",
            "thermal_agent",
            "network_agent",
            "security_agent",
            "workspace_agent",
            "memory_agent",
            "update_agent",
            "installer_agent",
        ]

        for module_name in agent_modules:
            try:
                self.register_agent_placeholder(module_name)
            except Exception as e:
                logger.warning(f"Failed to load agent {module_name}: {e}")

        for name, agent in self._agents.items():
            try:
                await agent.start()
                logger.info(f"Agent [{name}] started successfully.")
            except Exception as e:
                logger.error(f"Agent [{name}] failed to start: {e}")

    def register_agent_placeholder(self, name: str):
        """Register a placeholder agent until the full module is loaded."""
        agent = BaseAgent()
        agent.name = name
        self._agents[name] = agent

    def register(self, agent: BaseAgent):
        self._agents[agent.name] = agent
        logger.info(f"Registered agent: {agent.name}")

    def find_agent_for(self, intent: str) -> Optional[BaseAgent]:
        """Find the best agent to handle a given intent."""
        intent_lower = intent.lower()
        best_agent = None
        best_score = 0

        for agent in self._agents.values():
            for cap in agent.capabilities:
                score = sum(1 for kw in cap.keywords if kw in intent_lower)
                if score > best_score:
                    best_score = score
                    best_agent = agent

        return best_agent

    async def stop_all(self):
        """Stop all registered agents."""
        for name, agent in self._agents.items():
            try:
                await agent.stop()
            except Exception as e:
                logger.error(f"Error stopping agent [{name}]: {e}")
        self._agents.clear()

    async def health_check_all(self) -> dict[str, bool]:
        """Run health checks on all agents."""
        results = {}
        for name, agent in self._agents.items():
            try:
                results[name] = await agent.health_check()
            except Exception:
                results[name] = False
        return results
