from gemini_os.agents import BatteryAgent, InstallerAgent, NetworkAgent, ResourceAgent
from gemini_os.agents.base import BaseAgent
from gemini_os.models.schemas import (
    Action,
    AgentRunRequest,
    AgentRunResponse,
    AgentStatus,
    OrchestratorRequest,
    OrchestratorResponse,
    Severity,
)


class OrchestratorService:
    def __init__(self) -> None:
        self._agents: dict[str, BaseAgent] = {
            agent.agent_id: agent
            for agent in [ResourceAgent(), NetworkAgent(), BatteryAgent(), InstallerAgent()]
        }

    def list_agents(self) -> list[AgentStatus]:
        return [agent.status() for agent in self._agents.values()]

    def get_agent(self, agent_id: str) -> BaseAgent | None:
        return self._agents.get(agent_id)

    def run_agent(self, agent_id: str, request: AgentRunRequest) -> AgentRunResponse | None:
        agent = self.get_agent(agent_id)
        if not agent:
            return None
        return agent.run(request)

    def evaluate(self, request: OrchestratorRequest) -> OrchestratorResponse:
        reports = [
            agent.run(
                AgentRunRequest(
                    metrics=request.metrics,
                    goal=request.user_prompt,
                    dry_run=request.dry_run,
                    context=request.context,
                )
            )
            for agent in self._agents.values()
        ]

        actions = self._prioritize([action for report in reports for action in report.actions])
        summary = self._summarize(actions)
        confidence = 0.82 if actions else 0.74

        return OrchestratorResponse(
            summary=summary,
            confidence=confidence,
            actions=actions,
            agent_reports=reports,
        )

    def _prioritize(self, actions: list[Action]) -> list[Action]:
        severity_rank = {
            Severity.critical: 0,
            Severity.warning: 1,
            Severity.info: 2,
        }
        return sorted(actions, key=lambda action: severity_rank[action.severity])

    def _summarize(self, actions: list[Action]) -> str:
        if not actions:
            return "System is within normal operating policy."

        critical = sum(1 for action in actions if action.severity == Severity.critical)
        warnings = sum(1 for action in actions if action.severity == Severity.warning)
        return f"Recommended {len(actions)} action(s): {critical} critical, {warnings} warning."


orchestrator_service = OrchestratorService()
