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

const appleSpring = { type: "spring" as const, stiffness: 240, damping: 28, mass: 0.8 };

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
      initial={{ opacity: 0, scale: 0.97, filter: "blur(8px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.97, filter: "blur(8px)" }}
      transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
    >
      {/* Pixel Widgets Row */}
      <div className="pixel-widgets">
        <motion.div
          className="pixel-widget widget-clock"
          initial={{ opacity: 0, y: 16, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ ...appleSpring, delay: 0.1 }}
          whileHover={{ scale: 1.03, y: -2 }}
        >
          <div className="clock-time">{formatTime(time)}</div>
          <div className="clock-date">{formatDate(time)}</div>
        </motion.div>

        <motion.div
          className="pixel-widget widget-weather"
          initial={{ opacity: 0, y: 16, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ ...appleSpring, delay: 0.16 }}
          whileHover={{ scale: 1.03, y: -2 }}
        >
          <span className="weather-icon-3d">☀️</span>
          <div className="weather-info">
            <span className="weather-temp-lg">22°</span>
            <span className="weather-desc">Partly sunny</span>
          </div>
        </motion.div>

        <motion.div
          className="pixel-widget widget-ai-glance"
          initial={{ opacity: 0, y: 16, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ ...appleSpring, delay: 0.22 }}
          whileHover={{ scale: 1.03, y: -2 }}
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
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ ...appleSpring, delay: 0.28 + i * 0.07 }}
            whileHover={{ scale: 1.04, y: -3 }}
            whileTap={{ scale: 0.97 }}
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
      <motion.div
        className="dashboard-section"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...appleSpring, delay: 0.5 }}
      >
        <h2>AI Agents</h2>
        <div className="agents-grid">
          {agentEntries.map(([name, healthy], i) => (
            <motion.span
              key={name}
              className="agent-badge"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ ...appleSpring, delay: 0.55 + i * 0.04 }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
            >
              <span className={`agent-dot ${healthy ? "healthy" : "unhealthy"}`} />
              {name}
            </motion.span>
          ))}
        </div>
      </motion.div>

      {/* LLM Engine */}
      <motion.div
        className="dashboard-section"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...appleSpring, delay: 0.65 }}
      >
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
      </motion.div>
    </motion.div>
  );
}

export default Dashboard;
