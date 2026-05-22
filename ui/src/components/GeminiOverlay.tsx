import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, X, Send, Mic, Zap, Brain, Image, Code } from "lucide-react";

interface Message {
  id: number;
  role: "user" | "gemini";
  content: string;
}

const suggestions = [
  { icon: Zap, label: "Optimize system performance", color: "#FBBC04" },
  { icon: Brain, label: "Summarize open documents", color: "#A142F4" },
  { icon: Image, label: "Generate a wallpaper", color: "#EA4335" },
  { icon: Code, label: "Write a Python script", color: "#34A853" },
];

/* Apple-style spring: slightly bouncy, smooth deceleration */
const appleSpring = { type: "spring" as const, stiffness: 240, damping: 28, mass: 0.8 };
const appleOverlay = { duration: 0.35, ease: [0.32, 0.72, 0, 1] as const };

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
      initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
      animate={{ opacity: 1, backdropFilter: "blur(24px)" }}
      exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
      transition={appleOverlay}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        className="gemini-panel"
        initial={{ scale: 0.82, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0, y: 30 }}
        transition={appleSpring}
      >
        {/* Header */}
        <div className="gemini-panel-header">
          <div className="gemini-header-left">
            <motion.div
              className="gemini-header-icon"
              initial={{ rotate: -90, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ ...appleSpring, delay: 0.15 }}
            >
              <Sparkles size={16} />
            </motion.div>
            Gemini
          </div>
          <motion.button
            className="gemini-close-btn"
            onClick={onClose}
            whileHover={{ scale: 1.15, rotate: 90 }}
            whileTap={{ scale: 0.85 }}
            transition={appleSpring}
          >
            <X size={16} />
          </motion.button>
        </div>

        {/* Messages */}
        <div className="gemini-messages">
          {messages.length === 0 && (
            <motion.div
              className="gemini-welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...appleSpring, delay: 0.2 }}
            >
              <motion.div
                className="gemini-welcome-icon"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ ...appleSpring, delay: 0.3 }}
              >
                <Sparkles size={32} />
              </motion.div>
              <h2>Hi, I'm Gemini</h2>
              <p>Your AI assistant across Gemini OS</p>
              <div className="gemini-suggestions">
                {suggestions.map((s, i) => (
                  <motion.button
                    key={s.label}
                    className="suggestion-chip"
                    onClick={() => sendMessage(s.label)}
                    initial={{ opacity: 0, y: 12, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ ...appleSpring, delay: 0.35 + i * 0.06 }}
                    whileHover={{ scale: 1.06, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    style={{ borderColor: `${s.color}40`, color: s.color }}
                  >
                    <s.icon size={14} /> <span style={{ color: "var(--on-surface)" }}>{s.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              className={`gemini-msg ${msg.role}`}
              initial={{ opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={appleSpring}
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
        <motion.div
          className="gemini-input-bar"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...appleSpring, delay: 0.25 }}
        >
          <input
            className="gemini-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Gemini anything..."
          />
          <motion.button
            className="gemini-voice-btn"
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.88 }}
          >
            <Mic size={18} />
          </motion.button>
          <motion.button
            className="gemini-send-btn"
            onClick={() => sendMessage()}
            disabled={!input.trim()}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.88 }}
          >
            <Send size={16} />
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default GeminiOverlay;
