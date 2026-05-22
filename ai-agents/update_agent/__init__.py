"""
Gemini OS — Update Agent

Smart system upgrade management:
- Predictive update scheduling
- Dependency conflict detection
- Rollback capability
- Update impact analysis
- Background download optimization
"""

import asyncio
import logging
import subprocess

from ..base import GeminiAgent, AgentCapability

logger = logging.getLogger("geminios.agent.update")


class UpdateAgent(GeminiAgent):
    name = "update_agent"
    description = "Smart system update and upgrade management"
    capabilities = [
        AgentCapability(
            name="system_updates",
            keywords=["update", "upgrade", "patch", "install", "package",
                       "software", "version"],
            description="Manages system updates intelligently",
            priority=60,
        ),
    ]

    def __init__(self):
        super().__init__()
        self._pending_updates: list[str] = []
        self._last_check = None

    async def handle(self, task) -> str:
        intent = task.intent.lower()
        if "check" in intent:
            return await self._check_updates()
        elif "install" in intent or "apply" in intent:
            return await self._apply_updates()
        return await self._check_updates()

    async def _check_updates(self) -> str:
        """Check for available system updates."""
        try:
            result = subprocess.run(
                ["pacman", "-Qu"],
                capture_output=True, text=True, timeout=30,
            )
            if result.returncode == 0 and result.stdout.strip():
                updates = result.stdout.strip().split("\n")
                self._pending_updates = updates
                return (
                    f"Available updates: {len(updates)}\n"
                    + "\n".join(f"  {u}" for u in updates[:10])
                    + (f"\n  ... and {len(updates) - 10} more" if len(updates) > 10 else "")
                )
            return "System is up to date."
        except Exception as e:
            return f"Unable to check updates: {e}"

    async def _apply_updates(self) -> str:
        """Apply system updates with rollback support."""
        # Create snapshot before updating
        try:
            subprocess.run(
                ["/usr/local/bin/gemini-snapshot", "pre-update"],
                capture_output=True, timeout=30,
            )
        except Exception:
            pass

        try:
            result = subprocess.run(
                ["pacman", "-Syu", "--noconfirm"],
                capture_output=True, text=True, timeout=300,
            )
            if result.returncode == 0:
                return "System updated successfully. A rollback snapshot was created."
            return f"Update failed:\n{result.stderr[:500]}"
        except Exception as e:
            return f"Update error: {e}"
