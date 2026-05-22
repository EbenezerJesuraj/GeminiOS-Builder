from fastapi.testclient import TestClient

from gemini_os.main import app


client = TestClient(app)


def test_health() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_dashboard_serves_html() -> None:
    response = client.get("/")
    assert response.status_code == 200
    assert "Archon OS Control Plane" in response.text


def test_list_agents() -> None:
    response = client.get("/api/v1/agents")
    assert response.status_code == 200
    agent_ids = {agent["agent_id"] for agent in response.json()}
    assert "resource-governor" in agent_ids
    assert "network-router" in agent_ids
    assert "battery-manager" in agent_ids
    assert "installer-agent" in agent_ids


def test_orchestrator_recommends_actions() -> None:
    response = client.post(
        "/api/v1/orchestrator/evaluate",
        json={
            "metrics": {
                "cpu_percent": 93,
                "memory_percent": 88,
                "disk_percent": 91,
                "battery_percent": 18,
                "plugged_in": False,
                "network_latency_ms": 240,
                "active_network": "public-wifi",
                "temperature_celsius": 86,
                "running_workloads": ["local_inference", "cloud_sync"],
            },
            "user_prompt": "optimize my AI OS and keep it stable",
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert body["actions"]
    assert body["confidence"] > 0


def test_installer_plan() -> None:
    response = client.post(
        "/api/v1/installer/plan",
        json={
            "prompt": "Install Gemini OS and make it smarter over time",
            "target_disk": "/dev/nvme0n1",
            "desktop_environment": "hyprland",
        },
    )
    assert response.status_code == 200
    names = {action["name"] for action in response.json()}
    assert "create_install_plan" in names
    assert "configure_google_services" in names
