import { motion } from "framer-motion";
import { FileText, Table, Presentation, Mail, Cloud, Users, FileSpreadsheet } from "lucide-react";

const apps = [
  { name: "Word", icon: FileText, color: "#2B579A", url: "https://www.office.com/launch/word" },
  { name: "Excel", icon: Table, color: "#217346", url: "https://www.office.com/launch/excel" },
  { name: "PowerPoint", icon: Presentation, color: "#D04423", url: "https://www.office.com/launch/powerpoint" },
  { name: "Outlook", icon: Mail, color: "#0078D4", url: "https://outlook.office.com" },
  { name: "OneDrive", icon: Cloud, color: "#0078D4", url: "https://onedrive.live.com" },
  { name: "Teams", icon: Users, color: "#6264A7", url: "https://teams.microsoft.com" },
];

function MO365Hub() {
  const openApp = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <motion.div
      className="page"
      initial={{ opacity: 0, scale: 0.97, filter: "blur(8px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.97, filter: "blur(8px)" }}
      transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
    >
      <div className="page-header">
        <FileSpreadsheet size={22} style={{ color: "#FBBC04" }} />
        <div>
          <h1>Microsoft 365</h1>
          <span className="subtitle">Native webapp integration with AI assistance</span>
        </div>
      </div>

      <div className="mo365-grid">
        {apps.map((app, i) => (
          <motion.div
            key={app.name}
            className="mo365-card"
            onClick={() => openApp(app.url)}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.06, type: "spring", stiffness: 300, damping: 25 }}
            whileHover={{ scale: 1.04, y: -4 }}
            whileTap={{ scale: 0.97 }}
          >
            <app.icon size={28} style={{ color: app.color }} />
            <h3>{app.name}</h3>
            <p>Open in webapp mode</p>
          </motion.div>
        ))}
      </div>

      <div className="mo365-info">
        <h3>Native Integration</h3>
        <ul>
          <li>Apps run as dedicated Chromium windows</li>
          <li>AI-powered document assistance via Gemini Shell</li>
          <li>System notifications for email and meetings</li>
          <li>Keyboard shortcuts mapped through Hyprland</li>
        </ul>
      </div>
    </motion.div>
  );
}

export default MO365Hub;
