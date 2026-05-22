import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bot, Activity, CheckCircle, XCircle } from "lucide-react";

interface AgentInfo {
  name: string;
  healthy: boolean;
  description: string;
}

const agentDescriptions: Record<string, string> = {
  system_agent: "OS optimization and performance tuning",
  battery_agent: "AI-driven power and battery management",
  thermal_agent: "Temperature monitoring and cooling control",
  network_agent: "Network optimization and traffic routing",
  security_agent: "Threat detection and system protection",
  workspace_agent: "Productivity workflows and window management",
  memory_agent: "Semantic memory and preference learning",
  update_agent: "Smart system update management",
  installer_agent: "Adaptive installation and configuration",
};

function AgentMonitor() {
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await fetch("/api/v1/agents");
        const data = await res.json();
        const agentList = Object.entries(data.agents).map(
          ([name, healthy]) => ({
            name,
            healthy: healthy as boolean,
            description: agentDescriptions[name] ?? "AI agent",
          })
        );
        setAgents(agentList);
      } catch {
        setAgents(
          Object.entries(agentDescriptions).map(([name, desc]) => ({
            name,
            healthy: true,
            description: desc,
          }))
        );
      } finally {
        setLoading(false);
      }
    };
    fetchAgents();
    const interval = setInterval(fetchAgents, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="page agent-monitor"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <header className="page-header">
        <Bot size={28} className="header-icon" />
        <div>
          <h1>AI Agents</h1>
          <p className="subtitle">
            Monitor and manage all Gemini OS AI agents in real-time.
          </p>
        </div>
      </header>

      <div className="agents-monitor-grid">
        {agents.map((agent, i) => (
          <motion.div
            key={agent.name}
            className="agent-card glass"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <div className="agent-card-header">
              {agent.healthy ? (
                <CheckCircle size={20} className="agent-healthy" />
              ) : (
                <XCircle size={20} className="agent-unhealthy" />
              )}
              <h3>{agent.name.replace(/_/g, " ")}</h3>
            </div>
            <p className="agent-description">{agent.description}</p>
            <div className="agent-card-footer">
              <span className={`agent-status ${agent.healthy ? "online" : "offline"}`}>
                {agent.healthy ? "Online" : "Offline"}
              </span>
              <Activity size={14} className="agent-activity" />
            </div>
          </motion.div>
        ))}
      </div>

      {loading && <div className="loading-overlay">Loading agents...</div>}
    </motion.div>
  );
}

export default AgentMonitor;
