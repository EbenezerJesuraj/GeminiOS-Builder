import { useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
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
  { path: "/", icon: LayoutDashboard, label: "Home", color: "#4285F4", bg: "rgba(66,133,244,0.12)" },
  { path: "/browser", icon: Globe, label: "Browser", color: "#34A853", bg: "rgba(52,168,83,0.12)" },
  { path: "/ide", icon: Code2, label: "IDE", color: "#A142F4", bg: "rgba(161,66,244,0.12)" },
  { path: "/mo365", icon: FileSpreadsheet, label: "M365", color: "#FBBC04", bg: "rgba(251,188,4,0.14)" },
  { path: "/agents", icon: Bot, label: "Agents", color: "#4285F4", bg: "rgba(66,133,244,0.12)" },
  { path: "/evolve", icon: Dna, label: "Evolve", color: "#EA4335", bg: "rgba(234,67,53,0.12)" },
  { path: "/settings", icon: Settings, label: "Settings", color: "#9C8872", bg: "rgba(156,136,114,0.10)" },
];

const ICON_SIZE = 48;
const MAGNIFIED_SIZE = 72;
const MAGNIFY_DISTANCE = 140;

const springConfig = { mass: 0.3, stiffness: 350, damping: 18 };

interface DockItemProps {
  app: (typeof dockApps)[number];
  isActive: boolean;
  mouseX: ReturnType<typeof useMotionValue<number>>;
  onClick: () => void;
  index: number;
}

function DockItem({ app, isActive, mouseX, onClick, index }: DockItemProps) {
  const ref = useRef<HTMLButtonElement>(null);

  const distance = useTransform(mouseX, (val: number) => {
    const el = ref.current;
    if (!el || val === -999) return MAGNIFY_DISTANCE + 1;
    const rect = el.getBoundingClientRect();
    return Math.abs(val - (rect.x + rect.width / 2));
  });

  const sizeRaw = useTransform(distance, (d: number) => {
    if (d > MAGNIFY_DISTANCE) return ICON_SIZE;
    const ratio = 1 - d / MAGNIFY_DISTANCE;
    return ICON_SIZE + (MAGNIFIED_SIZE - ICON_SIZE) * ratio * ratio;
  });

  const size = useSpring(sizeRaw, springConfig);
  const yOffset = useTransform(size, (s: number) => -(s - ICON_SIZE) * 0.5);
  const y = useSpring(yOffset, springConfig);

  return (
    <motion.button
      ref={ref}
      className={`dock-item ${isActive ? "dock-item-active" : ""}`}
      onClick={onClick}
      whileTap={{ scale: 0.88 }}
      style={{ y }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 + index * 0.04, type: "spring", stiffness: 300, damping: 22 }}
    >
      <motion.div
        className="dock-icon-wrapper"
        style={{
          width: size,
          height: size,
          willChange: "width, height, transform",
          background: isActive ? `${app.color}20` : app.bg,
          borderColor: isActive ? `${app.color}35` : "transparent",
          boxShadow: isActive ? `0 0 16px ${app.color}18` : "none",
          borderRadius: "var(--r-lg)",
        }}
      >
        <app.icon
          size={22}
          style={{ color: isActive ? app.color : "#6B5744" }}
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
}

interface DockProps {
  onGeminiClick: () => void;
}

function Dock({ onGeminiClick }: DockProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const mouseX = useMotionValue(-999);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => mouseX.set(e.clientX),
    [mouseX]
  );

  const handleMouseLeave = useCallback(
    () => mouseX.set(-999),
    [mouseX]
  );

  return (
    <div className="dock-container">
      <motion.div
        className="dock"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 22, delay: 0.1 }}
      >
        {/* Gemini primary button */}
        <motion.button
          className="dock-item gemini-dock-btn"
          onClick={onGeminiClick}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, type: "spring", stiffness: 300, damping: 22 }}
        >
          <motion.div
            className="gemini-icon-gradient"
            whileHover={{ scale: 1.15, rotateZ: 10 }}
            transition={{ type: "spring", stiffness: 400, damping: 14 }}
          >
            <Sparkles size={22} />
          </motion.div>
          <span className="dock-label" style={{ color: "#fff" }}>
            Gemini
          </span>
        </motion.button>

        <div className="dock-divider" />

        {dockApps.map((app, i) => (
          <DockItem
            key={app.path}
            app={app}
            isActive={location.pathname === app.path}
            mouseX={mouseX}
            onClick={() => navigate(app.path)}
            index={i}
          />
        ))}
      </motion.div>
    </div>
  );
}

export default Dock;
