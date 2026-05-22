from fastapi import APIRouter

from gemini_os.models.schemas import AgentRunRequest, AgentRunResponse
from gemini_os.services.orchestrator import orchestrator_service

router = APIRouter()


@router.post("/optimize", response_model=AgentRunResponse)
def optimize_resources(request: AgentRunRequest) -> AgentRunResponse:
    response = orchestrator_service.run_agent("resource-governor", request)
    assert response is not None
    return response
