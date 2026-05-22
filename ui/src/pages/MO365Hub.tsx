import { motion } from "framer-motion";
import { FileSpreadsheet, FileText, Presentation, Mail, Cloud } from "lucide-react";

const mo365Apps = [
  {
    name: "Word",
    icon: FileText,
    url: "https://www.office.com/launch/word",
    color: "#2b579a",
    description: "Documents and text editing",
  },
  {
    name: "Excel",
    icon: FileSpreadsheet,
    url: "https://www.office.com/launch/excel",
    color: "#217346",
    description: "Spreadsheets and data analysis",
  },
  {
    name: "PowerPoint",
    icon: Presentation,
    url: "https://www.office.com/launch/powerpoint",
    color: "#d24726",
    description: "Presentations and slides",
  },
  {
    name: "Outlook",
    icon: Mail,
    url: "https://outlook.office.com",
    color: "#0078d4",
    description: "Email and calendar",
  },
  {
    name: "OneDrive",
    icon: Cloud,
    url: "https://onedrive.live.com",
    color: "#0078d4",
    description: "Cloud storage and file sync",
  },
];

function MO365Hub() {
  const launchApp = (url: string) => {
    window.open(url, "_blank");
  };

  return (
    <motion.div
      className="page mo365-hub"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <header className="page-header">
        <FileSpreadsheet size={28} className="header-icon" style={{ color: "#ff6d00" }} />
        <div>
          <h1>Microsoft 365</h1>
          <p className="subtitle">
            Native Microsoft 365 integration — access Word, Excel, PowerPoint,
            Outlook, and OneDrive directly from Gemini OS.
          </p>
        </div>
      </header>

      <div className="mo365-grid">
        {mo365Apps.map((app, i) => (
          <motion.button
            key={app.name}
            className="mo365-card glass"
            onClick={() => launchApp(app.url)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ scale: 1.03, y: -4 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="mo365-icon" style={{ color: app.color }}>
              <app.icon size={36} />
            </div>
            <h3>{app.name}</h3>
            <p>{app.description}</p>
          </motion.button>
        ))}
      </div>

      <section className="mo365-info glass">
        <h3>Integration Features</h3>
        <ul>
          <li>Webapp mode — runs natively in Chromium with OS-level integration</li>
          <li>AI-powered document assistance via Gemini Shell</li>
          <li>Automatic OneDrive sync with local file system</li>
          <li>Smart notifications through Mako notification daemon</li>
          <li>Keyboard shortcuts mapped to Hyprland window manager</li>
        </ul>
      </section>
    </motion.div>
  );
}

export default MO365Hub;
