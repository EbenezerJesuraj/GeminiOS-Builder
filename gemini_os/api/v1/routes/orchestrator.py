from fastapi import APIRouter

from gemini_os.models.schemas import OrchestratorRequest, OrchestratorResponse
from gemini_os.services.orchestrator import orchestrator_service

router = APIRouter()


@router.post("/evaluate", response_model=OrchestratorResponse)
def evaluate(request: OrchestratorRequest) -> OrchestratorResponse:
    return orchestrator_service.evaluate(request)
