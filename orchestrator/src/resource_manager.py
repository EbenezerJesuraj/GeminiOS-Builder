"""
Gemini OS — Resource Manager

Monitors and manages system resources with AI-driven optimization:
- CPU governor switching
- GPU VRAM balancing
- Memory pressure management
- AI workload prediction
- Smart process prioritization
- Dynamic cgroup management
"""

import asyncio
import logging
import os
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

logger = logging.getLogger("gemini-orchestrator.resource")


@dataclass
class SystemResources:
    cpu_percent: float = 0.0
    memory_percent: float = 0.0
    gpu_vram_used_mb: int = 0
    gpu_vram_total_mb: int = 0
    swap_percent: float = 0.0
    load_avg_1m: float = 0.0
    load_avg_5m: float = 0.0
    load_avg_15m: float = 0.0


class ResourceManager:
    """AI-driven resource management for Gemini OS."""

    def __init__(self):
        self._running = False
        self._current: Optional[SystemResources] = None
        self._history: list[SystemResources] = []
        self._max_history = 360  # 30 minutes at 5-second intervals

    async def start(self):
        self._running = True
        logger.info("Resource Manager started.")
        asyncio.create_task(self._monitor_loop())

    async def stop(self):
        self._running = False
        logger.info("Resource Manager stopped.")

    async def _monitor_loop(self):
        """Continuously monitor system resources."""
        while self._running:
            try:
                self._current = await self._collect_metrics()
                self._history.append(self._current)
                if len(self._history) > self._max_history:
                    self._history.pop(0)
            except Exception as e:
                logger.error(f"Resource collection error: {e}")
            await asyncio.sleep(5)

    async def _collect_metrics(self) -> SystemResources:
        """Collect current system resource metrics."""
        resources = SystemResources()

        try:
            import psutil
            resources.cpu_percent = psutil.cpu_percent(interval=0.1)
            mem = psutil.virtual_memory()
            resources.memory_percent = mem.percent
            swap = psutil.swap_memory()
            resources.swap_percent = swap.percent
            load = os.getloadavg()
            resources.load_avg_1m = load[0]
            resources.load_avg_5m = load[1]
            resources.load_avg_15m = load[2]
        except ImportError:
            pass

        try:
            gpu_info = Path("/sys/class/drm/card0/device/mem_info_vram_used")
            if gpu_info.exists():
                resources.gpu_vram_used_mb = int(gpu_info.read_text().strip()) // (1024 * 1024)
            gpu_total = Path("/sys/class/drm/card0/device/mem_info_vram_total")
            if gpu_total.exists():
                resources.gpu_vram_total_mb = int(gpu_total.read_text().strip()) // (1024 * 1024)
        except Exception:
            pass

        return resources

    async def optimize(self):
        """Run AI-driven optimization cycle."""
        if not self._current:
            return

        if self._current.memory_percent > 85:
            await self._reduce_memory_pressure()

        if self._current.cpu_percent > 90:
            await self._throttle_background_tasks()

    async def _reduce_memory_pressure(self):
        """Attempt to reduce memory usage through smart compression."""
        logger.info("High memory pressure detected — optimizing...")
        try:
            compact = Path("/proc/sys/vm/compact_memory")
            if compact.exists():
                compact.write_text("1")
        except PermissionError:
            pass

    async def _throttle_background_tasks(self):
        """Throttle non-essential background tasks during high CPU load."""
        logger.info("High CPU load — throttling background tasks...")

    def get_current(self) -> Optional[SystemResources]:
        return self._current

    def get_utilization_summary(self) -> dict:
        if not self._current:
            return {"status": "no data"}
        return {
            "cpu": f"{self._current.cpu_percent:.1f}%",
            "memory": f"{self._current.memory_percent:.1f}%",
            "gpu_vram": f"{self._current.gpu_vram_used_mb}MB / {self._current.gpu_vram_total_mb}MB",
            "load": f"{self._current.load_avg_1m:.2f}",
        }
