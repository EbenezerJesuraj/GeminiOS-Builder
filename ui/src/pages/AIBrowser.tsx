import { useState } from "react";
import { motion } from "framer-motion";
import {
  Globe,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Plus,
  X,
  Sparkles,
  Search,
  Shield,
  Zap,
} from "lucide-react";

interface Tab {
  id: number;
  title: string;
  url: string;
}

function AIBrowser() {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: 1, title: "New Tab", url: "" },
  ]);
  const [activeTab, setActiveTab] = useState(1);
  const [urlInput, setUrlInput] = useState("");
  const [aiAssistOpen, setAiAssistOpen] = useState(false);

  const currentTab = tabs.find((t) => t.id === activeTab);

  const addTab = () => {
    const newId = Math.max(...tabs.map((t) => t.id)) + 1;
    setTabs((prev) => [...prev, { id: newId, title: "New Tab", url: "" }]);
    setActiveTab(newId);
    setUrlInput("");
  };

  const closeTab = (id: number) => {
    if (tabs.length === 1) return;
    const filtered = tabs.filter((t) => t.id !== id);
    setTabs(filtered);
    if (activeTab === id) setActiveTab(filtered[0].id);
  };

  const navigate = (url: string) => {
    let fullUrl = url;
    if (!url.startsWith("http")) {
      if (url.includes(".") && !url.includes(" ")) {
        fullUrl = `https://${url}`;
      } else {
        fullUrl = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
      }
    }
    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTab ? { ...t, url: fullUrl, title: url.substring(0, 30) } : t
      )
    );
    setUrlInput(fullUrl);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && urlInput.trim()) navigate(urlInput.trim());
  };

  return (
    <motion.div
      className="page ai-browser"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Tab Bar */}
      <div className="browser-tabbar">
        {tabs.map((tab) => (
          <motion.div
            key={tab.id}
            className={`browser-tab ${tab.id === activeTab ? "active" : ""}`}
            onClick={() => {
              setActiveTab(tab.id);
              setUrlInput(tab.url);
            }}
            layout
            whileHover={{ y: -2 }}
          >
            <Globe size={12} />
            <span className="browser-tab-title">{tab.title || "New Tab"}</span>
            <button
              className="browser-tab-close"
              onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
            >
              <X size={10} />
            </button>
          </motion.div>
        ))}
        <button className="browser-tab-add" onClick={addTab}>
          <Plus size={14} />
        </button>
      </div>

      {/* URL Bar */}
      <div className="browser-toolbar">
        <button className="browser-nav-btn"><ArrowLeft size={16} /></button>
        <button className="browser-nav-btn"><ArrowRight size={16} /></button>
        <button className="browser-nav-btn"><RotateCw size={16} /></button>

        <div className="browser-url-container">
          <Shield size={14} className="url-shield" />
          <input
            className="browser-url-input"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search with Gemini AI or enter URL..."
          />
          <Search size={14} className="url-search" />
        </div>

        <motion.button
          className="browser-ai-btn"
          onClick={() => setAiAssistOpen(!aiAssistOpen)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
        >
          <Sparkles size={16} />
          <span>AI Assist</span>
        </motion.button>
      </div>

      {/* Browser Content */}
      <div className="browser-content">
        {currentTab?.url ? (
          <iframe
            src={currentTab.url}
            className="browser-frame"
            title="browser"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        ) : (
          <div className="browser-newtab">
            <div className="newtab-logo">
              <Globe size={48} style={{ color: "#4285F4" }} />
            </div>
            <h2>Gemini Browser</h2>
            <p>AI-powered browsing with built-in Gemini assistance</p>

            <div className="newtab-features">
              <div className="newtab-feature">
                <Sparkles size={20} style={{ color: "#4285F4" }} />
                <span>AI Page Summaries</span>
              </div>
              <div className="newtab-feature">
                <Shield size={20} style={{ color: "#34A853" }} />
                <span>Privacy-First Browsing</span>
              </div>
              <div className="newtab-feature">
                <Zap size={20} style={{ color: "#FBBC04" }} />
                <span>Smart Tab Management</span>
              </div>
            </div>

            <div className="newtab-shortcuts">
              {[
                { name: "Google", url: "https://google.com", color: "#4285F4" },
                { name: "YouTube", url: "https://youtube.com", color: "#EA4335" },
                { name: "GitHub", url: "https://github.com", color: "#333" },
                { name: "M365", url: "https://office.com", color: "#FBBC04" },
              ].map((site) => (
                <button
                  key={site.name}
                  className="newtab-shortcut"
                  onClick={() => navigate(site.url)}
                  style={{ borderColor: `${site.color}33` }}
                >
                  <div className="shortcut-icon" style={{ background: site.color }}>
                    {site.name[0]}
                  </div>
                  <span>{site.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* AI Assist Panel */}
        {aiAssistOpen && (
          <motion.div
            className="browser-ai-panel m3-card"
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
          >
            <h3>
              <Sparkles size={16} /> AI Assist
            </h3>
            <p className="ai-panel-desc">
              Ask Gemini about the current page, summarize content, or get AI-powered
              recommendations.
            </p>
            <div className="ai-panel-actions">
              <button className="m3-chip">Summarize page</button>
              <button className="m3-chip">Explain this</button>
              <button className="m3-chip">Find related</button>
              <button className="m3-chip">Translate</button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export default AIBrowser;
