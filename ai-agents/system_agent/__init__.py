"""
Gemini OS — System Agent

Responsible for overall OS optimization:
- Performance tuning based on workload patterns
- CPU governor management
- Memory optimization
- Process prioritization
- System health monitoring
"""

import asyncio
import logging
import subprocess
from pathlib import Path

from ..base import GeminiAgent, AgentCapability

logger = logging.getLogger("geminios.agent.system")


class SystemAgent(GeminiAgent):
    name = "system_agent"
    description = "OS-level optimization and system health management"
    capabilities = [
        AgentCapability(
            name="system_optimization",
            keywords=["optimize", "speed", "performance", "slow", "fast", "cpu", "memory", "ram"],
            description="Optimizes system performance based on current workload",
            priority=90,
        ),
        AgentCapability(
            name="system_info",
            keywords=["system", "info", "status", "hardware", "specs"],
            description="Reports system information and status",
            priority=70,
        ),
    ]

    def __init__(self):
        super().__init__()
        self._optimization_interval = 30
        self._monitor_task = None

    async def on_start(self):
        self._monitor_task = asyncio.create_task(self._monitor_loop())

    async def on_stop(self):
        if self._monitor_task:
            self._monitor_task.cancel()

    async def handle(self, task) -> str:
        intent = task.intent.lower()
        if any(kw in intent for kw in ["optimize", "speed", "performance", "fast"]):
            return await self._optimize_system()
        elif any(kw in intent for kw in ["info", "status", "specs"]):
            return await self._get_system_info()
        return await self._optimize_system()

    async def _monitor_loop(self):
        """Continuously monitor and optimize system performance."""
        while self._running:
            try:
                await self._auto_optimize()
            except Exception as e:
                logger.error(f"System monitor error: {e}")
            await asyncio.sleep(self._optimization_interval)

    async def _auto_optimize(self):
        """Automatic background optimization based on current load."""
        try:
            import psutil
            cpu = psutil.cpu_percent(interval=0.5)
            mem = psutil.virtual_memory()

            if cpu < 20 and mem.percent < 50:
                await self._set_governor("powersave")
            elif cpu > 80:
                await self._set_governor("performance")
            else:
                await self._set_governor("schedutil")
        except ImportError:
            pass

    async def _set_governor(self, governor: str):
        """Set CPU frequency governor."""
        gov_path = Path("/sys/devices/system/cpu/cpu0/cpufreq/scaling_governor")
        if gov_path.exists():
            try:
                current = gov_path.read_text().strip()
                if current != governor:
                    gov_path.write_text(governor)
                    logger.info(f"CPU governor changed: {current} -> {governor}")
            except PermissionError:
                pass

    async def _optimize_system(self) -> str:
        """Run a full system optimization pass."""
        actions = []
        try:
            import psutil
            cpu = psutil.cpu_percent(interval=1)
            mem = psutil.virtual_memory()
            actions.append(f"CPU usage: {cpu:.1f}%")
            actions.append(f"Memory usage: {mem.percent:.1f}%")

            if mem.percent > 75:
                subprocess.run(
                    ["sync"],
                    capture_output=True, timeout=5,
                )
                actions.append("Synced filesystem caches")

            if cpu > 70:
                await self._set_governor("performance")
                actions.append("Switched to performance CPU governor")
            else:
                await self._set_governor("schedutil")
                actions.append("Using balanced CPU governor")

        except ImportError:
            actions.append("psutil not available — limited optimization")

        return "System optimization complete:\n" + "\n".join(f"  - {a}" for a in actions)

    async def _get_system_info(self) -> str:
        """Gather and return system information."""
        info = []
        try:
            import psutil
            cpu_count = psutil.cpu_count()
            cpu_freq = psutil.cpu_freq()
            mem = psutil.virtual_memory()
            disk = psutil.disk_usage("/")

            info.append(f"CPU: {cpu_count} cores")
            if cpu_freq:
                info.append(f"CPU Frequency: {cpu_freq.current:.0f} MHz")
            info.append(f"Memory: {mem.total // (1024**3)} GB total, {mem.percent:.1f}% used")
            info.append(f"Disk: {disk.total // (1024**3)} GB total, {disk.percent:.1f}% used")
        except ImportError:
            info.append("Limited system info (psutil not available)")

        try:
            result = subprocess.run(
                ["uname", "-r"], capture_output=True, text=True, timeout=5,
            )
            info.append(f"Kernel: {result.stdout.strip()}")
        except Exception:
            pass

        return "Gemini OS System Information:\n" + "\n".join(f"  {i}" for i in info)
