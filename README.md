# Gemini OS Control Plane

Python REST API foundation for the Gemini OS / Archon OS AI-native operating system project.

This is the backend control plane for:

- AI orchestrator
- resource governor
- network routing advisor
- battery and thermal policy agent
- prompt-driven installer planner
- Google service integration layer
- future local/cloud ML model integrations

## Run Locally

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -e ".[dev]"
uvicorn gemini_os.main:app --reload
```

API docs:

```text
http://127.0.0.1:8000/docs
```

Dashboard:

```text
http://127.0.0.1:8000/
```

## Current Scope

This is a production-shaped MVP, not the final OS. The agents use deterministic policy logic today, with clear extension points for ML models, local Ollama/Gemma inference, Gemini APIs, and Google Cloud services.

## UI Direction

The included dashboard follows the Archon OS kickoff blueprint: an AI-first control surface for the five phases of the project. It uses a Google I/O-inspired aesthetic with fluid spacing, frosted glass panels, translucent status surfaces, and colorful signal accents while keeping the UX practical for engineering work.

## Main Endpoints

- `GET /health`
- `GET /api/v1/agents`
- `POST /api/v1/agents/{agent_id}/run`
- `POST /api/v1/orchestrator/evaluate`
- `POST /api/v1/resources/optimize`
- `POST /api/v1/network/route`
- `POST /api/v1/battery/optimize`
- `POST /api/v1/installer/plan`
- `GET /api/v1/google/integrations`
