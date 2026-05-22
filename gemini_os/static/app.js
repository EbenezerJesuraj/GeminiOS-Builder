const api = "/api/v1";

const $ = (id) => document.getElementById(id);

async function getJson(path, options) {
  const response = await fetch(path, options);
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  return response.json();
}

function metricPayload() {
  return {
    cpu_percent: Number($("cpu").value),
    memory_percent: Number($("memory").value),
    disk_percent: Number($("disk").value),
    battery_percent: Number($("battery").value),
    plugged_in: false,
    network_latency_ms: Number($("latency").value),
    active_network: "public-wifi",
    temperature_celsius: Number($("cpu").value) > 88 ? 86 : 64,
    running_workloads: ["local_inference", "cloud_sync"],
  };
}

function renderAgents(agents) {
  $("agent-grid").innerHTML = agents
    .map(
      (agent) => `
        <article class="agent-card">
          <strong>${agent.name}</strong>
          <p>${agent.summary}</p>
        </article>
      `,
    )
    .join("");
}

function renderGoogle(integrations) {
  $("google-grid").innerHTML = integrations
    .map(
      (item) => `
        <article class="google-card">
          <strong>${item.service}</strong>
          <p>${item.purpose}</p>
          <p>Status: ${item.status.replace("_", " ")}</p>
        </article>
      `,
    )
    .join("");
}

function renderActions(result) {
  if (!result.actions?.length) {
    $("output").className = "output-empty";
    $("output").textContent = "System is within normal operating policy.";
    return;
  }

  $("output").className = "action-list";
  $("output").innerHTML = result.actions
    .slice(0, 9)
    .map(
      (action) => `
        <article class="action-card ${action.severity}">
          <small>${action.severity}</small>
          <strong>${action.name.replaceAll("_", " ")}</strong>
          <p>${action.description}</p>
        </article>
      `,
    )
    .join("");
}

async function runEvaluation() {
  $("output").className = "output-empty";
  $("output").textContent = "Thinking across OS agents...";
  const result = await getJson(`${api}/orchestrator/evaluate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      metrics: metricPayload(),
      user_prompt: "Optimize Archon OS for stability, battery, network privacy, and AI workloads.",
      dry_run: true,
    }),
  });
  renderActions(result);
}

async function planInstall() {
  $("output").className = "output-empty";
  $("output").textContent = "Drafting installer plan...";
  const result = await getJson(`${api}/installer/plan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: "Install Archon OS with Hyprland, Calamares, Ollama, Gemini connector, and smart agents.",
      desktop_environment: "hyprland",
      enable_google_services: true,
      enable_local_ai: true,
    }),
  });
  renderActions({ actions: result });
}

async function boot() {
  try {
    const health = await getJson("/health");
    $("health-pill").textContent = health.status === "ok" ? "Live" : "Degraded";
    renderAgents(await getJson(`${api}/agents`));
    renderGoogle(await getJson(`${api}/google/integrations`));
  } catch (error) {
    $("health-pill").textContent = "Offline";
    $("output").textContent = error.message;
  }
}

$("run-evaluation").addEventListener("click", runEvaluation);
$("plan-install").addEventListener("click", planInstall);
boot();
