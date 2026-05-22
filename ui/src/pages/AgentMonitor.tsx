import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bot, Activity, Zap } from "lucide-react";

interface AgentInfo {
  name: string;
  description: string;
  healthy: boolean;
  lastActivity: string;
}

const defaultAgents: AgentInfo[] = [
  { name: "system", description: "CPU governor, memory optimization, process scheduling", healthy: true, lastActivity: "2s ago" },
  { name: "battery", description: "AI power management and charging optimization", healthy: true, lastActivity: "5s ago" },
  { name: "thermal", description: "Temperature prediction and fan curve control", healthy: true, lastActivity: "3s ago" },
  { name: "network", description: "Adaptive DNS, latency-aware routing, QoS", healthy: true, lastActivity: "1s ago" },
  { name: "security", description: "File integrity monitoring, threat detection", healthy: true, lastActivity: "8s ago" },
  { name: "workspace", description: "Smart window management and focus mode", healthy: true, lastActivity: "10s ago" },
  { name: "memory", description: "Semantic memory and preference learning", healthy: true, lastActivity: "4s ago" },
  { name: "update", description: "Smart system upgrades with rollback", healthy: false, lastActivity: "1m ago" },
  { name: "installer", description: "Hardware detection, adaptive installation", healthy: false, lastActivity: "idle" },
];

const agentColors = ["#4285F4", "#EA4335", "#FBBC04", "#34A853", "#9C27B0", "#4285F4", "#EA4335", "#FBBC04", "#34A853"];

function AgentMonitor() {
  const [agents, setAgents] = useState<AgentInfo[]>(defaultAgents);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await fetch("/api/v1/status");
        const data = await res.json();
        if (data.agents) {
          setAgents((prev) =>
            prev.map((a) => ({
              ...a,
              healthy: data.agents[a.name] ?? a.healthy,
            }))
          );
        }
      } catch {
        // Use defaults
      }
    };
    fetchAgents();
    const interval = setInterval(fetchAgents, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="page-header">
        <Bot size={22} style={{ color: "#4285F4" }} />
        <div>
          <h1>AI Agents</h1>
          <span className="subtitle">{agents.filter((a) => a.healthy).length} of {agents.length} agents online</span>
        </div>
      </div>

      <div className="agents-monitor-grid">
        {agents.map((agent, i) => (
          <motion.div
            key={agent.name}
            className="agent-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className="agent-card-header">
              <Zap size={16} style={{ color: agentColors[i] }} />
              <h3>{agent.name.replace(/_/g, " ")} agent</h3>
            </div>
            <p className="agent-description">{agent.description}</p>
            <div className="agent-card-footer">
              <span className={`agent-status ${agent.healthy ? "online" : "offline"}`}>
                {agent.healthy ? "Online" : "Offline"}
              </span>
              <span className="agent-activity" style={{ fontSize: 10 }}>
                <Activity size={10} /> {agent.lastActivity}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default AgentMonitor;
