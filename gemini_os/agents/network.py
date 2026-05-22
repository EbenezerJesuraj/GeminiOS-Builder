from gemini_os.agents.base import BaseAgent
from gemini_os.models.schemas import Action, AgentRunRequest, Severity


class NetworkAgent(BaseAgent):
    agent_id = "network-router"
    name = "AI Network Router"
    summary = "Chooses network policy for cloud AI, sync, updates, and low-latency tasks."

    def plan(self, request: AgentRunRequest) -> list[Action]:
        metrics = request.metrics
        actions: list[Action] = []

        if metrics.network_latency_ms is not None and metrics.network_latency_ms > 180:
            actions.append(
                Action(
                    name="prefer_local_inference",
                    description="Network latency is high; route AI tasks to local models when possible.",
                    severity=Severity.warning,
                    command="gemini-os network set-policy --ai local-first",
                    metadata={"latency_ms": metrics.network_latency_ms},
                )
            )

        if metrics.active_network and metrics.active_network.lower() in {"public-wifi", "guest"}:
            actions.append(
                Action(
                    name="enable_untrusted_network_profile",
                    description="Current network appears untrusted; restrict background sync and require secure DNS.",
                    severity=Severity.warning,
                    command="gemini-os network set-profile untrusted",
                    metadata={"network": metrics.active_network},
                )
            )

        if "cloud_sync" in metrics.running_workloads and metrics.network_latency_ms is not None:
            if metrics.network_latency_ms < 80:
                actions.append(
                    Action(
                        name="allow_cloud_sync_burst",
                        description="Latency is healthy; allow short Google service sync bursts.",
                        severity=Severity.info,
                        command="gemini-os sync set-window --mode burst",
                        metadata={"latency_ms": metrics.network_latency_ms},
                    )
                )

        return actions
