from fastapi import APIRouter, HTTPException

from gemini_os.models.schemas import AgentRunRequest, AgentRunResponse, AgentStatus
from gemini_os.services.orchestrator import orchestrator_service

router = APIRouter()


@router.get("", response_model=list[AgentStatus])
def list_agents() -> list[AgentStatus]:
    return orchestrator_service.list_agents()


@router.get("/{agent_id}", response_model=AgentStatus)
def get_agent(agent_id: str) -> AgentStatus:
    agent = orchestrator_service.get_agent(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent.status()


@router.post("/{agent_id}/run", response_model=AgentRunResponse)
def run_agent(agent_id: str, request: AgentRunRequest) -> AgentRunResponse:
    response = orchestrator_service.run_agent(agent_id, request)
    if not response:
        raise HTTPException(status_code=404, detail="Agent not found")
    return response
