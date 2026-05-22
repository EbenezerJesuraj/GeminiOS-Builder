from enum import StrEnum
from typing import Any

from pydantic import BaseModel, Field


class Severity(StrEnum):
    info = "info"
    warning = "warning"
    critical = "critical"


class AgentState(StrEnum):
    idle = "idle"
    running = "running"
    degraded = "degraded"
    disabled = "disabled"


class Action(BaseModel):
    name: str
    description: str
    severity: Severity = Severity.info
    command: str | None = None
    reversible: bool = True
    requires_approval: bool = True
    metadata: dict[str, Any] = Field(default_factory=dict)


class AgentStatus(BaseModel):
    agent_id: str
    name: str
    state: AgentState
    summary: str
    last_actions: list[Action] = Field(default_factory=list)


class SystemMetrics(BaseModel):
    cpu_percent: float = Field(ge=0, le=100)
    memory_percent: float = Field(ge=0, le=100)
    disk_percent: float = Field(ge=0, le=100)
    battery_percent: float | None = Field(default=None, ge=0, le=100)
    plugged_in: bool | None = None
    network_latency_ms: float | None = Field(default=None, ge=0)
    active_network: str | None = None
    temperature_celsius: float | None = None
    running_workloads: list[str] = Field(default_factory=list)


class AgentRunRequest(BaseModel):
    metrics: SystemMetrics
    goal: str | None = None
    dry_run: bool = True
    context: dict[str, Any] = Field(default_factory=dict)


class AgentRunResponse(BaseModel):
    agent_id: str
    summary: str
    actions: list[Action]


class OrchestratorRequest(BaseModel):
    metrics: SystemMetrics
    user_prompt: str | None = None
    dry_run: bool = True
    context: dict[str, Any] = Field(default_factory=dict)


class OrchestratorResponse(BaseModel):
    summary: str
    confidence: float = Field(ge=0, le=1)
    actions: list[Action]
    agent_reports: list[AgentRunResponse]


class NetworkRouteRequest(BaseModel):
    metrics: SystemMetrics
    destination: str
    workload_type: str = "general"
    available_networks: list[str] = Field(default_factory=list)


class InstallerPlanRequest(BaseModel):
    prompt: str
    target_disk: str | None = None
    desktop_environment: str = "hyprland"
    enable_google_services: bool = True
    enable_local_ai: bool = True
    constraints: dict[str, Any] = Field(default_factory=dict)


class GoogleIntegration(BaseModel):
    service: str
    status: str
    purpose: str
    required_secrets: list[str] = Field(default_factory=list)
