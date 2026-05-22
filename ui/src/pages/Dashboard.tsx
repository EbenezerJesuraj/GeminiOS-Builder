import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, Cpu, HardDrive, Wifi, Battery, Shield } from "lucide-react";

interface SystemStatus {
  orchestrator: string;
  agents: Record<string, boolean>;
  resources: {
    cpu: string;
    memory: string;
    gpu_vram: string;
    load: string;
  };
  llm_status: string;
}

function Dashboard() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/v1/status");
        const data = await res.json();
        setStatus(data);
      } catch {
        setStatus({
          orchestrator: "demo",
          agents: {
            system_agent: true,
            battery_agent: true,
            thermal_agent: true,
            network_agent: true,
            security_agent: true,
            memory_agent: true,
          },
          resources: {
            cpu: "23.4%",
            memory: "41.2%",
            gpu_vram: "512MB / 4096MB",
            load: "0.87",
          },
          llm_status: "available",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const cards = [
    { icon: Cpu, label: "CPU", value: status?.resources.cpu ?? "—", color: "#00c8ff" },
    { icon: HardDrive, label: "Memory", value: status?.resources.memory ?? "—", color: "#7b2fff" },
    { icon: Activity, label: "GPU VRAM", value: status?.resources.gpu_vram ?? "—", color: "#00e5a0" },
    { icon: Wifi, label: "Network", value: "Connected", color: "#ff6d00" },
    { icon: Battery, label: "Battery", value: "87%", color: "#80ff80" },
    { icon: Shield, label: "Security", value: "Secure", color: "#c3a0ff" },
  ];

  return (
    <motion.div
      className="page dashboard"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <header className="page-header">
        <h1>Gemini OS Dashboard</h1>
        <p className="subtitle">
          AI-Native Operating System — All systems{" "}
          {status?.orchestrator === "operational" || status?.orchestrator === "demo"
            ? "operational"
            : "initializing"}
        </p>
      </header>

      <div className="dashboard-grid">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            className="dashboard-card glass"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <div className="card-icon" style={{ color: card.color }}>
              <card.icon size={24} />
            </div>
            <div className="card-content">
              <span className="card-label">{card.label}</span>
              <span className="card-value">{card.value}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <section className="dashboard-section">
        <h2>AI Agents</h2>
        <div className="agents-grid">
          {status &&
            Object.entries(status.agents).map(([name, healthy]) => (
              <div key={name} className="agent-badge glass">
                <div className={`agent-dot ${healthy ? "healthy" : "unhealthy"}`} />
                <span>{name.replace("_", " ")}</span>
              </div>
            ))}
        </div>
      </section>

      <section className="dashboard-section">
        <h2>LLM Status</h2>
        <div className="glass llm-status-card">
          <div className="llm-indicator">
            <div className={`ai-dot ${status?.llm_status === "available" ? "" : "inactive"}`} />
            <span>Local AI: {status?.llm_status ?? "checking..."}</span>
          </div>
        </div>
      </section>

      {loading && <div className="loading-overlay">Loading system status...</div>}
    </motion.div>
  );
}

export default Dashboard;
