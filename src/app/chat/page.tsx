"use client";

import { useState, useRef, useEffect } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      setMessages([...newMessages, { role: "assistant", content: data.reply || "Désolé, une erreur est survenue." }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Erreur de connexion. Réessaie." }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] max-w-3xl mx-auto">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #0ca2c2, #fea706)" }}
        >
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
        </div>
        <div>
          <h1 className="font-bold text-gray-900 text-sm">Assistant commercial Fleeti</h1>
          <p className="text-xs text-gray-400">Alimenté par Claude + base Notion</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center py-16">
            <div
              className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #e8f7fa, #fff7e6)" }}
            >
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="#0ca2c2" strokeWidth="1.5">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
              </svg>
            </div>
            <h2 className="font-bold text-gray-700 mb-1">Comment puis-je t&apos;aider ?</h2>
            <p className="text-sm text-gray-400 max-w-sm mx-auto">
              Pose-moi une question sur les industries cibles, les pain points terrain, les solutions Fleeti ou les personas.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {[
                "Quels sont les pain points dans le transport ?",
                "Quelle solution pour la gestion des chauffeurs ?",
                "Quels bénéfices pour le secteur minier ?",
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => { setInput(q); textareaRef.current?.focus(); }}
                  className="text-xs px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:border-fleeti-blue hover:text-fleeti-blue transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div
                className="w-7 h-7 rounded-lg mr-2 shrink-0 mt-0.5 flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #0ca2c2, #0887a3)" }}
              >
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H7l5-8v4h4l-5 8z"/>
                </svg>
              </div>
            )}
            <div
              className={`
                max-w-lg px-4 py-3 rounded-2xl text-sm leading-relaxed
                ${msg.role === "user"
                  ? "text-white rounded-br-sm"
                  : "bg-white text-gray-800 border border-gray-100 shadow-sm rounded-bl-sm"
                }
              `}
              style={msg.role === "user" ? { background: "#0ca2c2" } : {}}
            >
              {msg.content.split("\n").map((line, j) => (
                <span key={j}>
                  {line}
                  {j < msg.content.split("\n").length - 1 && <br />}
                </span>
              ))}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div
              className="w-7 h-7 rounded-lg mr-2 shrink-0 flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #0ca2c2, #0887a3)" }}
            >
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H7l5-8v4h4l-5 8z"/>
              </svg>
            </div>
            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1 items-center h-4">
                <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: "#0ca2c2", animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: "#0ca2c2", animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: "#0ca2c2", animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-4 bg-white border-t border-gray-200">
        <div className="flex gap-2 items-end bg-gray-50 border border-gray-200 rounded-xl p-2 focus-within:border-fleeti-blue focus-within:ring-1 focus-within:ring-fleeti-blue transition-all">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pose ta question sur Fleeti..."
            rows={1}
            className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 resize-none outline-none px-2 py-1.5 max-h-32"
            style={{ lineHeight: "1.5" }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: "#0ca2c2" }}
          >
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
        <p className="text-center text-xs text-gray-300 mt-2">Entrée pour envoyer · Maj+Entrée pour saut de ligne</p>
      </div>
    </div>
  );
}
