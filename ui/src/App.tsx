import { useState, useCallback, useEffect, lazy, Suspense, memo } from "react";
import { Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Dock from "./components/Dock";
import DynamicWallpaper from "./components/DynamicWallpaper";
import AIActivityOrb from "./components/AIActivityOrb";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const GeminiShell = lazy(() => import("./pages/GeminiShell"));
const SelfEvolve = lazy(() => import("./pages/SelfEvolve"));
const AgentMonitor = lazy(() => import("./pages/AgentMonitor"));
const MO365Hub = lazy(() => import("./pages/MO365Hub"));
const Settings = lazy(() => import("./pages/Settings"));
const AIBrowser = lazy(() => import("./pages/AIBrowser"));
const AIIDE = lazy(() => import("./pages/AIIDE"));
const GeminiOverlay = lazy(() => import("./components/GeminiOverlay"));

const MemoWallpaper = memo(DynamicWallpaper);
const MemoOrb = memo(AIActivityOrb);

function App() {
  const [geminiOpen, setGeminiOpen] = useState(false);

  const toggleGemini = useCallback(() => setGeminiOpen((v) => !v), []);
  const closeGemini = useCallback(() => setGeminiOpen(false), []);

  useEffect(() => {
    const enterFullscreen = () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen?.().catch(() => {});
      }
    };
    const handler = () => enterFullscreen();
    document.addEventListener("click", handler, { once: true });
    return () => document.removeEventListener("click", handler);
  }, []);

  return (
    <div className="desktop-container">
      <MemoWallpaper />

      <main className="desktop-content">
        <Suspense fallback={null}>
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
        </Suspense>
      </main>

      <MemoOrb />

      <AnimatePresence>
        {geminiOpen && (
          <Suspense fallback={null}>
            <GeminiOverlay onClose={closeGemini} />
          </Suspense>
        )}
      </AnimatePresence>

      <Dock onGeminiClick={toggleGemini} />
    </div>
  );
}

export default App;
