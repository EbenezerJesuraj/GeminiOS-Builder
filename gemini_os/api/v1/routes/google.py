from fastapi import APIRouter

from gemini_os.models.schemas import GoogleIntegration
from gemini_os.services.google_integrations import list_google_integrations

router = APIRouter()


@router.get("/integrations", response_model=list[GoogleIntegration])
def integrations() -> list[GoogleIntegration]:
    return list_google_integrations()
