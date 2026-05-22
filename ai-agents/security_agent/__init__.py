"""
Gemini OS — Security Agent

AI-driven security monitoring:
- Threat detection via system log analysis
- Sandboxed agent permission management
- File integrity monitoring
- Network anomaly detection
- Secure secret vault coordination
"""

import asyncio
import logging
import subprocess
from pathlib import Path

from ..base import GeminiAgent, AgentCapability

logger = logging.getLogger("geminios.agent.security")


class SecurityAgent(GeminiAgent):
    name = "security_agent"
    description = "AI-driven system security and threat detection"
    capabilities = [
        AgentCapability(
            name="security_monitoring",
            keywords=["security", "threat", "virus", "malware", "firewall",
                       "permission", "safe", "protect", "lock"],
            description="Monitors system security and detects threats",
            priority=95,
        ),
    ]

    def __init__(self):
        super().__init__()
        self._monitor_task = None
        self._alerts: list[dict] = []
        self._watched_paths = [
            "/etc/passwd", "/etc/shadow", "/etc/sudoers",
            "/etc/ssh/sshd_config", "/etc/geminios/config.yaml",
        ]

    async def on_start(self):
        self._monitor_task = asyncio.create_task(self._monitor_loop())
        await self._snapshot_file_integrity()

    async def on_stop(self):
        if self._monitor_task:
            self._monitor_task.cancel()

    async def handle(self, task) -> str:
        intent = task.intent.lower()
        if "status" in intent or "check" in intent:
            return await self._security_status()
        elif "scan" in intent:
            return await self._run_security_scan()
        return await self._security_status()

    async def _monitor_loop(self):
        """Continuous security monitoring."""
        while self._running:
            try:
                await self._check_file_integrity()
                await self._check_failed_logins()
            except Exception as e:
                logger.error(f"Security monitor error: {e}")
            await asyncio.sleep(60)

    async def _snapshot_file_integrity(self):
        """Take a snapshot of critical file checksums."""
        import hashlib
        self._file_hashes = {}
        for path_str in self._watched_paths:
            path = Path(path_str)
            if path.exists():
                try:
                    content = path.read_bytes()
                    self._file_hashes[path_str] = hashlib.sha256(content).hexdigest()
                except PermissionError:
                    pass

    async def _check_file_integrity(self):
        """Check if critical files have been modified."""
        import hashlib
        for path_str, original_hash in self._file_hashes.items():
            path = Path(path_str)
            if path.exists():
                try:
                    content = path.read_bytes()
                    current_hash = hashlib.sha256(content).hexdigest()
                    if current_hash != original_hash:
                        alert = {
                            "type": "file_integrity",
                            "path": path_str,
                            "severity": "high",
                            "message": f"Critical file modified: {path_str}",
                        }
                        self._alerts.append(alert)
                        logger.warning(alert["message"])
                        self._file_hashes[path_str] = current_hash
                except PermissionError:
                    pass

    async def _check_failed_logins(self):
        """Check for failed login attempts."""
        try:
            result = subprocess.run(
                ["journalctl", "-u", "sshd", "--since", "1 hour ago",
                 "--no-pager", "-q"],
                capture_output=True, text=True, timeout=10,
            )
            if result.returncode == 0:
                failed_count = result.stdout.lower().count("failed")
                if failed_count > 5:
                    self._alerts.append({
                        "type": "brute_force",
                        "severity": "high",
                        "message": f"{failed_count} failed login attempts in the last hour",
                    })
        except Exception:
            pass

    async def _run_security_scan(self) -> str:
        """Run a comprehensive security scan."""
        findings = ["Gemini OS Security Scan:"]

        # Check running services
        try:
            result = subprocess.run(
                ["systemctl", "list-units", "--type=service", "--state=running",
                 "--no-pager", "-q"],
                capture_output=True, text=True, timeout=10,
            )
            service_count = len(result.stdout.strip().split("\n"))
            findings.append(f"  Running services: {service_count}")
        except Exception:
            findings.append("  Unable to query services")

        # Check open ports
        try:
            result = subprocess.run(
                ["ss", "-tuln"],
                capture_output=True, text=True, timeout=5,
            )
            port_count = max(0, len(result.stdout.strip().split("\n")) - 1)
            findings.append(f"  Open network ports: {port_count}")
        except Exception:
            findings.append("  Unable to check ports")

        # Check recent alerts
        if self._alerts:
            findings.append(f"  Recent alerts: {len(self._alerts)}")
            for alert in self._alerts[-5:]:
                findings.append(f"    [{alert['severity'].upper()}] {alert['message']}")
        else:
            findings.append("  No security alerts")

        findings.append("  File integrity: Monitored")
        return "\n".join(findings)

    async def _security_status(self) -> str:
        """Return current security status."""
        alert_count = len(self._alerts)
        status = "secure" if alert_count == 0 else f"{alert_count} alerts"
        return (
            f"Gemini OS Security Status: {status}\n"
            f"  Monitored files: {len(self._file_hashes)}\n"
            f"  Active alerts: {alert_count}"
        )
