import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Cpu, HardDrive, Wifi, Battery, Sparkles, Clock } from "lucide-react";

interface SystemStatus {
  agents: Record<string, boolean>;
  llm: { available: boolean; model: string };
}

const defaultStatus: SystemStatus = {
  agents: {
    system: true, battery: true, thermal: true, network: true,
    security: true, workspace: true, memory: true, update: false, installer: false,
  },
  llm: { available: false, model: "gemma3:2b" },
};

const statCards = [
  { label: "CPU", value: "12%", icon: Cpu, color: "#4285F4" },
  { label: "Memory", value: "4.2 GB", icon: HardDrive, color: "#A142F4" },
  { label: "Network", value: "Connected", icon: Wifi, color: "#34A853" },
  { label: "Battery", value: "87%", icon: Battery, color: "#FBBC04" },
];

function Dashboard() {
  const [status, setStatus] = useState<SystemStatus>(defaultStatus);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/v1/status");
        setStatus(await res.json());
      } catch { /* use defaults */ }
    };
    fetchStatus();
    const statusInterval = setInterval(fetchStatus, 8000);
    const clockInterval = setInterval(() => setTime(new Date()), 1000);
    return () => { clearInterval(statusInterval); clearInterval(clockInterval); };
  }, []);

  const agentEntries = Object.entries(status.agents);
  const onlineCount = agentEntries.filter(([, v]) => v).length;

  const formatTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const formatDate = (d: Date) =>
    d.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });

  return (
    <motion.div
      className="page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Pixel Widgets Row */}
      <div className="pixel-widgets">
        {/* Clock widget */}
        <motion.div
          className="pixel-widget widget-clock"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="clock-time">{formatTime(time)}</div>
          <div className="clock-date">{formatDate(time)}</div>
        </motion.div>

        {/* Weather widget */}
        <motion.div
          className="pixel-widget widget-weather"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <span className="weather-icon-3d">☀️</span>
          <div className="weather-info">
            <span className="weather-temp-lg">22°</span>
            <span className="weather-desc">Partly sunny</span>
          </div>
        </motion.div>

        {/* AI at-a-glance widget */}
        <motion.div
          className="pixel-widget widget-ai-glance"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="ai-glance-icon"><Sparkles size={18} /></div>
          <div className="ai-glance-text">
            <span className="ai-glance-title">{onlineCount} AI agents active</span>
            <span className="ai-glance-sub">System optimized • {status.llm.model}</span>
          </div>
        </motion.div>
      </div>

      {/* System Stats */}
      <div className="dashboard-grid">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            className="dashboard-card"
            initial={{ opacity: 0, y: 16, rotateX: 6 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ delay: 0.25 + i * 0.06, type: "spring", stiffness: 300, damping: 25 }}
          >
            <card.icon size={22} style={{ color: card.color, position: "relative", zIndex: 1 }} />
            <div className="card-content">
              <span className="card-label">{card.label}</span>
              <span className="card-value">{card.value}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Agents */}
      <div className="dashboard-section">
        <h2>AI Agents</h2>
        <div className="agents-grid">
          {agentEntries.map(([name, healthy], i) => (
            <motion.span
              key={name}
              className="agent-badge"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.04 }}
            >
              <span className={`agent-dot ${healthy ? "healthy" : "unhealthy"}`} />
              {name}
            </motion.span>
          ))}
        </div>
      </div>

      {/* LLM Engine */}
      <div className="dashboard-section">
        <h2>AI Engine</h2>
        <div className="llm-status-card">
          <div className="llm-indicator">
            <span className={`ai-dot ${status.llm.available ? "" : "inactive"}`} />
            <span>{status.llm.available ? "Online" : "Offline"}</span>
            <span style={{ color: "var(--outline)", marginLeft: "auto", fontSize: 12, fontFamily: "var(--font-mono)" }}>
              {status.llm.model}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default Dashboard;
