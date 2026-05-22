# Gemini OS — AI-Native Self-Evolving Operating System

> A futuristic AI-native Linux distribution that understands your intent, optimizes itself dynamically, and restructures itself based on your prompts.

## Vision

Gemini OS is built around the idea that your operating system should be as intelligent as the AI models it runs. Every part of the OS is **fluid** — from UI themes to system services, nothing is fixed. The OS adapts, learns, and evolves based on how you use it.

**No terminal by default.** Everything is managed through the AI-native Gemini Shell (Super+Space), voice commands (Super+A), or the graphical dashboard. Terminal access is available on demand (Super+Shift+Enter) for power users.

## Key Features

### AI-Native Interface
- **Gemini Shell** — Conversational AI interface replaces the traditional terminal
- **Voice Assistant** — Speak to your OS naturally (Whisper + Piper TTS)
- **AI Dashboard** — Real-time system monitoring with glass-morphism UI
- **Predictive Launching** — AI suggests apps before you search for them

### Self-Evolving Architecture
- Restructure your OS with natural language prompts
- Automatic snapshot creation before any modification
- One-click rollback to any previous state
- AI-generated modification plans with preview mode
- All changes are audited and logged

### AI Agent System
| Agent | Responsibility |
|-------|---------------|
| System Agent | CPU governor, memory optimization, process priority |
| Battery Agent | AI power management, charging optimization |
| Thermal Agent | Temperature prediction, fan curve control |
| Network Agent | Adaptive DNS, latency-aware routing, QoS |
| Security Agent | Threat detection, file integrity monitoring |
| Workspace Agent | Smart window management, focus mode |
| Memory Agent | Semantic memory, preference learning |
| Update Agent | Smart upgrades with rollback support |
| Installer Agent | Hardware detection, adaptive installation |

### Microsoft 365 Integration
Native MO365 support — Word, Excel, PowerPoint, Outlook, OneDrive, and Teams run as dedicated Chromium webapps with OS-level integration including:
- Taskbar integration via Waybar
- System notifications through Mako
- Keyboard shortcuts via Hyprland
- AI-powered document assistance through Gemini Shell

### Local + Cloud AI
- **Ollama** for local model inference (Gemma 3, DeepSeek-Coder, LLaVA, Whisper, Qwen)
- **Gemini API** for cloud reasoning (automatic fallback)
- Multi-model routing based on task type
- GPU-aware model loading
- Context caching and session persistence

## Architecture

```
User → Gemini Shell (React + Tauri)
         ↓
     Orchestrator API (FastAPI + WebSocket)
         ↓
    ┌────┴────┐
    ↓         ↓
LLM Router  Agent Registry
    ↓         ↓
Ollama/    9 AI Agents
Gemini API   ↓
         Self-Evolve Engine
```

See [docs/architecture.md](docs/architecture.md) for the full system diagram.

## Project Structure

```
gemini-os/
├── iso/                    # ArchISO profile & build configs
│   └── profile/            # Live system overlay
├── installer/              # Calamares installer config & branding
├── orchestrator/           # Central AI orchestrator (Python/FastAPI)
│   └── src/                # Event bus, LLM router, resource manager
├── ai-agents/              # All 9 AI agents
│   ├── system_agent/
│   ├── battery_agent/
│   ├── thermal_agent/
│   ├── network_agent/
│   ├── security_agent/
│   ├── workspace_agent/
│   ├── memory_agent/
│   ├── update_agent/
│   └── installer_agent/
├── self-evolve/            # Self-restructuring engine
├── ui/                     # React + Tauri AI dashboard
│   └── src/                # Pages, components, styles
├── cloud/                  # Cloud integrations
│   ├── google/             # Gemini API, Drive, Gmail, etc.
│   └── mo365/              # Microsoft 365 webapp integration
├── services/               # systemd service definitions
├── scripts/                # Build and utility scripts
├── models/                 # Model configurations
└── docs/                   # Documentation
```

