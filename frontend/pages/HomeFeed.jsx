import { Icon } from "../components/Icon";
import { C } from "../constants/colors";
import { SOURCE_TABS, getArticleTheme } from "../utils/articles";


function EmptyState({ onRefresh, error, bootstrapInProgress }) {
  return (
    <div style={{ padding: "120px 32px", textAlign: "center", maxWidth: 720, margin: "0 auto" }}>
      <div style={{ width: 72, height: 72, borderRadius: "50%", background: C.surfaceHigh, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
        <Icon name="auto_awesome" color={C.primary} size={30} />
      </div>
      <h2 className="font-headline" style={{ fontSize: 28, fontWeight: 800, color: C.onSurface, marginBottom: 12 }}>
        No AI stories yet
      </h2>
      <p style={{ color: C.onSurfaceVariant, lineHeight: 1.7, marginBottom: 24 }}>
        {bootstrapInProgress
          ? "The backend is fetching fresh OpenAI, Anthropic, and YouTube items right now. Stay on this page for a moment or press Refresh again."
          : error || "The curator feed is waiting for the backend pipeline to collect fresh OpenAI, Anthropic, and YouTube updates."}
      </p>
      <button className="btn-primary" onClick={onRefresh}>
        {bootstrapInProgress ? "Refresh Again" : "Refresh Pipeline"}
      </button>
    </div>
  );
}

function HeroCard({ article, onOpenArticle }) {
  const theme = getArticleTheme(article);

  return (
    <div className="hero-section" style={{ marginBottom: 32, minHeight: 340, background: theme.gradient }} onClick={() => onOpenArticle(article)}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.14), transparent 45%)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(19,19,20,0.95), rgba(19,19,20,0.38) 55%, transparent)" }} />
      <div style={{ position: "relative", padding: "40px", display: "flex", flexDirection: "column", minHeight: 340 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <span className="chip tag">{article.source}</span>
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: C.onSurfaceVariant }}>
            {article.timeAgo}
          </span>
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: theme.accent }}>
            {article.category}
          </span>
        </div>
        <div style={{ flex: 1 }} />
        <h1 className="font-headline" style={{ fontSize: 34, fontWeight: 800, color: C.onSurface, marginBottom: 16, lineHeight: 1.18, maxWidth: 760 }}>
          {article.title}
        </h1>
        <p style={{ color: C.onSurfaceVariant, fontSize: 15, maxWidth: 620, marginBottom: 24, lineHeight: 1.7 }}>
          {article.summary}
        </p>
        <div className="glass-panel" style={{ display: "inline-flex", gap: 12, alignItems: "flex-start", padding: "14px 20px", borderRadius: 14, border: "1px solid rgba(70,69,84,0.15)", maxWidth: 580 }}>
          <div className="curator-pulse" style={{ marginTop: 5 }} />
          <div>
            <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: theme.accent, display: "block", marginBottom: 4 }}>
              AI Contextual Insight
            </span>
            <p style={{ fontSize: 13, color: "rgba(229,226,227,0.85)", fontStyle: "italic", lineHeight: 1.6 }}>
              {article.aiInsight}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeedCard({ article, onOpenArticle, onToggleSave, isSaved }) {
  const theme = getArticleTheme(article);

  return (
    <article className="article-card" onClick={() => onOpenArticle(article)}>
      <div style={{ height: 180, background: theme.gradient, position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 25% 25%, rgba(255,255,255,0.16), transparent 42%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(19,19,20,0.92), rgba(19,19,20,0.15) 60%, transparent)" }} />
        <div style={{ position: "absolute", left: 20, bottom: 20 }}>
          <span className="chip tag" style={{ color: theme.accent }}>{article.source}</span>
        </div>
        <button
          style={{ position: "absolute", top: 16, right: 16, background: "rgba(19,19,20,0.45)", border: "none", cursor: "pointer", color: isSaved ? theme.accent : C.onSurfaceVariant, padding: 8, borderRadius: 10 }}
          onClick={(event) => {
            event.stopPropagation();
            onToggleSave(article);
          }}
        >
          <Icon name={isSaved ? "bookmark" : "bookmark_add"} size={18} />
        </button>
      </div>
      <div style={{ padding: "20px 24px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: C.outline }}>
            {article.category} • {article.timeAgo}
          </span>
          <span style={{ fontSize: 11, color: C.outline }}>{article.readTime}</span>
        </div>
        <h3 className="font-headline" style={{ fontSize: 18, fontWeight: 700, color: C.onSurface, marginBottom: 16, lineHeight: 1.35 }}>
          {article.title}
        </h3>
        <div style={{ background: "rgba(42,42,43,0.4)", borderRadius: 12, padding: "12px 16px", borderLeft: `3px solid ${theme.accent}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <Icon name="auto_awesome" color={theme.accent} size={13} />
            <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: theme.accent }}>
              Curator Summary
            </span>
          </div>
          <p style={{ fontSize: 12, color: C.onSurfaceVariant, lineHeight: 1.6 }}>
            {article.summary}
          </p>
        </div>
      </div>
    </article>
  );
}

export function HomeFeed({
  articles,
  activeSource,
  onSourceChange,
  onOpenArticle,
  onToggleSave,
  savedIds,
  onRefresh,
  refreshing,
  loading,
  error,
  bootstrapInProgress,
}) {
  if (loading) {
    return (
      <div style={{ padding: "160px 32px", textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", margin: "0 auto 20px", border: `3px solid ${C.surfaceVariant}`, borderTopColor: C.primary, animation: "spin 1s linear infinite" }} />
        <p style={{ color: C.onSurfaceVariant }}>Loading your unified AI news feed...</p>
      </div>
    );
  }

  if (!articles.length) {
    return <EmptyState onRefresh={onRefresh} error={error} bootstrapInProgress={bootstrapInProgress} />;
  }

  const hero = articles[0];
  const rest = articles.slice(1);

  return (
    <div style={{ padding: "24px 32px 40px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 4, overflowX: "auto", paddingBottom: 4 }}>
          {SOURCE_TABS.map((tab) => (
            <button key={tab.value} className={`tab-btn ${activeSource === tab.value ? "active" : ""}`} onClick={() => onSourceChange(tab.value)}>
              {tab.label}
            </button>
          ))}
        </div>
        <button className="btn-ghost" style={{ borderRadius: 10 }} onClick={onRefresh}>
          {refreshing ? "Refreshing..." : "Run Refresh"}
        </button>
      </div>

      <HeroCard article={hero} onOpenArticle={onOpenArticle} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
        {rest.map((article) => (
          <FeedCard
            key={article.id}
            article={article}
            onOpenArticle={onOpenArticle}
            onToggleSave={onToggleSave}
            isSaved={savedIds.has(article.id)}
          />
        ))}
      </div>
    </div>
  );
}
