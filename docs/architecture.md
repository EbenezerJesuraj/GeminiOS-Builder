# Gemini OS — Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Gemini OS Desktop (Hyprland)                  │
│                                                                  │
│  ┌──────────────┐  ┌───────────┐  ┌────────────┐  ┌──────────┐ │
│  │ Gemini Shell  │  │  Waybar   │  │  MO365 Hub │  │ Settings │ │
│  │ (AI Chat UI)  │  │ (Status)  │  │ (Webapps)  │  │  (Config)│ │
│  └──────┬───────┘  └─────┬─────┘  └─────┬──────┘  └────┬─────┘ │
│         │                │               │              │        │
│  ┌──────┴────────────────┴───────────────┴──────────────┴──────┐ │
│  │              React + Tauri AI Dashboard                      │ │
│  └──────────────────────┬──────────────────────────────────────┘ │
│                         │ REST + WebSocket                       │
├─────────────────────────┼────────────────────────────────────────┤
│                         │                                        │
│  ┌──────────────────────┴──────────────────────────────────────┐ │
│  │              Orchestrator API (FastAPI)                      │ │
│  │                                                              │ │
│  │  ┌─────────────┐  ┌───────────┐  ┌──────────────────────┐  │ │
│  │  │ LLM Router  │  │ Event Bus │  │  Resource Manager     │  │ │
│  │  │ (Ollama/    │  │ (Pub/Sub) │  │  (CPU/GPU/Memory)    │  │ │
│  │  │  Gemini)    │  │           │  │                      │  │ │
│  │  └─────────────┘  └───────────┘  └──────────────────────┘  │ │
│  └──────────────────────┬──────────────────────────────────────┘ │
│                         │                                        │
│  ┌──────────────────────┴──────────────────────────────────────┐ │
│  │                    AI Agent Layer                            │ │
│  │                                                              │ │
│  │  ┌────────┐ ┌────────┐ ┌─────────┐ ┌─────────┐ ┌────────┐ │ │
│  │  │System  │ │Battery │ │Thermal  │ │Network  │ │Security│ │ │
│  │  │Agent   │ │Agent   │ │Agent    │ │Agent    │ │Agent   │ │ │
│  │  └────────┘ └────────┘ └─────────┘ └─────────┘ └────────┘ │ │
│  │  ┌────────┐ ┌────────┐ ┌─────────┐ ┌─────────┐            │ │
│  │  │Work-   │ │Memory  │ │Update   │ │Installer│            │ │
│  │  │space   │ │Agent   │ │Agent    │ │Agent    │            │ │
│  │  └────────┘ └────────┘ └─────────┘ └─────────┘            │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                Self-Evolving Engine                          │ │
│  │  ┌───────────┐  ┌──────────────┐  ┌───────────────────┐    │ │
│  │  │ Snapshot   │  │ Plan         │  │ Rollback          │    │ │
│  │  │ Manager    │  │ Generator    │  │ Manager           │    │ │
│  │  └───────────┘  └──────────────┘  └───────────────────┘    │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌──────────────────────┐  ┌──────────────────────────────────┐ │
│  │  Cloud Integration   │  │  Microsoft 365 Integration       │ │
│  │  (Google/Gemini API) │  │  (Chromium Webapps)              │ │
│  └──────────────────────┘  └──────────────────────────────────┘ │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│                    Arch Linux Base System                         │
│  ┌───────┐ ┌──────────┐ ┌────────┐ ┌────────┐ ┌──────────────┐ │
│  │Kernel │ │systemd   │ │PipeWire│ │Network │ │ Ollama       │ │
│  │       │ │          │ │        │ │Manager │ │ (Local LLM)  │ │
│  └───────┘ └──────────┘ └────────┘ └────────┘ └──────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

## Service Dependencies

```
ollama.service
    └── gemini-orchestrator.service
        ├── gemini-router.service
        ├── gemini-network.service
        ├── gemini-battery.service
        ├── gemini-thermal.service
        ├── gemini-memory.service
        ├── gemini-security.service
        ├── gemini-self-evolve.service
        └── gemini-voice.service
```

## Data Flow

1. **User Input** → Gemini Shell (React UI) or Voice Assistant
2. **API Request** → Orchestrator REST/WebSocket API
3. **Task Routing** → LLM Router selects model + Agent Registry finds handler
4. **Execution** → Agent processes task or LLM generates response
5. **Response** → Sent back through WebSocket to UI
6. **Self-Evolve** → If structural change requested, goes through snapshot → plan → execute → validate pipeline
