import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

interface AgentTask {
  name: string;
  color: string;
}

const defaultTasks: AgentTask[] = [
  { name: "system monitor", color: "#4285F4" },
  { name: "battery AI", color: "#34A853" },
  { name: "thermal guard", color: "#EA4335" },
];

function AIActivityOrb() {
  const [expanded, setExpanded] = useState(false);
  const [tasks, setTasks] = useState<AgentTask[]>(defaultTasks);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch("/api/v1/status");
        const data = await res.json();
        if (data.agents) {
          const colors = ["#4285F4", "#34A853", "#EA4335", "#FBBC04", "#A142F4"];
          const active = Object.entries(data.agents)
            .filter(([, v]) => v)
            .map(([name], i) => ({ name, color: colors[i % colors.length] }));
          if (active.length > 0) setTasks(active);
        }
      } catch {
        // keep defaults
      }
    };
    fetchTasks();
    const interval = setInterval(fetchTasks, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className={`ai-orb ${expanded ? "expanded" : ""}`}
      onClick={() => setExpanded(!expanded)}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 22, delay: 0.6 }}
    >
      {/* Rotating ring */}
      <svg className="ai-orb-ring" viewBox="0 0 48 48">
        <defs>
          <linearGradient id="orb-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4285F4" />
            <stop offset="25%" stopColor="#A142F4" />
            <stop offset="50%" stopColor="#EA4335" />
            <stop offset="75%" stopColor="#FBBC04" />
            <stop offset="100%" stopColor="#34A853" />
          </linearGradient>
        </defs>
        <circle
          cx="24" cy="24" r="21"
          fill="none"
          stroke="url(#orb-grad)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="100 32"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 24 24"
            to="360 24 24"
            dur="3s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>

      {/* Inner icon */}
      <div className="ai-orb-inner">
        <Sparkles size={16} />
      </div>

      {/* Expanded panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            className="ai-orb-panel"
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h4>Active AI Agents</h4>
            <div className="ai-orb-tasks">
              {tasks.map((t) => (
                <div key={t.name} className="ai-orb-task">
                  <span className="ai-task-dot" style={{ background: t.color, color: t.color }} />
                  {t.name}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default AIActivityOrb;
