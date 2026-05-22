from gemini_os.core.config import settings
from gemini_os.models.schemas import GoogleIntegration


def list_google_integrations() -> list[GoogleIntegration]:
    project_status = "configured" if settings.google_cloud_project else "not_configured"
    gemini_status = "configured" if settings.gemini_api_key else "not_configured"

    return [
        GoogleIntegration(
            service="Gemini API",
            status=gemini_status,
            purpose="Cloud reasoning, multimodal assistance, installer planning, and OS revision proposals.",
            required_secrets=["GEMINI_API_KEY"],
        ),
        GoogleIntegration(
            service="Google Cloud",
            status=project_status,
            purpose="Remote orchestration, telemetry analytics, distributed jobs, and secure backup.",
            required_secrets=["GOOGLE_CLOUD_PROJECT", "GOOGLE_APPLICATION_CREDENTIALS"],
        ),
        GoogleIntegration(
            service="Firebase",
            status=project_status,
            purpose="Optional dashboard auth, device state sync, and realtime event streams.",
            required_secrets=["GOOGLE_CLOUD_PROJECT", "GOOGLE_APPLICATION_CREDENTIALS"],
        ),
        GoogleIntegration(
            service="Vertex AI",
            status=project_status,
            purpose="Managed model endpoints for heavier planner, routing, and optimization agents.",
            required_secrets=["GOOGLE_CLOUD_PROJECT", "GOOGLE_APPLICATION_CREDENTIALS"],
        ),
    ]
