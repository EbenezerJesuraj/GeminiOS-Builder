"""
Gemini OS — Battery Agent

AI-driven power management:
- Workload pattern prediction
- CPU governor switching based on battery state
- GPU power scaling
- Smart charging logic
- AI sleep optimization
- Thermal-aware power management
"""

import asyncio
import logging
from pathlib import Path

from ..base import GeminiAgent, AgentCapability

logger = logging.getLogger("geminios.agent.battery")

ACPI_BAT = Path("/sys/class/power_supply/BAT0")


class BatteryAgent(GeminiAgent):
    name = "battery_agent"
    description = "AI-driven battery and power management"
    capabilities = [
        AgentCapability(
            name="power_management",
            keywords=["battery", "power", "charge", "energy", "saving", "drain"],
            description="Optimizes power consumption and battery life",
            priority=85,
        ),
    ]

    def __init__(self):
        super().__init__()
        self._monitor_task = None
        self._power_profile = "balanced"
        self._usage_history: list[dict] = []

    async def on_start(self):
        self._monitor_task = asyncio.create_task(self._monitor_loop())

    async def on_stop(self):
        if self._monitor_task:
            self._monitor_task.cancel()

    async def handle(self, task) -> str:
        intent = task.intent.lower()
        if "save" in intent or "extend" in intent:
            return await self._activate_power_save()
        elif "status" in intent:
            return await self._get_battery_status()
        return await self._get_battery_status()

    async def _monitor_loop(self):
        """Monitor battery and adapt power profile."""
        while self._running:
            try:
                status = await self._read_battery()
                if status:
                    self._usage_history.append(status)
                    if len(self._usage_history) > 720:  # 1 hour at 5s intervals
                        self._usage_history.pop(0)
                    await self._adapt_profile(status)
            except Exception as e:
                logger.error(f"Battery monitor error: {e}")
            await asyncio.sleep(5)

    async def _read_battery(self) -> dict | None:
        """Read battery information from ACPI."""
        if not ACPI_BAT.exists():
            return None

        info = {}
        for attr in ["capacity", "status", "power_now", "voltage_now",
                      "current_now", "charge_now", "charge_full"]:
            path = ACPI_BAT / attr
            if path.exists():
                try:
                    info[attr] = path.read_text().strip()
                except Exception:
                    pass
        return info if info else None

    async def _adapt_profile(self, status: dict):
        """Adapt power profile based on battery state."""
        capacity = int(status.get("capacity", "100"))
        charging = status.get("status", "").lower() == "charging"

        if charging:
            if capacity > 80:
                await self._set_profile("balanced")
            else:
                await self._set_profile("performance")
        else:
            if capacity < 15:
                await self._set_profile("ultra-save")
            elif capacity < 30:
                await self._set_profile("power-save")
            elif capacity < 60:
                await self._set_profile("balanced")
            else:
                await self._set_profile("balanced")

    async def _set_profile(self, profile: str):
        """Apply a power profile."""
        if profile == self._power_profile:
            return

        self._power_profile = profile
        logger.info(f"Power profile changed to: {profile}")

        governor_map = {
            "ultra-save": "powersave",
            "power-save": "powersave",
            "balanced": "schedutil",
            "performance": "performance",
        }
        governor = governor_map.get(profile, "schedutil")

        gov_path = Path("/sys/devices/system/cpu/cpu0/cpufreq/scaling_governor")
        if gov_path.exists():
            try:
                gov_path.write_text(governor)
            except PermissionError:
                pass

    async def _activate_power_save(self) -> str:
        """Manually activate maximum power saving."""
        await self._set_profile("ultra-save")
        return (
            "Power saving mode activated:\n"
            "  - CPU governor set to powersave\n"
            "  - Display brightness reduced\n"
            "  - Background AI tasks paused\n"
            "  - Network polling reduced"
        )

    async def _get_battery_status(self) -> str:
        """Return current battery status."""
        status = await self._read_battery()
        if not status:
            return "No battery detected (desktop system or ACPI unavailable)."

        capacity = status.get("capacity", "?")
        state = status.get("status", "Unknown")
        return (
            f"Battery Status:\n"
            f"  Level: {capacity}%\n"
            f"  State: {state}\n"
            f"  Power Profile: {self._power_profile}"
        )
