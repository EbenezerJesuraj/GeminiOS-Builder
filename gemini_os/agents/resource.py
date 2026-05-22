from gemini_os.agents.base import BaseAgent
from gemini_os.models.schemas import Action, AgentRunRequest, Severity


class ResourceAgent(BaseAgent):
    agent_id = "resource-governor"
    name = "AI Resource Governor"
    summary = "Balances CPU, memory, disk pressure, and AI workload priority."

    def plan(self, request: AgentRunRequest) -> list[Action]:
        metrics = request.metrics
        actions: list[Action] = []

        if metrics.cpu_percent >= 90:
            actions.append(
                Action(
                    name="throttle_background_workloads",
                    description="CPU pressure is high; lower priority of non-interactive workloads.",
                    severity=Severity.warning,
                    command="renice +10 <background-pids>",
                    metadata={"cpu_percent": metrics.cpu_percent},
                )
            )

        if metrics.memory_percent >= 85:
            actions.append(
                Action(
                    name="reclaim_memory",
                    description="Memory pressure is high; pause cache-heavy jobs and request compaction.",
                    severity=Severity.warning,
                    command="systemctl restart gemini-cache-pruner.service",
                    metadata={"memory_percent": metrics.memory_percent},
                )
            )

        if metrics.disk_percent >= 90:
            actions.append(
                Action(
                    name="clean_system_cache",
                    description="Disk usage is high; clean package caches and old telemetry bundles.",
                    severity=Severity.critical,
                    command="paccache -r && journalctl --vacuum-time=7d",
                    metadata={"disk_percent": metrics.disk_percent},
                )
            )

        if "local_inference" in metrics.running_workloads and metrics.cpu_percent >= 75:
            actions.append(
                Action(
                    name="move_inference_to_low_priority_pool",
                    description="Local inference is competing with foreground work; shift it to a lower-priority pool.",
                    severity=Severity.info,
                    command="systemctl set-property ollama.service CPUWeight=40 IOWeight=40",
                    metadata={"workload": "local_inference"},
                )
            )

        return actions
