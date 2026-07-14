import React, { useState, useRef, useEffect } from "react";
import { Send, MessageSquare, X, Bot, Sparkles, CornerDownLeft, ArrowRight } from "lucide-react";
import { Message } from "../types";

interface ChatWidgetProps {
  onEyeStateChange: (state: "idle" | "happy" | "thinking" | "waving") => void;
}

export default function ChatWidget({ onEyeStateChange }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Hello! I'm LuxAI, Bunlux's virtual 3D assistant. Ask me anything about his Data Science research, projects, skills, or professional experience!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  // Suggested questions
  const suggestions = [
    "What are his skills?",
    "Tell me about 'Phnom Clean Up Crew'",
    "What did he achieve at MIS Datazone?",
    "Show contact details",
  ];

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      // Auto-focus input
      setTimeout(() => chatInputRef.current?.focus(), 300);
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: Math.random().toString(),
      role: "user",
      text: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    onEyeStateChange("thinking");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            text: m.text,
          })),
        }),
      });

      const data = await response.json();
      if (response.ok) {
        const assistantMessage: Message = {
          id: Math.random().toString(),
          role: "assistant",
          text: data.text || "I processed your request, but didn't get any text back.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        onEyeStateChange("happy");
        setTimeout(() => onEyeStateChange("idle"), 1800);
      } else {
        throw new Error(data.error || "Failed to fetch response");
      }
    } catch (error) {
      console.error("Chat API error:", error);
      const errorMessage: Message = {
        id: Math.random().toString(),
        role: "assistant",
        text: "Apologies! I seem to be having trouble connecting to my central network module. Please ensure GEMINI_API_KEY is configured in the AI Studio Secrets panel.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      onEyeStateChange("idle");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="floating-chat-widget" className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Expanded Chat Box */}
      {isOpen && (
        <div
          id="chat-box-panel"
          className="w-[90vw] sm:w-[380px] h-[500px] bg-[#020617]/90 border border-white/10 backdrop-blur-xl rounded-2xl shadow-2xl flex flex-col mb-4 overflow-hidden animate-[fadeInUp_0.3s_ease-out] relative"
        >
          {/* Header */}
          <div className="p-4 bg-white/5 border-b border-white/10 flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-400/30 flex items-center justify-center animate-pulse">
                <Bot className="w-4 text-blue-400" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white flex items-center gap-1.5">
                  LuxAI Assistant
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping" />
                </h4>
                <p className="text-[10px] text-blue-300 font-medium">Representative of Ngoun Bunlux</p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                onEyeStateChange("idle");
              }}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close Chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-blue-900/50">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm ${
                    m.role === "user"
                      ? "bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md shadow-blue-900/20"
                      : "bg-white/5 text-slate-200 border border-white/10"
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                  <span className="block text-[9px] opacity-60 text-right mt-1.5 font-mono">
                    {m.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3 flex gap-1.5 items-center">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestion Chips */}
          {messages.length === 1 && (
            <div className="px-4 py-2 flex flex-wrap gap-1.5 border-t border-white/5 bg-white/5">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="text-[11px] text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-2.5 py-1 text-left transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="p-3 border-t border-white/5 bg-[#020617] flex items-center gap-2"
          >
            <input
              ref={chatInputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about education, skills, projects..."
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2 bg-white text-black hover:bg-blue-100 disabled:opacity-50 disabled:hover:bg-white rounded-lg transition-colors flex items-center justify-center cursor-pointer"
              aria-label="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Spark / Trigger Button */}
      {!isOpen && (
        <button
          id="chat-widget-trigger"
          onClick={() => {
            setIsOpen(true);
            onEyeStateChange("happy");
            setTimeout(() => onEyeStateChange("idle"), 1500);
          }}
          className="flex items-center gap-2.5 px-5 py-3.5 bg-white text-black rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer group"
        >
          <Sparkles className="w-4 h-4 text-cyan-200 animate-pulse" />
          <span className="text-sm font-semibold tracking-wide">Chat with LuxAI</span>
          <MessageSquare className="w-5 h-5 group-hover:rotate-12 transition-transform" />
        </button>
      )}
    </div>
  );
}
