"""
Gemini OS — Installer Agent

Adaptive installation assistant:
- Hardware detection and optimization
- Partition recommendation
- Driver selection
- Post-install configuration
- User preference collection
"""

import asyncio
import logging
import subprocess

from ..base import GeminiAgent, AgentCapability

logger = logging.getLogger("geminios.agent.installer")


class InstallerAgent(GeminiAgent):
    name = "installer_agent"
    description = "Adaptive OS installation and configuration"
    capabilities = [
        AgentCapability(
            name="installation",
            keywords=["install", "setup", "partition", "driver", "configure",
                       "hardware"],
            description="Assists with OS installation and hardware setup",
            priority=70,
        ),
    ]

    async def handle(self, task) -> str:
        intent = task.intent.lower()
        if "hardware" in intent or "detect" in intent:
            return await self._detect_hardware()
        elif "partition" in intent:
            return await self._recommend_partitions()
        return await self._detect_hardware()

    async def _detect_hardware(self) -> str:
        """Detect and report system hardware."""
        info = ["Gemini OS Hardware Detection:"]

        commands = {
            "CPU": ["lscpu", "--json"],
            "GPU": ["lspci", "-nn"],
            "Memory": ["free", "-h"],
            "Disks": ["lsblk", "-d", "-o", "NAME,SIZE,TYPE,MODEL"],
        }

        for label, cmd in commands.items():
            try:
                result = subprocess.run(
                    cmd, capture_output=True, text=True, timeout=10,
                )
                if result.returncode == 0:
                    if label == "GPU":
                        gpu_lines = [
                            l for l in result.stdout.split("\n")
                            if "VGA" in l or "3D" in l or "Display" in l
                        ]
                        info.append(f"  {label}: {gpu_lines[0].strip() if gpu_lines else 'Not detected'}")
                    else:
                        first_lines = result.stdout.strip().split("\n")[:3]
                        info.append(f"  {label}:")
                        for line in first_lines:
                            info.append(f"    {line.strip()}")
            except Exception:
                info.append(f"  {label}: Detection failed")

        return "\n".join(info)

    async def _recommend_partitions(self) -> str:
        """Recommend partition layout based on disk size."""
        try:
            result = subprocess.run(
                ["lsblk", "-b", "-d", "-o", "NAME,SIZE,TYPE"],
                capture_output=True, text=True, timeout=10,
            )
            if result.returncode == 0:
                lines = result.stdout.strip().split("\n")[1:]
                disks = []
                for line in lines:
                    parts = line.split()
                    if len(parts) >= 3 and parts[2] == "disk":
                        size_gb = int(parts[1]) // (1024**3)
                        disks.append((parts[0], size_gb))

                if disks:
                    disk_name, size_gb = disks[0]
                    rec = [f"Partition recommendation for /dev/{disk_name} ({size_gb} GB):"]
                    rec.append(f"  /boot/efi: 512 MB (FAT32)")
                    rec.append(f"  /: {min(size_gb - 1, 50)} GB (ext4)")
                    if size_gb > 60:
                        rec.append(f"  /home: {size_gb - 51} GB (ext4)")
                    rec.append(f"  swap: {min(8, max(2, size_gb // 16))} GB")
                    return "\n".join(rec)
        except Exception:
            pass
        return "Unable to detect disks for partition recommendation."
