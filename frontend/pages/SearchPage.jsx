import { useEffect, useState } from "react";
import { Icon } from "../components/Icon";
import { C } from "../constants/colors";
import { api } from "../utils/api";
import { SOURCE_TABS, getArticleTheme } from "../utils/articles";


function SearchResult({ article, onOpenArticle, onToggleSave, isSaved }) {
  const theme = getArticleTheme(article);

  return (
    <div className="search-result-item" onClick={() => onOpenArticle(article)}>
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
        <div style={{ width: 92, minHeight: 72, borderRadius: 14, background: theme.gradient, flexShrink: 0, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 25% 20%, rgba(255,255,255,0.18), transparent 42%)" }} />
          <div style={{ position: "absolute", left: 10, bottom: 10 }}>
            <span className="chip tag" style={{ fontSize: 8, color: theme.accent }}>{article.source}</span>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span className="chip tag" style={{ fontSize: 9 }}>{article.category}</span>
              <span style={{ fontSize: 10, color: C.outline }}>{article.timeAgo}</span>
            </div>
            <button
              style={{ background: "none", border: "none", cursor: "pointer", color: isSaved ? theme.accent : C.outline }}
              onClick={(event) => {
                event.stopPropagation();
                onToggleSave(article);
              }}
            >
              <Icon name={isSaved ? "bookmark" : "bookmark_add"} size={18} />
            </button>
          </div>
          <div className="font-headline" style={{ fontSize: 17, fontWeight: 700, color: C.onSurface, marginBottom: 8, lineHeight: 1.35 }}>
            {article.title}
          </div>
          <p style={{ fontSize: 12, color: C.onSurfaceVariant, lineHeight: 1.6 }}>{article.summary}</p>
        </div>
      </div>
    </div>
  );
}

export function SearchPage({ onOpenArticle, onToggleSave, savedIds, initialQuery }) {
  const [query, setQuery] = useState(initialQuery || "");
  const [results, setResults] = useState([]);
  const [submitted, setSubmitted] = useState(Boolean(initialQuery));
  const [activeSource, setActiveSource] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function doSearch(nextQuery = query, nextSource = activeSource) {
    if (!nextQuery.trim()) return;

    setLoading(true);
    setError("");
    setSubmitted(true);
    try {
      const response = await api.search(nextQuery, { source: nextSource });
      setResults(response.items || []);
    } catch {
      setResults([]);
      setError("Search needs the backend API to be running.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      doSearch(initialQuery, activeSource);
    }
  }, [initialQuery]);

  const trending = [
    "OpenAI releases",
    "Anthropic research",
    "YouTube AI tutorials",
    "agent workflows",
    "model context windows",
  ];

  return (
    <div style={{ padding: "24px 32px 60px", maxWidth: 920, margin: "0 auto" }}>
      <div className="glass-panel" style={{ border: "1px solid rgba(70,69,84,0.3)", borderRadius: 20, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <Icon name="search" color={C.outline} size={20} />
        <input
          className="input-field"
          style={{ fontSize: 15 }}
          placeholder="Search OpenAI, Anthropic, YouTube coverage, or a topic..."
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setSubmitted(false);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") doSearch();
          }}
          autoFocus
        />
        {query && (
          <button style={{ background: "none", border: "none", cursor: "pointer", color: C.outline }} onClick={() => { setQuery(""); setSubmitted(false); setResults([]); }}>
            <Icon name="close" size={18} />
          </button>
        )}
        <button className="btn-primary" style={{ padding: "8px 20px", whiteSpace: "nowrap" }} onClick={() => doSearch()}>
          Search
        </button>
      </div>

      <div style={{ display: "flex", gap: 4, marginBottom: 24, overflowX: "auto", paddingBottom: 4 }}>
        {SOURCE_TABS.map((tab) => (
          <button
            key={tab.value}
            className={`tab-btn ${activeSource === tab.value ? "active" : ""}`}
            onClick={() => {
              setActiveSource(tab.value);
              if (query.trim()) doSearch(query, tab.value);
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {!submitted ? (
        <>
          <div style={{ marginBottom: 40 }}>
            <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: C.outline, marginBottom: 16 }}>Trending Topics</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {trending.map((topic) => (
                <button key={topic} className="btn-ghost" style={{ display: "flex", alignItems: "center", gap: 6, borderRadius: 10 }} onClick={() => { setQuery(topic); doSearch(topic, activeSource); }}>
                  <Icon name="trending_up" size={14} color={C.tertiary} /> {topic}
                </button>
              ))}
            </div>
          </div>
          <div className="gradient-border-card">
            <h3 className="font-headline" style={{ fontSize: 18, fontWeight: 700, color: C.onSurface, marginBottom: 10 }}>Search the unified archive</h3>
            <p style={{ fontSize: 14, color: C.onSurfaceVariant, lineHeight: 1.7 }}>
              Search works across digests, source descriptions, transcripts, and imported AI news records from OpenAI, Anthropic, and tracked YouTube channels.
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="gradient-border-card" style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <Icon name="auto_awesome" fill color={C.primary} size={18} />
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: C.primary }}>Search Summary</span>
            </div>
            <p style={{ fontSize: 14, color: C.onSurfaceVariant, lineHeight: 1.7 }}>
              {loading
                ? "Searching the live backend archive..."
                : `Found ${results.length} result${results.length === 1 ? "" : "s"} for "${query}" in ${activeSource === "all" ? "all sources" : activeSource}.`}
            </p>
            {error ? <p style={{ fontSize: 13, color: C.tertiary, marginTop: 10 }}>{error}</p> : null}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {results.map((result) => (
              <SearchResult
                key={result.id}
                article={result}
                onOpenArticle={onOpenArticle}
                onToggleSave={onToggleSave}
                isSaved={savedIds.has(result.id)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
