from gemini_os.agents.base import BaseAgent
from gemini_os.models.schemas import Action, AgentRunRequest, Severity


class BatteryAgent(BaseAgent):
    agent_id = "battery-manager"
    name = "AI Battery Manager"
    summary = "Adapts OS behavior around battery, thermal, and mobility constraints."

    def plan(self, request: AgentRunRequest) -> list[Action]:
        metrics = request.metrics
        actions: list[Action] = []

        if metrics.battery_percent is None:
            return actions

        on_battery = metrics.plugged_in is False

        if on_battery and metrics.battery_percent <= 20:
            actions.append(
                Action(
                    name="enter_deep_power_saver",
                    description="Battery is low; reduce background AI, sync, brightness, and CPU boost.",
                    severity=Severity.critical,
                    command="gemini-os power set-mode deep-saver",
                    metadata={"battery_percent": metrics.battery_percent},
                )
            )
        elif on_battery and metrics.battery_percent <= 45:
            actions.append(
                Action(
                    name="enter_balanced_power_saver",
                    description="Battery is moderate; prefer smaller local models and delay heavy jobs.",
                    severity=Severity.warning,
                    command="gemini-os power set-mode balanced-saver",
                    metadata={"battery_percent": metrics.battery_percent},
                )
            )

        if metrics.temperature_celsius is not None and metrics.temperature_celsius >= 85:
            actions.append(
                Action(
                    name="thermal_protection",
                    description="Thermals are high; pause heavy inference and reduce CPU boost.",
                    severity=Severity.critical,
                    command="gemini-os thermal protect",
                    metadata={"temperature_celsius": metrics.temperature_celsius},
                )
            )

        return actions
