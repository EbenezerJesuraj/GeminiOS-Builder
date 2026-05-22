import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Brain } from "lucide-react";

function AIActivityOrb() {
  const [activity, setActivity] = useState<string>("idle");
  const [expanded, setExpanded] = useState(false);
  const [tasks, setTasks] = useState<string[]>([]);

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch("/api/v1/status");
        const data = await res.json();
        const activeAgents = Object.entries(data.agents ?? {}).filter(
          ([, healthy]) => healthy
        );
        setActivity(activeAgents.length > 0 ? "active" : "idle");
        setTasks(activeAgents.map(([name]) => name.replace(/_/g, " ")));
      } catch {
        setActivity("idle");
        setTasks(["system agent", "battery agent", "network agent"]);
      }
    };
    poll();
    const interval = setInterval(poll, 8000);
    return () => clearInterval(interval);
  }, []);

  const colors =
    activity === "active"
      ? ["#4285F4", "#34A853", "#FBBC04", "#EA4335"]
      : ["#5F6368", "#9AA0A6"];

  return (
    <motion.div
      className={`ai-orb ${expanded ? "expanded" : ""}`}
      onClick={() => setExpanded(!expanded)}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      layout
    >
      <motion.div
        className="ai-orb-ring"
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        style={{
          background: `conic-gradient(${colors.join(", ")}, ${colors[0]})`,
        }}
      />
      <div className="ai-orb-inner">
        <Brain size={18} />
      </div>

      {expanded && (
        <motion.div
          className="ai-orb-panel"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
        >
          <h4>AI Activity</h4>
          <div className="ai-orb-tasks">
            {tasks.map((t, i) => (
              <div key={i} className="ai-orb-task">
                <div className="ai-task-dot" style={{ background: colors[i % colors.length] }} />
                <span>{t}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default AIActivityOrb;
