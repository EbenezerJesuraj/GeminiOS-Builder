import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Dashboard from "./pages/Dashboard";
import GeminiShell from "./pages/GeminiShell";
import SelfEvolve from "./pages/SelfEvolve";
import AgentMonitor from "./pages/AgentMonitor";
import MO365Hub from "./pages/MO365Hub";
import Settings from "./pages/Settings";
import AIBrowser from "./pages/AIBrowser";
import AIIDE from "./pages/AIIDE";
import Dock from "./components/Dock";
import GeminiOverlay from "./components/GeminiOverlay";
import DynamicWallpaper from "./components/DynamicWallpaper";
import AIActivityOrb from "./components/AIActivityOrb";

function App() {
  const [geminiOpen, setGeminiOpen] = useState(false);

  return (
    <div className="desktop-container">
      <DynamicWallpaper />

      <main className="desktop-content">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/shell" element={<GeminiShell />} />
            <Route path="/evolve" element={<SelfEvolve />} />
            <Route path="/agents" element={<AgentMonitor />} />
            <Route path="/mo365" element={<MO365Hub />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/browser" element={<AIBrowser />} />
            <Route path="/ide" element={<AIIDE />} />
          </Routes>
        </AnimatePresence>
      </main>

      <AIActivityOrb />

      <AnimatePresence>
        {geminiOpen && (
          <GeminiOverlay onClose={() => setGeminiOpen(false)} />
        )}
      </AnimatePresence>

      <Dock onGeminiClick={() => setGeminiOpen(!geminiOpen)} />
    </div>
  );
}

export default App;
