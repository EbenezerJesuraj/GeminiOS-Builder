from fastapi import APIRouter

from gemini_os.models.schemas import Action, AgentRunRequest, InstallerPlanRequest, SystemMetrics
from gemini_os.services.orchestrator import orchestrator_service

router = APIRouter()


@router.post("/plan", response_model=list[Action])
def plan_install(request: InstallerPlanRequest) -> list[Action]:
    agent_request = AgentRunRequest(
        metrics=SystemMetrics(cpu_percent=0, memory_percent=0, disk_percent=0),
        goal=request.prompt,
        context=request.model_dump(),
    )
    response = orchestrator_service.run_agent("installer-agent", agent_request)
    assert response is not None
    actions = response.actions

    if request.enable_google_services:
        actions.append(
            Action(
                name="configure_google_services",
                description="Prepare Gemini API, Google Cloud project binding, and optional Firebase sync.",
                command="gemini-installer configure-google-services",
                metadata={"requires_user_credentials": True},
            )
        )

    if request.enable_local_ai:
        actions.append(
            Action(
                name="configure_local_ai",
                description="Install local inference runtime, embedding model, and offline fallback policy.",
                command="gemini-installer configure-local-ai",
                metadata={"runtime": "ollama"},
            )
        )

    return actions
