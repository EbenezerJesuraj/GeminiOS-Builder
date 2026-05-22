from fastapi import APIRouter

from gemini_os.api.v1.routes import agents, google, installer, network, orchestrator, resources

api_router = APIRouter()
api_router.include_router(agents.router, prefix="/agents", tags=["agents"])
api_router.include_router(orchestrator.router, prefix="/orchestrator", tags=["orchestrator"])
api_router.include_router(resources.router, prefix="/resources", tags=["resources"])
api_router.include_router(network.router, prefix="/network", tags=["network"])
api_router.include_router(installer.router, prefix="/installer", tags=["installer"])
api_router.include_router(google.router, prefix="/google", tags=["google"])
