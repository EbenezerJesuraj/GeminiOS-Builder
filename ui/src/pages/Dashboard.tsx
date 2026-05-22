import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Cpu, HardDrive, MemoryStick, Wifi, Thermometer, Battery, Activity } from "lucide-react";

interface SystemStats {
  cpu: number;
  memory: number;
  disk: number;
  temp: number;
  battery: number;
  network: string;
}

interface AgentStatus {
  [name: string]: boolean;
}

const statCards = [
  { key: "cpu", label: "CPU", icon: Cpu, color: "#4285F4", unit: "%" },
  { key: "memory", label: "Memory", icon: MemoryStick, color: "#EA4335", unit: "%" },
  { key: "disk", label: "Disk", icon: HardDrive, color: "#34A853", unit: "%" },
  { key: "temp", label: "Temp", icon: Thermometer, color: "#FBBC04", unit: "°C" },
  { key: "battery", label: "Battery", icon: Battery, color: "#9C27B0", unit: "%" },
  { key: "network", label: "Network", icon: Wifi, color: "#4285F4", unit: "" },
];

function Dashboard() {
  const [stats, setStats] = useState<SystemStats>({
    cpu: 24, memory: 58, disk: 42, temp: 52, battery: 87, network: "Connected",
  });
  const [agents, setAgents] = useState<AgentStatus>({
    system: true, battery: true, thermal: true, network: true,
    security: true, workspace: true, memory: true, update: false, installer: false,
  });
  const [aiActive, setAiActive] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/v1/status");
        const data = await res.json();
        if (data.system) setStats(data.system);
        if (data.agents) setAgents(data.agents);
        setAiActive(data.orchestrator === "operational");
      } catch {
        // Use defaults
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="page dashboard"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="page-header">
        <Activity className="header-icon" size={22} />
        <div>
          <h1>Dashboard</h1>
          <span className="subtitle">System overview & AI agent status</span>
        </div>
      </div>

      <div className="dashboard-grid">
        {statCards.map((card, i) => {
          const val = stats[card.key as keyof SystemStats];
          return (
            <motion.div
              key={card.key}
              className="dashboard-card"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <card.icon size={20} style={{ color: card.color }} />
              <div className="card-content">
                <span className="card-label">{card.label}</span>
                <span className="card-value">
                  {val}{card.unit}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="dashboard-section">
        <h2>AI Agents</h2>
        <div className="agents-grid">
          {Object.entries(agents).map(([name, healthy]) => (
            <div key={name} className="agent-badge">
              <span className={`agent-dot ${healthy ? "healthy" : "unhealthy"}`} />
              <span>{name.replace(/_/g, " ")}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="dashboard-section">
        <h2>AI Engine</h2>
        <div className="llm-status-card">
          <div className="llm-indicator">
            <span className={`ai-dot ${aiActive ? "" : "inactive"}`} />
            <span>{aiActive ? "Gemini Orchestrator — Active" : "AI Engine Offline"}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default Dashboard;
