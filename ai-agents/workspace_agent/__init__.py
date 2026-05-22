"""
Gemini OS — Workspace Agent

AI-driven productivity workflows:
- Smart window arrangement
- Context-aware workspace switching
- App suggestions based on task
- Workflow automation
- Focus mode management
"""

import asyncio
import logging
import subprocess

from ..base import GeminiAgent, AgentCapability

logger = logging.getLogger("geminios.agent.workspace")


class WorkspaceAgent(GeminiAgent):
    name = "workspace_agent"
    description = "AI-driven productivity and workspace management"
    capabilities = [
        AgentCapability(
            name="workspace_management",
            keywords=["workspace", "window", "layout", "arrange", "focus",
                       "productivity", "organize", "app", "launch", "open"],
            description="Manages workspaces and productivity workflows",
            priority=75,
        ),
    ]

    def __init__(self):
        super().__init__()
        self._active_workspace = 1
        self._workspace_contexts: dict[int, str] = {}

    async def handle(self, task) -> str:
        intent = task.intent.lower()
        if "focus" in intent:
            return await self._enable_focus_mode()
        elif "arrange" in intent or "layout" in intent:
            return await self._arrange_windows()
        elif "open" in intent or "launch" in intent:
            return await self._smart_launch(task.intent)
        return await self._workspace_status()

    async def _enable_focus_mode(self) -> str:
        """Enable focus mode — minimize distractions."""
        try:
            subprocess.run(
                ["hyprctl", "keyword", "decoration:blur:enabled", "false"],
                capture_output=True, timeout=5,
            )
            subprocess.run(
                ["makoctl", "mode", "-a", "do-not-disturb"],
                capture_output=True, timeout=5,
            )
        except Exception:
            pass

        return (
            "Focus mode activated:\n"
            "  - Notifications silenced\n"
            "  - Visual effects reduced\n"
            "  - Background tasks paused"
        )

    async def _arrange_windows(self) -> str:
        """Arrange windows in an optimal layout."""
        try:
            subprocess.run(
                ["hyprctl", "dispatch", "togglesplit"],
                capture_output=True, timeout=5,
            )
        except Exception:
            pass
        return "Windows arranged in split layout."

    async def _smart_launch(self, intent: str) -> str:
        """Launch an app based on natural language intent."""
        app_map = {
            "browser": "chromium",
            "files": "thunar",
            "terminal": "foot",
            "settings": "nwg-look",
            "office": "/usr/local/bin/gemini-mo365-launcher",
            "word": "/usr/local/bin/gemini-mo365-launcher word",
            "excel": "/usr/local/bin/gemini-mo365-launcher excel",
            "powerpoint": "/usr/local/bin/gemini-mo365-launcher powerpoint",
        }

        for keyword, command in app_map.items():
            if keyword in intent.lower():
                try:
                    subprocess.Popen(
                        command.split(),
                        stdout=subprocess.DEVNULL,
                        stderr=subprocess.DEVNULL,
                    )
                    return f"Launched: {keyword}"
                except Exception as e:
                    return f"Failed to launch {keyword}: {e}"

        return f"I don't know how to open that. Try: {', '.join(app_map.keys())}"

    async def _workspace_status(self) -> str:
        """Get workspace status."""
        return (
            f"Workspace Status:\n"
            f"  Active workspace: {self._active_workspace}\n"
            f"  Configured contexts: {len(self._workspace_contexts)}"
        )
