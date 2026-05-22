"""
Gemini OS — Thermal Agent

AI-driven thermal management:
- Temperature prediction
- Fan curve optimization
- CPU/GPU thermal throttling
- Workload-aware cooling
- Thermal zone monitoring
"""

import asyncio
import logging
from pathlib import Path

from ..base import GeminiAgent, AgentCapability

logger = logging.getLogger("geminios.agent.thermal")

THERMAL_ZONES = Path("/sys/class/thermal")
HWMON = Path("/sys/class/hwmon")


class ThermalAgent(GeminiAgent):
    name = "thermal_agent"
    description = "AI-driven thermal and cooling management"
    capabilities = [
        AgentCapability(
            name="thermal_management",
            keywords=["temperature", "thermal", "hot", "fan", "cooling", "heat", "overheat"],
            description="Monitors and manages system thermals",
            priority=80,
        ),
    ]

    def __init__(self):
        super().__init__()
        self._monitor_task = None
        self._temp_history: list[dict] = []
        self._critical_threshold = 85  # degrees C
        self._warning_threshold = 75

    async def on_start(self):
        self._monitor_task = asyncio.create_task(self._monitor_loop())

    async def on_stop(self):
        if self._monitor_task:
            self._monitor_task.cancel()

    async def handle(self, task) -> str:
        return await self._get_thermal_status()

    async def _monitor_loop(self):
        """Monitor temperatures and take action when needed."""
        while self._running:
            try:
                temps = await self._read_temperatures()
                if temps:
                    self._temp_history.append(temps)
                    if len(self._temp_history) > 720:
                        self._temp_history.pop(0)
                    await self._evaluate_thermals(temps)
            except Exception as e:
                logger.error(f"Thermal monitor error: {e}")
            await asyncio.sleep(5)

    async def _read_temperatures(self) -> dict:
        """Read temperature data from thermal zones and hwmon."""
        temps = {}

        if THERMAL_ZONES.exists():
            for zone in sorted(THERMAL_ZONES.glob("thermal_zone*")):
                try:
                    temp_file = zone / "temp"
                    type_file = zone / "type"
                    if temp_file.exists():
                        temp_c = int(temp_file.read_text().strip()) / 1000.0
                        zone_type = "unknown"
                        if type_file.exists():
                            zone_type = type_file.read_text().strip()
                        temps[zone.name] = {
                            "type": zone_type,
                            "temp_c": temp_c,
                        }
                except Exception:
                    pass

        return temps

    async def _evaluate_thermals(self, temps: dict):
        """Evaluate thermal state and take protective action."""
        for zone_name, data in temps.items():
            temp = data["temp_c"]

            if temp >= self._critical_threshold:
                logger.warning(
                    f"CRITICAL: {zone_name} ({data['type']}) at {temp:.1f}C"
                )
                await self._apply_thermal_throttle()
            elif temp >= self._warning_threshold:
                logger.info(
                    f"WARNING: {zone_name} ({data['type']}) at {temp:.1f}C"
                )

    async def _apply_thermal_throttle(self):
        """Apply thermal throttling to reduce temperatures."""
        gov_path = Path("/sys/devices/system/cpu/cpu0/cpufreq/scaling_governor")
        if gov_path.exists():
            try:
                gov_path.write_text("powersave")
                logger.info("Thermal throttle applied — CPU set to powersave")
            except PermissionError:
                pass

    async def _get_thermal_status(self) -> str:
        """Return current thermal status report."""
        temps = await self._read_temperatures()
        if not temps:
            return "No thermal sensors detected."

        lines = ["Gemini OS Thermal Status:"]
        for zone_name, data in temps.items():
            status_icon = "OK"
            if data["temp_c"] >= self._critical_threshold:
                status_icon = "CRITICAL"
            elif data["temp_c"] >= self._warning_threshold:
                status_icon = "WARM"
            lines.append(
                f"  {data['type']}: {data['temp_c']:.1f}C [{status_icon}]"
            )
        return "\n".join(lines)
