import { Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Dashboard from "./pages/Dashboard";
import GeminiShell from "./pages/GeminiShell";
import SelfEvolve from "./pages/SelfEvolve";
import AgentMonitor from "./pages/AgentMonitor";
import MO365Hub from "./pages/MO365Hub";
import Settings from "./pages/Settings";
import Sidebar from "./components/Sidebar";

function App() {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/shell" element={<GeminiShell />} />
            <Route path="/evolve" element={<SelfEvolve />} />
            <Route path="/agents" element={<AgentMonitor />} />
            <Route path="/mo365" element={<MO365Hub />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
