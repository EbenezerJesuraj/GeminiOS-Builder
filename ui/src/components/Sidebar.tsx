import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  MessageSquare,
  Dna,
  Bot,
  FileSpreadsheet,
  Settings,
} from "lucide-react";

const navItems = [
  { path: "/", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/shell", icon: MessageSquare, label: "Gemini Shell" },
  { path: "/evolve", icon: Dna, label: "Self-Evolve" },
  { path: "/agents", icon: Bot, label: "AI Agents" },
  { path: "/mo365", icon: FileSpreadsheet, label: "Microsoft 365" },
  { path: "/settings", icon: Settings, label: "Settings" },
];

function Sidebar() {
  return (
    <motion.nav
      className="sidebar"
      initial={{ x: -80 }}
      animate={{ x: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="sidebar-logo">
        <span className="logo-icon">G</span>
        <span className="logo-text">Gemini OS</span>
      </div>

      <div className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="ai-indicator">
          <div className="ai-dot" />
          <span>AI Active</span>
        </div>
      </div>
    </motion.nav>
  );
}

export default Sidebar;
