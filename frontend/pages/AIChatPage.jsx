import { useEffect, useRef, useState } from "react";
import { Icon } from "../components/Icon";
import { C } from "../constants/colors";
import { api } from "../utils/api";


export function AIChatPage({ article, articles }) {
  const starterPrompt = article
    ? `What matters most about "${article.title}"?`
    : "What are the most important AI news signals in my current feed?";

  const [messages, setMessages] = useState([
    {
      role: "ai",
      title: "Curator Intelligence",
      content: article
        ? `I have the current article loaded: "${article.title}". Ask for a summary, comparison, market implications, or why it matters.`
        : "Ask about the current OpenAI, Anthropic, and creator coverage in your feed. I can summarize the latest signals or zoom in on a specific article.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  async function sendMessage(text) {
    const message = text || input.trim();
    if (!message) return;

    setInput("");
    setMessages((current) => [...current, { role: "user", content: message }]);
    setIsTyping(true);

    try {
      const response = await api.chat({
        message,
        articleId: article?.id,
      });

      setMessages((current) => [
        ...current,
        {
          role: "ai",
          title: "Curator Response",
          content: response.answer,
          references: response.references || [],
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "ai",
          title: "Curator Response",
          content: "The chat endpoint is unavailable right now. Start the backend API to enable live feed-aware answers.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  }

  const prompts = article
    ? [
        "Summarize this article in plain English",
        "Why does this matter for AI builders?",
        "Compare this with recent OpenAI news",
      ]
    : [
        starterPrompt,
        "Which stories are strongest product signals?",
        "What should I read first and why?",
      ];

  return (
    <div style={{ display: "flex", height: "calc(100vh - 64px)", overflow: "hidden" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative" }}>
        <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "32px 48px 120px" }}>
          <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: 28 }}>
            {messages.map((msg, index) => (
              <div key={`${msg.role}-${index}`} className="fade-in">
                {msg.role === "user" ? (
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <div className="chat-bubble-user">{msg.content}</div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon name="auto_awesome" fill color={C.onPrimary} size={16} />
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: C.primary }}>
                        Curator Intelligence
                      </span>
                    </div>
                    <div className="glass-panel ai-glow ai-response-card">
                      {msg.title && (
                        <h2 className="font-headline" style={{ fontSize: 22, fontWeight: 700, color: C.onSurface, marginBottom: 14 }}>
                          {msg.title}
                        </h2>
                      )}
                      <p style={{ color: C.onSurfaceVariant, lineHeight: 1.8, fontSize: 14, whiteSpace: "pre-wrap" }}>{msg.content}</p>
                      {msg.references?.length ? (
                        <div style={{ marginTop: 22, paddingTop: 18, borderTop: "1px solid rgba(70,69,84,0.2)" }}>
                          <p style={{ fontSize: 10, fontWeight: 700, color: C.outline, textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 10 }}>
                            Referenced feed items
                          </p>
                          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {msg.references.map((reference) => (
                              <div key={reference.id} className="insight-card">
                                <Icon name="article" color={C.primary} size={18} />
                                <div>
                                  <p style={{ fontSize: 12, fontWeight: 700, color: C.onSurface, marginBottom: 6 }}>{reference.title}</p>
                                  <p style={{ fontSize: 11, color: C.onSurfaceVariant, lineHeight: 1.6 }}>{reference.summary}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }} className="fade-in">
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="auto_awesome" fill color={C.onPrimary} size={16} />
                </div>
                <div className="glass-panel" style={{ padding: "14px 20px", borderRadius: 16, display: "flex", gap: 6, alignItems: "center", border: `1px solid rgba(192,193,255,0.08)` }}>
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "16px 32px 24px", background: `linear-gradient(to top, ${C.bg} 70%, transparent)` }}>
          <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {prompts.map((prompt) => (
                <button key={prompt} className="btn-ghost" style={{ fontSize: 12, borderRadius: 10 }} onClick={() => sendMessage(prompt)}>
                  {prompt}
                </button>
              ))}
            </div>
            <div className="glass-panel" style={{ border: "1px solid rgba(70,69,84,0.3)", borderRadius: 20, padding: "8px 8px 8px 16px", display: "flex", alignItems: "center", gap: 8 }}>
              <input
                className="input-field"
                style={{ flex: 1, padding: "10px 0", fontSize: 14 }}
                placeholder="Ask The Curator about any article, source, or AI trend..."
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) sendMessage();
                }}
              />
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, background: C.surfaceContainer, padding: "6px 12px", borderRadius: 8, border: "1px solid rgba(70,69,84,0.2)" }}>
                  <div className="curator-pulse" style={{ width: 6, height: 6 }} />
                  <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: C.onSurfaceVariant }}>
                    Feed-Aware
                  </span>
                </div>
                <button
                  onClick={() => sendMessage()}
                  style={{ width: 40, height: 40, borderRadius: 12, background: C.primary, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.onPrimary }}
                >
                  <Icon name="send" fill size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <aside
        className="right-sidebar"
        style={{ width: 300, borderLeft: "1px solid rgba(70,69,84,0.1)", background: "rgba(28,27,28,0.3)", overflowY: "auto", padding: "24px 20px", display: "flex", flexDirection: "column", gap: 28 }}
      >
        <div>
          <h3 style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.2em", color: C.primary, marginBottom: 16 }}>
            Context Window
          </h3>
          <div className="insight-card">
            <Icon name="memory" color={C.primary} size={20} />
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: C.onSurface, marginBottom: 6 }}>Current feed loaded</p>
              <p style={{ fontSize: 11, color: C.onSurfaceVariant, lineHeight: 1.5 }}>
                {articles.length} recent items are available for summarization, comparison, and quick briefings.
              </p>
            </div>
          </div>
        </div>

        {article ? (
          <div>
            <h3 style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.2em", color: C.tertiary, marginBottom: 16 }}>
              Focus Article
            </h3>
            <div className="gradient-border-card">
              <p style={{ fontSize: 12, fontWeight: 700, color: C.onSurface, marginBottom: 10 }}>{article.title}</p>
              <p style={{ fontSize: 11, color: C.onSurfaceVariant, lineHeight: 1.6 }}>{article.summary}</p>
            </div>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
