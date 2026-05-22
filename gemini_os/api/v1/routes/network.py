from fastapi import APIRouter

from gemini_os.models.schemas import AgentRunRequest, AgentRunResponse, NetworkRouteRequest
from gemini_os.services.orchestrator import orchestrator_service

router = APIRouter()


@router.post("/route", response_model=AgentRunResponse)
def route_network(request: NetworkRouteRequest) -> AgentRunResponse:
    agent_request = AgentRunRequest(
        metrics=request.metrics,
        goal=f"Route {request.workload_type} traffic to {request.destination}",
        context={
            "destination": request.destination,
            "workload_type": request.workload_type,
            "available_networks": request.available_networks,
        },
    )
    response = orchestrator_service.run_agent("network-router", agent_request)
    assert response is not None
    return response
