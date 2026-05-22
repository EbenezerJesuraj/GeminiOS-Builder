"""
Gemini OS — Microsoft 365 Integration

Native MO365 support via webapp mode:
- Word, Excel, PowerPoint via Chromium webapp
- Outlook email client
- OneDrive cloud sync
- Teams integration
- AI-powered document assistance through Gemini Shell

Apps run as dedicated Chromium windows with OS-level integration
including taskbar icons, notifications, and file associations.
"""

import asyncio
import logging
import subprocess
from pathlib import Path

logger = logging.getLogger("geminios.cloud.mo365")

MO365_APPS = {
    "word": {
        "name": "Microsoft Word",
        "url": "https://www.office.com/launch/word",
        "icon": "ms-word",
        "class": "gemini-mo365-word",
    },
    "excel": {
        "name": "Microsoft Excel",
        "url": "https://www.office.com/launch/excel",
        "icon": "ms-excel",
        "class": "gemini-mo365-excel",
    },
    "powerpoint": {
        "name": "Microsoft PowerPoint",
        "url": "https://www.office.com/launch/powerpoint",
        "icon": "ms-powerpoint",
        "class": "gemini-mo365-ppt",
    },
    "outlook": {
        "name": "Microsoft Outlook",
        "url": "https://outlook.office.com",
        "icon": "ms-outlook",
        "class": "gemini-mo365-outlook",
    },
    "onedrive": {
        "name": "Microsoft OneDrive",
        "url": "https://onedrive.live.com",
        "icon": "ms-onedrive",
        "class": "gemini-mo365-onedrive",
    },
    "teams": {
        "name": "Microsoft Teams",
        "url": "https://teams.microsoft.com",
        "icon": "ms-teams",
        "class": "gemini-mo365-teams",
    },
}

MO365_PROFILE_DIR = Path.home() / ".config" / "geminios" / "mo365-profile"


class MO365Integration:
    """Manages Microsoft 365 webapp integrations."""

    def __init__(self):
        self._running_apps: dict[str, subprocess.Popen] = {}

    async def launch(self, app_name: str = "") -> str:
        """Launch an MO365 app in Chromium webapp mode."""
        app_key = app_name.lower().strip()

        if not app_key or app_key == "hub":
            return await self._launch_hub()

        if app_key not in MO365_APPS:
            available = ", ".join(MO365_APPS.keys())
            return f"Unknown MO365 app: {app_key}. Available: {available}"

        app = MO365_APPS[app_key]
        return await self._launch_webapp(app_key, app)

    async def _launch_webapp(self, key: str, app: dict) -> str:
        """Launch a single MO365 app as a Chromium webapp."""
        MO365_PROFILE_DIR.mkdir(parents=True, exist_ok=True)

        cmd = [
            "chromium",
            f"--app={app['url']}",
            f"--class={app['class']}",
            f"--user-data-dir={MO365_PROFILE_DIR}",
            "--enable-features=OverlayScrollbar",
            "--disable-background-timer-throttling",
        ]

        try:
            proc = subprocess.Popen(
                cmd,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
            self._running_apps[key] = proc
            return f"Launched {app['name']}"
        except Exception as e:
            return f"Failed to launch {app['name']}: {e}"

    async def _launch_hub(self) -> str:
        """Launch the MO365 hub (office.com)."""
        MO365_PROFILE_DIR.mkdir(parents=True, exist_ok=True)

        cmd = [
            "chromium",
            "--app=https://www.office.com",
            "--class=gemini-mo365-hub",
            f"--user-data-dir={MO365_PROFILE_DIR}",
        ]

        try:
            subprocess.Popen(
                cmd,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
            return "Launched Microsoft 365 Hub"
        except Exception as e:
            return f"Failed to launch MO365 Hub: {e}"

    async def close(self, app_name: str) -> str:
        """Close a running MO365 app."""
        app_key = app_name.lower().strip()
        if app_key in self._running_apps:
            self._running_apps[app_key].terminate()
            del self._running_apps[app_key]
            return f"Closed {app_name}"
        return f"{app_name} is not running."

    def get_running(self) -> list[str]:
        """Get list of running MO365 apps."""
        return list(self._running_apps.keys())
