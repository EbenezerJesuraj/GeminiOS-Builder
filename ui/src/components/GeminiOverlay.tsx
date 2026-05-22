import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, X, Sparkles, Mic } from "lucide-react";

interface GeminiOverlayProps {
  onClose: () => void;
}

interface Message {
  id: number;
  role: "user" | "gemini";
  content: string;
}

const aiSuggestions = [
  "What's the weather like?",
  "Optimize my system performance",
  "Open Microsoft Word",
  "Change theme to dark mode",
  "Show me battery status",
  "Install Python 3.12",
];

function GeminiOverlay({ onClose }: GeminiOverlayProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextId = useRef(0);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const msg = text ?? input.trim();
    if (!msg || isLoading) return;

    const userMsg: Message = { id: nextId.current++, role: "user", content: msg };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/v1/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { id: nextId.current++, role: "gemini", content: data.response ?? "I'm here to help." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: nextId.current++, role: "gemini", content: "Running in offline mode. Connect to the Gemini Orchestrator for full AI capabilities." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") sendMessage();
    if (e.key === "Escape") onClose();
  };

  return (
    <motion.div
      className="gemini-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="gemini-panel"
        initial={{ scale: 0.9, y: 40, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 40, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
      >
        {/* Header */}
        <div className="gemini-panel-header">
          <div className="gemini-header-left">
            <div className="gemini-header-icon">
              <Sparkles size={20} />
            </div>
            <span>Gemini</span>
          </div>
          <button className="gemini-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Messages */}
        <div className="gemini-messages">
          {messages.length === 0 && (
            <div className="gemini-welcome">
              <div className="gemini-welcome-icon">
                <Sparkles size={36} />
              </div>
              <h2>Hello!</h2>
              <p>How can I help you today?</p>
              <div className="gemini-suggestions">
                {aiSuggestions.map((s, i) => (
                  <motion.button
                    key={i}
                    className="suggestion-chip"
                    onClick={() => sendMessage(s)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {s}
                  </motion.button>
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
                <div className="gemini-msg-avatar">
                  <Sparkles size={14} />
                </div>
              )}
              <div className="gemini-msg-content">
                <pre>{msg.content}</pre>
              </div>
            </motion.div>
          ))}

          {isLoading && (
            <div className="gemini-msg gemini">
              <div className="gemini-msg-avatar">
                <Sparkles size={14} />
              </div>
              <div className="gemini-typing">
                <span /><span /><span />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="gemini-input-bar">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Gemini anything..."
            className="gemini-input"
          />
          <button className="gemini-voice-btn" title="Voice">
            <Mic size={18} />
          </button>
          <button
            className="gemini-send-btn"
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
          >
            <Send size={18} />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default GeminiOverlay;
