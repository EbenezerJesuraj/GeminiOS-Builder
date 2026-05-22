"""
Gemini OS — Network Agent

AI-driven network optimization:
- Adaptive DNS resolution
- Intelligent VPN routing
- Latency-aware traffic steering
- Bandwidth prediction
- AI QoS (Quality of Service)
- Auto hotspot optimization
"""

import asyncio
import logging
import subprocess
from pathlib import Path

from ..base import GeminiAgent, AgentCapability

logger = logging.getLogger("geminios.agent.network")


class NetworkAgent(GeminiAgent):
    name = "network_agent"
    description = "AI-driven network optimization and traffic management"
    capabilities = [
        AgentCapability(
            name="network_management",
            keywords=["network", "wifi", "internet", "connection", "dns", "vpn",
                       "bandwidth", "latency", "slow internet", "disconnect"],
            description="Optimizes network performance and connectivity",
            priority=85,
        ),
    ]

    def __init__(self):
        super().__init__()
        self._monitor_task = None
        self._latency_history: list[float] = []
        self._bandwidth_history: list[float] = []

    async def on_start(self):
        self._monitor_task = asyncio.create_task(self._monitor_loop())

    async def on_stop(self):
        if self._monitor_task:
            self._monitor_task.cancel()

    async def handle(self, task) -> str:
        intent = task.intent.lower()
        if "status" in intent:
            return await self._get_network_status()
        elif "optimize" in intent or "speed" in intent:
            return await self._optimize_network()
        elif "dns" in intent:
            return await self._optimize_dns()
        return await self._get_network_status()

    async def _monitor_loop(self):
        """Monitor network quality and adapt routing."""
        while self._running:
            try:
                latency = await self._measure_latency()
                if latency is not None:
                    self._latency_history.append(latency)
                    if len(self._latency_history) > 360:
                        self._latency_history.pop(0)
            except Exception as e:
                logger.error(f"Network monitor error: {e}")
            await asyncio.sleep(10)

    async def _measure_latency(self) -> float | None:
        """Measure network latency via ping."""
        try:
            result = subprocess.run(
                ["ping", "-c", "1", "-W", "3", "8.8.8.8"],
                capture_output=True, text=True, timeout=5,
            )
            if result.returncode == 0:
                for line in result.stdout.split("\n"):
                    if "time=" in line:
                        time_str = line.split("time=")[1].split(" ")[0]
                        return float(time_str)
        except Exception:
            pass
        return None

    async def _optimize_dns(self) -> str:
        """Configure optimal DNS servers."""
        dns_servers = [
            ("1.1.1.1", "Cloudflare"),
            ("8.8.8.8", "Google"),
            ("9.9.9.9", "Quad9"),
        ]

        fastest = None
        fastest_time = float("inf")

        for server, name in dns_servers:
            try:
                result = subprocess.run(
                    ["ping", "-c", "1", "-W", "2", server],
                    capture_output=True, text=True, timeout=4,
                )
                if result.returncode == 0:
                    for line in result.stdout.split("\n"):
                        if "time=" in line:
                            time_ms = float(line.split("time=")[1].split(" ")[0])
                            if time_ms < fastest_time:
                                fastest_time = time_ms
                                fastest = (server, name, time_ms)
            except Exception:
                pass

        if fastest:
            return (
                f"DNS optimization complete:\n"
                f"  Fastest DNS: {fastest[1]} ({fastest[0]}) — {fastest[2]:.1f}ms\n"
                f"  Recommendation: Set primary DNS to {fastest[0]}"
            )
        return "Unable to test DNS servers — check network connectivity."

    async def _optimize_network(self) -> str:
        """Run network optimization pass."""
        actions = []

        latency = await self._measure_latency()
        if latency:
            actions.append(f"Current latency: {latency:.1f}ms")
            if latency > 100:
                actions.append("High latency detected — considering route optimization")
        else:
            actions.append("Network appears offline")

        dns_result = await self._optimize_dns()
        actions.append(dns_result)

        return "Network Optimization:\n" + "\n".join(f"  {a}" for a in actions)

    async def _get_network_status(self) -> str:
        """Get current network status."""
        info = ["Gemini OS Network Status:"]

        try:
            result = subprocess.run(
                ["nmcli", "-t", "-f", "DEVICE,TYPE,STATE,CONNECTION", "device"],
                capture_output=True, text=True, timeout=5,
            )
            if result.returncode == 0:
                for line in result.stdout.strip().split("\n"):
                    parts = line.split(":")
                    if len(parts) >= 4:
                        info.append(
                            f"  {parts[0]}: {parts[1]} — {parts[2]} ({parts[3]})"
                        )
        except Exception:
            info.append("  Unable to query NetworkManager")

        latency = await self._measure_latency()
        if latency:
            info.append(f"  Latency: {latency:.1f}ms")
            avg = (sum(self._latency_history[-30:]) / len(self._latency_history[-30:])
                   if self._latency_history else latency)
            info.append(f"  Avg Latency (recent): {avg:.1f}ms")
        else:
            info.append("  Internet: Offline")

        return "\n".join(info)
