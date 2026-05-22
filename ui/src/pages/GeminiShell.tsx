import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Send, Mic } from "lucide-react";

interface Message {
  id: number;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

function GeminiShell() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: "system",
      content: "Welcome to Gemini Shell. Type naturally — no commands needed.",
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: nextId.current++,
      role: "user",
      content: input.trim(),
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/v1/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.content }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          id: nextId.current++,
          role: "assistant",
          content: data.response ?? "Processing your request...",
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: nextId.current++,
          role: "assistant",
          content: "Offline mode — connect to orchestrator for full AI capabilities.",
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setIsLoading(false);
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
      className="page gemini-shell"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="shell-header">
        <Sparkles className="shell-icon" size={20} />
        <h1 style={{ fontSize: 18, fontWeight: 600 }}>Gemini Shell</h1>
        <span className="shell-hint">AI-native interface — no commands needed</span>
      </div>

      <div className="shell-messages">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            className={`shell-message ${msg.role}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="message-avatar">
              {msg.role === "user" ? "U" : <Sparkles size={12} />}
            </div>
            <div className="message-body">
              <span className="message-text">{msg.content}</span>
              <span className="message-time">{msg.timestamp}</span>
            </div>
          </motion.div>
        ))}

        {isLoading && (
          <div className="shell-message assistant">
            <div className="message-avatar"><Sparkles size={12} /></div>
            <div className="message-body">
              <div className="typing-dots"><span /><span /><span /></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="shell-input-container">
        <textarea
          className="shell-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything — 'optimize my battery', 'install ffmpeg', 'change theme'..."
          rows={1}
        />
        <button className="shell-btn" title="Voice"><Mic size={18} /></button>
        <button
          className="shell-btn send-btn"
          onClick={sendMessage}
          disabled={!input.trim() || isLoading}
          style={{ background: "#4285F4", color: "white", borderRadius: "9999px" }}
        >
          <Send size={16} />
        </button>
      </div>
    </motion.div>
  );
}

export default GeminiShell;
