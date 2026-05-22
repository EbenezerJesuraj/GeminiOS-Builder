import { useState } from "react";
import { motion } from "framer-motion";
import {
  Code2,
  FolderTree,
  Terminal,
  Sparkles,
  Play,
  Bug,
  GitBranch,
  File,
  ChevronRight,
  ChevronDown,
  Search,
  Settings,
} from "lucide-react";

interface FileNode {
  name: string;
  type: "file" | "folder";
  children?: FileNode[];
  language?: string;
}

const sampleTree: FileNode[] = [
  {
    name: "gemini-os",
    type: "folder",
    children: [
      {
        name: "orchestrator",
        type: "folder",
        children: [
          { name: "orchestrator.py", type: "file", language: "python" },
          { name: "llm_router.py", type: "file", language: "python" },
          { name: "event_bus.py", type: "file", language: "python" },
        ],
      },
      {
        name: "ai-agents",
        type: "folder",
        children: [
          { name: "system_agent.py", type: "file", language: "python" },
          { name: "battery_agent.py", type: "file", language: "python" },
          { name: "network_agent.py", type: "file", language: "python" },
        ],
      },
      {
        name: "ui",
        type: "folder",
        children: [
          { name: "App.tsx", type: "file", language: "typescript" },
          { name: "Dock.tsx", type: "file", language: "typescript" },
          { name: "global.css", type: "file", language: "css" },
        ],
      },
      { name: "README.md", type: "file", language: "markdown" },
      { name: "setup_profile.sh", type: "file", language: "bash" },
    ],
  },
];

const sampleCode = `"""
Gemini OS — Central AI Orchestrator

The orchestrator is the brain of Gemini OS.
"""

import asyncio
import logging
from dataclasses import dataclass, field
from enum import Enum

logger = logging.getLogger("gemini-orchestrator")


class TaskPriority(Enum):
    CRITICAL = 0
    HIGH = 1
    NORMAL = 2
    LOW = 3
    BACKGROUND = 4


@dataclass
class AITask:
    task_id: str
    intent: str
    source: str
    priority: TaskPriority = TaskPriority.NORMAL
    payload: dict = field(default_factory=dict)
    result: str | None = None
    status: str = "pending"


class GeminiOrchestrator:
    """Central scheduler for all AI operations."""

    def __init__(self):
        self.running = False
        self.task_queue = asyncio.PriorityQueue()

    async def start(self):
        logger.info("Starting Gemini OS Orchestrator...")
        self.running = True
        await self._main_loop()

    async def submit_task(self, intent: str) -> str:
        task_id = f"task-{id(intent):06d}"
        task = AITask(task_id=task_id, intent=intent, source="user")
        await self.task_queue.put((task.priority.value, task))
        return task_id`;

function FileTree({
  nodes,
  depth = 0,
  onSelect,
}: {
  nodes: FileNode[];
  depth?: number;
  onSelect: (name: string) => void;
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ "gemini-os": true });

  return (
    <>
      {nodes.map((node) => (
        <div key={node.name}>
          <button
            className="filetree-item"
            style={{ paddingLeft: `${12 + depth * 16}px` }}
            onClick={() => {
              if (node.type === "folder") {
                setExpanded((prev) => ({ ...prev, [node.name]: !prev[node.name] }));
              } else {
                onSelect(node.name);
              }
            }}
          >
            {node.type === "folder" ? (
              expanded[node.name] ? <ChevronDown size={14} /> : <ChevronRight size={14} />
            ) : (
              <File size={14} style={{ color: getLanguageColor(node.language) }} />
            )}
            <span>{node.name}</span>
          </button>
          {node.type === "folder" && expanded[node.name] && node.children && (
            <FileTree nodes={node.children} depth={depth + 1} onSelect={onSelect} />
          )}
        </div>
      ))}
    </>
  );
}