## Core Stack

| Component | Technology |
|-----------|-----------|
| Base OS | Arch Linux |
| ISO Build | archiso |
| Desktop | Hyprland (Wayland) |
| UI Framework | React + Tauri |
| AI Orchestrator | Python asyncio + FastAPI |
| Local LLM | Ollama |
| Cloud AI | Gemini API |
| Notifications | Mako |
| Status Bar | Waybar |
| Audio | PipeWire |
| Launcher | Rofi (fallback) |
| File Manager | Thunar |
| MO365 | Chromium webapps |

## Getting Started

### Prerequisites
- An x86_64 machine (bare metal or VM)
- 4GB+ RAM (8GB recommended for local AI)
- GPU recommended for local model inference

### Build the ISO

```bash
# Clone the repository
git clone https://github.com/EbenezerJesuraj/GeminiOS-Builder.git
cd GeminiOS-Builder

# Build using the script (requires Arch Linux or Docker)
chmod +x scripts/build-iso.sh
./scripts/build-iso.sh

# Or trigger the GitHub Actions workflow
# Go to Actions → "Gemini OS — Build ISO & Validate" → Run workflow
```

### Development Setup

```bash
# Install Python dependencies for the orchestrator
cd orchestrator && pip install -e .

# Install UI dependencies
cd ../ui && npm install

# Start the development servers
cd ../orchestrator && uvicorn src.api_server:app --reload --port 8420 &
cd ../ui && npm run dev
```

### Environment Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| `GEMINI_API_KEY` | Google Gemini API access | For cloud AI |
| `GOOGLE_OAUTH_TOKEN` | Google ecosystem integration | For Drive, Gmail, etc. |

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Super + Space | Open Gemini Shell (AI interface) |
| Super + A | Voice command |
| Super + R | App launcher (Rofi fallback) |
| Super + Shift + Enter | Terminal (on demand) |
| Super + C | Close window |
| Super + F | Fullscreen |
| Super + V | Toggle floating |
| Super + L | Lock screen |
| Super + 1-5 | Switch workspace |
| Print | Screenshot (area select) |

## Services

All Gemini OS services are managed via systemd:

```
gemini-orchestrator.service    # Central AI brain
gemini-router.service          # Task routing
gemini-network.service         # Network optimization
gemini-battery.service         # Power management
gemini-thermal.service         # Thermal control
gemini-memory.service          # Semantic memory
gemini-security.service        # Threat detection
gemini-self-evolve.service     # Self-restructuring engine
gemini-voice.service           # Voice assistant
```

## Roadmap

- [x] **Phase 1** — Foundation OS (Arch + Hyprland + Calamares)
- [x] **Phase 2** — AI Runtime Layer (Orchestrator + LLM Router + Agents)
- [x] **Phase 3** — Intelligent Infrastructure (Battery, Network, Thermal)
- [x] **Phase 4** — Smart UI (React + Tauri Dashboard)
- [x] **Phase 5** — Cloud + MO365 Integration
- [x] **Self-Evolve** — OS restructuring via natural language
- [ ] **Alpha 0.1** — First bootable ISO with all features integrated
- [ ] **Beta** — Hardware compatibility testing, UX refinement
- [ ] **1.0** — Production-grade release

## Security Model

- Local-first AI processing
- Zero-trust agent permissions
- Sandboxed AI agents
- Signed system updates
- TPM-backed secret vault
- AppArmor profiles for all services
- File integrity monitoring by Security Agent
- All self-evolve changes require explicit confirmation

## Contributing

Contributions welcome! See the project structure above and pick an area to work on. The most impactful areas right now:
1. AI agent intelligence improvements
2. UI/UX design for the dashboard
3. Hardware compatibility testing
4. Model optimization and quantization
5. Security hardening

## License

This project is open source. See [LICENSE](LICENSE) for details.
