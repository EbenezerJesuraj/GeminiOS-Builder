import { useState } from "react";
import { motion } from "framer-motion";
import { Settings as SettingsIcon, Sparkles, Monitor, Palette, Bell, Shield, Cpu } from "lucide-react";

function Settings() {
  const [localAI, setLocalAI] = useState(true);
  const [cloudFallback, setCloudFallback] = useState(true);
  const [voiceAssistant, setVoiceAssistant] = useState(true);
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [threatDetection, setThreatDetection] = useState(true);

  const Toggle = ({
    checked,
    onChange,
  }: {
    checked: boolean;
    onChange: (v: boolean) => void;
  }) => (
    <label className="toggle-switch">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="toggle-slider" />
    </label>
  );

  return (
    <motion.div
      className="page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="page-header">
        <SettingsIcon size={22} style={{ color: "#9AA0A6" }} />
        <div>
          <h1>Settings</h1>
          <span className="subtitle">Configure Gemini OS preferences</span>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-header">
          <Sparkles size={18} />
          <h2>AI Configuration</h2>
        </div>
        <div className="settings-group">
          <div className="setting-item">
            <div className="setting-label">
              <span>Local AI (Ollama)</span>
              <span className="setting-desc">Run AI models locally on device</span>
            </div>
            <Toggle checked={localAI} onChange={setLocalAI} />
          </div>
          <div className="setting-item">
            <div className="setting-label">
              <span>Cloud Fallback (Gemini API)</span>
              <span className="setting-desc">Use Google Gemini when local models unavailable</span>
            </div>
            <Toggle checked={cloudFallback} onChange={setCloudFallback} />
          </div>
          <div className="setting-item">
            <div className="setting-label">
              <span>Default Model</span>
              <span className="setting-desc">Primary model for AI operations</span>
            </div>
            <select className="setting-select">
              <option>gemma3:2b</option>
              <option>deepseek-coder:6.7b</option>
              <option>qwen:7b</option>
              <option>llava:7b</option>
            </select>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-header">
          <Monitor size={18} />
          <h2>Voice & Input</h2>
        </div>
        <div className="settings-group">
          <div className="setting-item">
            <div className="setting-label">
              <span>Voice Assistant</span>
              <span className="setting-desc">Activate with Super+A</span>
            </div>
            <Toggle checked={voiceAssistant} onChange={setVoiceAssistant} />
          </div>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-header">
          <Palette size={18} />
          <h2>Appearance</h2>
        </div>
        <div className="settings-group">
          <div className="setting-item">
            <div className="setting-label">
              <span>Theme</span>
              <span className="setting-desc">Material Theme 3 design system</span>
            </div>
            <select className="setting-select">
              <option>Material Dark</option>
              <option>Material Light</option>
              <option>AMOLED Black</option>
            </select>
          </div>
          <div className="setting-item">
            <div className="setting-label">
              <span>Wallpaper Mode</span>
              <span className="setting-desc">Dynamic weather-based wallpaper</span>
            </div>
            <select className="setting-select">
              <option>AI Dynamic (Weather)</option>
              <option>Static Gradient</option>
              <option>Custom Image</option>
            </select>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-header">
          <Bell size={18} />
          <h2>Notifications</h2>
        </div>
        <div className="settings-group">
          <div className="setting-item">
            <div className="setting-label">
              <span>Desktop Notifications</span>
              <span className="setting-desc">System and app notifications via Mako</span>
            </div>
            <Toggle checked={notifications} onChange={setNotifications} />
          </div>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-header">
          <Shield size={18} />
          <h2>Security & Updates</h2>
        </div>
        <div className="settings-group">
          <div className="setting-item">
            <div className="setting-label">
              <span>Threat Detection</span>
              <span className="setting-desc">AI-powered file integrity monitoring</span>
            </div>
            <Toggle checked={threatDetection} onChange={setThreatDetection} />
          </div>
          <div className="setting-item">
            <div className="setting-label">
              <span>Auto-Update</span>
              <span className="setting-desc">AI-managed system updates with rollback</span>
            </div>
            <Toggle checked={autoUpdate} onChange={setAutoUpdate} />
          </div>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-header">
          <Cpu size={18} />
          <h2>Performance</h2>
        </div>
        <div className="settings-group">
          <div className="setting-item">
            <div className="setting-label">
              <span>Power Profile</span>
              <span className="setting-desc">Managed by Battery Agent</span>
            </div>
            <select className="setting-select">
              <option>AI Adaptive</option>
              <option>Performance</option>
              <option>Balanced</option>
              <option>Power Saver</option>
            </select>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default Settings;
