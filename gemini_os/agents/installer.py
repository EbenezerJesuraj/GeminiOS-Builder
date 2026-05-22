from gemini_os.agents.base import BaseAgent
from gemini_os.models.schemas import Action, AgentRunRequest, Severity


class InstallerAgent(BaseAgent):
    agent_id = "installer-agent"
    name = "Gemini Installer Agent"
    summary = "Plans safe OS installation and prompt-driven system revision workflows."

    def plan(self, request: AgentRunRequest) -> list[Action]:
        goal = (request.goal or "").lower()
        actions: list[Action] = [
            Action(
                name="collect_installation_facts",
                description="Inspect disks, firmware mode, network, GPU, and user preferences before install.",
                severity=Severity.info,
                command="gemini-installer detect-hardware --json",
            )
        ]

        if "install" in goal or "os" in goal:
            actions.extend(
                [
                    Action(
                        name="create_install_plan",
                        description="Generate a human-reviewable disk, bootloader, desktop, and AI runtime plan.",
                        severity=Severity.warning,
                        command="gemini-installer plan --interactive",
                    ),
                    Action(
                        name="stage_ai_runtime",
                        description="Prepare Ollama/Gemma, Gemini API bridge, vector memory, and systemd services.",
                        severity=Severity.info,
                        command="gemini-installer stage-ai-runtime",
                    ),
                ]
            )

        if "revise" in goal or "smarter" in goal or "optimize" in goal:
            actions.append(
                Action(
                    name="create_revision_snapshot",
                    description="Snapshot current config before applying prompt-driven OS revisions.",
                    severity=Severity.warning,
                    command="gemini-installer snapshot --before-revision",
                )
            )

        return actions
