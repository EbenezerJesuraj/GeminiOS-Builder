import { useState } from "react";
import { motion } from "framer-motion";
import { Settings as SettingsIcon, Monitor, Brain, Shield, Palette } from "lucide-react";

function Settings() {
  const [settings, setSettings] = useState({
    terminalHidden: true,
    aiShellDefault: true,
    animations: true,
    autoOptimize: true,
    selfEvolveEnabled: true,
    selfEvolveConfirm: true,
    mo365Mode: "webapp",
    theme: "glass-dark",
    voiceAssistant: true,
  });

  const updateSetting = (key: string, value: boolean | string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <motion.div
      className="page settings"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <header className="page-header">
        <SettingsIcon size={28} className="header-icon" />
        <div>
          <h1>Settings</h1>
          <p className="subtitle">Configure Gemini OS behavior and preferences.</p>
        </div>
      </header>

      <section className="settings-section glass">
        <div className="settings-section-header">
          <Monitor size={20} />
          <h2>Interface</h2>
        </div>
        <div className="settings-group">
          <SettingToggle
            label="Hide terminal by default"
            description="Terminal is only shown when explicitly requested (Super+Shift+Enter)"
            checked={settings.terminalHidden}
            onChange={(v) => updateSetting("terminalHidden", v)}
          />
          <SettingToggle
            label="AI Shell as default launcher"
            description="Super+Space opens Gemini Shell instead of traditional app launcher"
            checked={settings.aiShellDefault}
            onChange={(v) => updateSetting("aiShellDefault", v)}
          />
          <SettingToggle
            label="Enable animations"
            description="Smooth transitions and visual effects"
            checked={settings.animations}
            onChange={(v) => updateSetting("animations", v)}
          />
        </div>
      </section>

      <section className="settings-section glass">
        <div className="settings-section-header">
          <Brain size={20} />
          <h2>AI & Self-Evolve</h2>
        </div>
        <div className="settings-group">
          <SettingToggle
            label="Auto-optimize system"
            description="AI agents automatically tune performance, battery, and thermals"
            checked={settings.autoOptimize}
            onChange={(v) => updateSetting("autoOptimize", v)}
          />
          <SettingToggle
            label="Enable self-evolve"
            description="Allow OS to restructure itself based on your prompts"
            checked={settings.selfEvolveEnabled}
            onChange={(v) => updateSetting("selfEvolveEnabled", v)}
          />
          <SettingToggle
            label="Require confirmation for changes"
            description="Always ask before applying self-evolve modifications"
            checked={settings.selfEvolveConfirm}
            onChange={(v) => updateSetting("selfEvolveConfirm", v)}
          />
          <SettingToggle
            label="Voice assistant"
            description="Enable voice commands via Super+A"
            checked={settings.voiceAssistant}
            onChange={(v) => updateSetting("voiceAssistant", v)}
          />
        </div>
      </section>

      <section className="settings-section glass">
        <div className="settings-section-header">
          <Palette size={20} />
          <h2>Appearance</h2>
        </div>
        <div className="settings-group">
          <div className="setting-item">
            <div className="setting-label">
              <span>Theme</span>
              <span className="setting-desc">Visual theme for the desktop</span>
            </div>
            <select
              value={settings.theme}
              onChange={(e) => updateSetting("theme", e.target.value)}
              className="setting-select"
            >
              <option value="glass-dark">Glass Dark</option>
              <option value="glass-light">Glass Light</option>
              <option value="neon">Neon</option>
              <option value="minimal">Minimal</option>
            </select>
          </div>
        </div>
      </section>

      <section className="settings-section glass">
        <div className="settings-section-header">
          <Shield size={20} />
          <h2>Security</h2>
        </div>
        <div className="settings-group">
          <div className="setting-item">
            <div className="setting-label">
              <span>Agent sandbox level</span>
              <span className="setting-desc">
                Controls how much access AI agents have to the system
              </span>
            </div>
            <select className="setting-select" defaultValue="standard">
              <option value="strict">Strict — minimal permissions</option>
              <option value="standard">Standard — balanced access</option>
              <option value="permissive">Permissive — full access</option>
            </select>
          </div>
        </div>
      </section>
    </motion.div>
  );
}

function SettingToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="setting-item">
      <div className="setting-label">
        <span>{label}</span>
        <span className="setting-desc">{description}</span>
      </div>
      <label className="toggle-switch">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="toggle-slider" />
      </label>
    </div>
  );
}

export default Settings;
