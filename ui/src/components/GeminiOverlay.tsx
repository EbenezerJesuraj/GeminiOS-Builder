import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, X, Send, Mic, Zap, Brain, Image, Code } from "lucide-react";

interface Message {
  id: number;
  role: "user" | "gemini";
  content: string;
}

const suggestions = [
  { icon: Zap, label: "Optimize system performance" },
  { icon: Brain, label: "Summarize open documents" },
  { icon: Image, label: "Generate a wallpaper" },
  { icon: Code, label: "Write a Python script" },
];

interface GeminiOverlayProps {
  onClose: () => void;
}

function GeminiOverlay({ onClose }: GeminiOverlayProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async (text?: string) => {
    const msg = text ?? input.trim();
    if (!msg || isTyping) return;

    const userMsg: Message = { id: nextId.current++, role: "user", content: msg };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/v1/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { id: nextId.current++, role: "gemini", content: data.response ?? "Processing..." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: nextId.current++, role: "gemini", content: "Offline — connect orchestrator for full capabilities." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <motion.div
      className="gemini-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        className="gemini-panel"
        initial={{ scale: 0.88, opacity: 0, rotateX: 8 }}
        animate={{ scale: 1, opacity: 1, rotateX: 0 }}
        exit={{ scale: 0.88, opacity: 0, rotateX: -8 }}
        transition={{ type: "spring", stiffness: 300, damping: 26 }}
      >
        {/* Header */}
        <div className="gemini-panel-header">
          <div className="gemini-header-left">
            <div className="gemini-header-icon"><Sparkles size={16} /></div>
            Gemini
          </div>
          <button className="gemini-close-btn" onClick={onClose}><X size={16} /></button>
        </div>

        {/* Messages */}
        <div className="gemini-messages">
          {messages.length === 0 && (
            <div className="gemini-welcome">
              <div className="gemini-welcome-icon"><Sparkles size={32} /></div>
              <h2>Hi, I'm Gemini</h2>
              <p>Your AI assistant across Gemini OS</p>
              <div className="gemini-suggestions">
                {suggestions.map((s) => (
                  <button
                    key={s.label}
                    className="suggestion-chip"
                    onClick={() => sendMessage(s.label)}
                  >
                    <s.icon size={14} /> {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              className={`gemini-msg ${msg.role}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {msg.role === "gemini" && (
                <div className="gemini-msg-avatar"><Sparkles size={12} /></div>
              )}
              <div className="gemini-msg-content">
                <pre>{msg.content}</pre>
              </div>
            </motion.div>
          ))}

          {isTyping && (
            <div className="gemini-msg gemini">
              <div className="gemini-msg-avatar"><Sparkles size={12} /></div>
              <div className="gemini-typing"><span /><span /><span /></div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="gemini-input-bar">
          <input
            className="gemini-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Gemini anything..."
          />
          <button className="gemini-voice-btn"><Mic size={18} /></button>
          <button
            className="gemini-send-btn"
            onClick={() => sendMessage()}
            disabled={!input.trim() || isTyping}
          >
            <Send size={16} />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default GeminiOverlay;
