from abc import ABC, abstractmethod

from gemini_os.models.schemas import Action, AgentRunRequest, AgentRunResponse, AgentState, AgentStatus


class BaseAgent(ABC):
    agent_id: str
    name: str
    summary: str

    def __init__(self) -> None:
        self._last_actions: list[Action] = []
        self._state = AgentState.idle

    def status(self) -> AgentStatus:
        return AgentStatus(
            agent_id=self.agent_id,
            name=self.name,
            state=self._state,
            summary=self.summary,
            last_actions=self._last_actions,
        )

    def run(self, request: AgentRunRequest) -> AgentRunResponse:
        self._state = AgentState.running
        actions = self.plan(request)
        self._last_actions = actions
        self._state = AgentState.idle
        return AgentRunResponse(
            agent_id=self.agent_id,
            summary=self.summarize(actions),
            actions=actions,
        )

    def summarize(self, actions: list[Action]) -> str:
        if not actions:
            return f"{self.name} found no immediate changes."
        return f"{self.name} recommended {len(actions)} action(s)."

    @abstractmethod
    def plan(self, request: AgentRunRequest) -> list[Action]:
        raise NotImplementedError
