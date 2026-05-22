import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Globe,
  Code2,
  FileSpreadsheet,
  Bot,
  Dna,
  Settings,
  Sparkles,
} from "lucide-react";

const dockApps = [
  { path: "/", icon: LayoutDashboard, label: "Home", color: "#4285F4" },
  { path: "/browser", icon: Globe, label: "Browser", color: "#34A853" },
  { path: "/ide", icon: Code2, label: "IDE", color: "#A142F4" },
  { path: "/mo365", icon: FileSpreadsheet, label: "M365", color: "#FBBC04" },
  { path: "/agents", icon: Bot, label: "Agents", color: "#4285F4" },
  { path: "/evolve", icon: Dna, label: "Evolve", color: "#EA4335" },
  { path: "/settings", icon: Settings, label: "Settings", color: "#8E8698" },
];

interface DockProps {
  onGeminiClick: () => void;
}

function Dock({ onGeminiClick }: DockProps) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="dock-container">
      <motion.div
        className="dock"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 24, delay: 0.2 }}
      >
        {/* Gemini primary button */}
        <motion.button
          className="dock-item gemini-dock-btn"
          onClick={onGeminiClick}
          whileTap={{ scale: 0.92 }}
        >
          <motion.div
            className="gemini-icon-gradient"
            whileHover={{ scale: 1.12, rotateZ: 8 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            <Sparkles size={22} />
          </motion.div>
          <span className="dock-label" style={{ color: "#fff" }}>Gemini</span>
        </motion.button>

        <div className="dock-divider" />

        {dockApps.map((app) => {
          const isActive = location.pathname === app.path;
          return (
            <motion.button
              key={app.path}
              className="dock-item"
              onClick={() => navigate(app.path)}
              whileTap={{ scale: 0.88 }}
            >
              <motion.div
                className="dock-icon-wrapper"
                whileHover={{ scale: 1.18, y: -8, rotateY: 12 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                style={isActive ? {
                  background: `${app.color}18`,
                  borderColor: `${app.color}30`,
                  boxShadow: `0 0 20px ${app.color}25`,
                } : undefined}
              >
                <app.icon
                  size={22}
                  style={{ color: isActive ? app.color : "#C4BCD0" }}
                />
              </motion.div>
              {isActive && (
                <motion.div
                  className="dock-active-dot"
                  layoutId="dock-active"
                  style={{ background: app.color, color: app.color }}
                  transition={{ type: "spring", stiffness: 500, damping: 28 }}
                />
              )}
              <span className="dock-label">{app.label}</span>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}

export default Dock;