function getLanguageColor(lang?: string): string {
  const colors: Record<string, string> = {
    python: "#3572A5",
    typescript: "#3178C6",
    css: "#563D7C",
    markdown: "#083FA1",
    bash: "#89E051",
  };
  return colors[lang ?? ""] ?? "#9AA0A6";
}

function AIIDE() {
  const [activeFile, setActiveFile] = useState("orchestrator.py");
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);

  return (
    <motion.div
      className="page ai-ide"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* IDE Top Bar */}
      <div className="ide-topbar">
        <div className="ide-topbar-left">
          <Code2 size={18} style={{ color: "#34A853" }} />
          <span className="ide-title">Gemini IDE</span>
          <span className="ide-subtitle">AI-Powered Development Environment</span>
        </div>
        <div className="ide-topbar-actions">
          <button className="ide-action-btn" title="Run">
            <Play size={16} style={{ color: "#34A853" }} />
          </button>
          <button className="ide-action-btn" title="Debug">
            <Bug size={16} style={{ color: "#EA4335" }} />
          </button>
          <button className="ide-action-btn" title="Git">
            <GitBranch size={16} style={{ color: "#FBBC04" }} />
          </button>
          <button className="ide-action-btn" title="Search">
            <Search size={16} />
          </button>
          <button
            className={`ide-action-btn ${aiPanelOpen ? "active" : ""}`}
            onClick={() => setAiPanelOpen(!aiPanelOpen)}
            title="AI Assistant"
          >
            <Sparkles size={16} style={{ color: "#4285F4" }} />
          </button>
          <button
            className={`ide-action-btn ${terminalOpen ? "active" : ""}`}
            onClick={() => setTerminalOpen(!terminalOpen)}
            title="Terminal"
          >
            <Terminal size={16} />
          </button>
          <button className="ide-action-btn" title="Settings">
            <Settings size={16} />
          </button>
        </div>
      </div>

      <div className="ide-body">
        {/* File Explorer */}
        <div className="ide-sidebar">
          <div className="ide-sidebar-header">
            <FolderTree size={14} />
            <span>Explorer</span>
          </div>
          <div className="ide-filetree">
            <FileTree nodes={sampleTree} onSelect={setActiveFile} />
          </div>
        </div>

        {/* Editor Area */}
        <div className="ide-editor-area">
          {/* Editor Tabs */}
          <div className="ide-editor-tabs">
            <div className="ide-tab active">
              <File size={12} style={{ color: "#3572A5" }} />
              <span>{activeFile}</span>
            </div>
          </div>

          {/* Code Editor */}
          <div className="ide-editor">
            <div className="ide-line-numbers">
              {sampleCode.split("\n").map((_, i) => (
                <span key={i}>{i + 1}</span>
              ))}
            </div>
            <pre className="ide-code">
              <code>{sampleCode}</code>
            </pre>
          </div>

          {/* Terminal Panel */}
          {terminalOpen && (
            <motion.div
              className="ide-terminal"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 200, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <div className="ide-terminal-header">
                <Terminal size={12} />
                <span>Terminal</span>
              </div>
              <div className="ide-terminal-body">
                <span className="terminal-prompt">gemini-os $</span>
                <span className="terminal-cursor">_</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* AI Assistant Panel */}
        {aiPanelOpen && (
          <motion.div
            className="ide-ai-panel"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
          >
            <div className="ide-ai-header">
              <Sparkles size={16} style={{ color: "#4285F4" }} />
              <span>Gemini Code Assistant</span>
            </div>
            <div className="ide-ai-content">
              <p className="ide-ai-desc">
                AI-powered code assistance. Ask questions about your code,
                generate functions, fix bugs, or refactor.
              </p>
              <div className="ide-ai-actions">
                <button className="m3-chip">Explain code</button>
                <button className="m3-chip">Generate tests</button>
                <button className="m3-chip">Fix bugs</button>
                <button className="m3-chip">Refactor</button>
                <button className="m3-chip">Add docs</button>
                <button className="m3-chip">Optimize</button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export default AIIDE;
