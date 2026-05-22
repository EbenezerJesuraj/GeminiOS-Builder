import { useState } from "react";
import { motion } from "framer-motion";
import { Dna, Play, Eye, RotateCcw, Shield } from "lucide-react";

interface EvolveResult {
  task_id: string;
  mode: string;
  plan?: string;
}

function SelfEvolve() {
  const [prompt, setPrompt] = useState("");
  const [dryRun, setDryRun] = useState(true);
  const [result, setResult] = useState<EvolveResult | null>(null);
  const [history, setHistory] = useState<
    { prompt: string; mode: string; timestamp: Date }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  const submitEvolve = async () => {
    if (!prompt.trim() || isLoading) return;
    setIsLoading(true);

    try {
      const res = await fetch("/api/v1/self-evolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim(), dry_run: dryRun }),
      });
      const data = await res.json();
      setResult(data);
      setHistory((prev) => [
        { prompt: prompt.trim(), mode: dryRun ? "preview" : "applied", timestamp: new Date() },
        ...prev,
      ]);
    } catch {
      setResult({
        task_id: "offline",
        mode: "error",
        plan: "Orchestrator unavailable. Self-evolve requires the AI runtime.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="page self-evolve"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <header className="page-header">
        <Dna size={28} className="header-icon" />
        <div>
          <h1>Self-Evolve</h1>
          <p className="subtitle">
            Restructure your OS with natural language. Gemini OS adapts its
            structure, services, UI, and behavior based on your prompts.
          </p>
        </div>
      </header>

      <div className="evolve-input-section glass">
        <textarea
          className="evolve-input"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder='Describe how you want your OS to change... e.g., "Add a dark ambient theme with larger fonts" or "Install and configure a local coding environment with Python and Rust"'
          rows={4}
        />
        <div className="evolve-controls">
          <label className="evolve-toggle">
            <input
              type="checkbox"
              checked={dryRun}
              onChange={(e) => setDryRun(e.target.checked)}
            />
            <Eye size={16} />
            <span>Preview only (dry run)</span>
          </label>
          <button
            className="evolve-btn"
            onClick={submitEvolve}
            disabled={!prompt.trim() || isLoading}
          >
            {dryRun ? <Eye size={18} /> : <Play size={18} />}
            <span>{dryRun ? "Preview Changes" : "Apply Evolution"}</span>
          </button>
        </div>
      </div>

      {result && (
        <motion.div
          className="evolve-result glass"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="result-header">
            <span className={`result-badge ${result.mode}`}>
              {result.mode === "dry_run" ? "Preview" : result.mode === "execute" ? "Applied" : "Error"}
            </span>
            <span className="result-task-id">{result.task_id}</span>
          </div>
          {result.plan && <pre className="result-plan">{result.plan}</pre>}
        </motion.div>
      )}

      <section className="evolve-safety glass">
        <Shield size={20} />
        <div>
          <h3>Safety Guarantees</h3>
          <ul>
            <li>All changes create automatic snapshots for rollback</li>
            <li>Preview mode shows planned changes without applying</li>
            <li>Critical system files are protected by the Security Agent</li>
            <li>Maximum 10 rollback snapshots maintained</li>
          </ul>
        </div>
      </section>

      {history.length > 0 && (
        <section className="evolve-history">
          <h2>
            <RotateCcw size={18} /> Evolution History
          </h2>
          <div className="history-list">
            {history.map((entry, i) => (
              <div key={i} className="history-item glass">
                <span className={`history-badge ${entry.mode}`}>
                  {entry.mode}
                </span>
                <span className="history-prompt">{entry.prompt}</span>
                <span className="history-time">
                  {entry.timestamp.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </motion.div>
  );
}

export default SelfEvolve;
