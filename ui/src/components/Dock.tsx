import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Globe,
  Code2,
  Dna,
  Bot,
  FileSpreadsheet,
  Settings,
  Sparkles,
} from "lucide-react";

interface DockProps {
  onGeminiClick: () => void;
}

const dockItems = [
  { path: "/", icon: LayoutDashboard, label: "Dashboard", color: "#4285F4" },
  { path: "/browser", icon: Globe, label: "AI Browser", color: "#EA4335" },
  { path: "/ide", icon: Code2, label: "AI IDE", color: "#34A853" },
  { path: "/mo365", icon: FileSpreadsheet, label: "Microsoft 365", color: "#FBBC04" },
  { path: "/agents", icon: Bot, label: "AI Agents", color: "#4285F4" },
  { path: "/evolve", icon: Dna, label: "Self-Evolve", color: "#EA4335" },
  { path: "/settings", icon: Settings, label: "Settings", color: "#9AA0A6" },
];

function Dock({ onGeminiClick }: DockProps) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <motion.div
      className="dock-container"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 25, delay: 0.3 }}
    >
      <div className="dock">
        {/* Gemini Button — Primary, Google-colored gradient */}
        <motion.button
          className="dock-item gemini-dock-btn"
          onClick={onGeminiClick}
          whileHover={{ scale: 1.35, y: -18 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          title="Gemini AI"
        >
          <div className="gemini-icon-gradient">
            <Sparkles size={24} />
          </div>
          <span className="dock-label">Gemini</span>
        </motion.button>

        <div className="dock-divider" />

        {/* App Icons */}
        {dockItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <motion.button
              key={item.path}
              className={`dock-item ${isActive ? "active" : ""}`}
              onClick={() => navigate(item.path)}
              whileHover={{ scale: 1.3, y: -16 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              title={item.label}
            >
              <div
                className="dock-icon-wrapper"
                style={{
                  background: isActive
                    ? `${item.color}22`
                    : "transparent",
                  borderColor: isActive ? `${item.color}55` : "transparent",
                }}
              >
                <item.icon
                  size={22}
                  style={{ color: isActive ? item.color : "#c4c7c5" }}
                />
              </div>
              {isActive && (
                <motion.div
                  className="dock-active-dot"
                  layoutId="dock-dot"
                  style={{ background: item.color }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <span className="dock-label">{item.label}</span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

export default Dock;
