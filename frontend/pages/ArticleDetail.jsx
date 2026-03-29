import { Icon } from "../components/Icon";
import { C } from "../constants/colors";
import { getArticleShareText, getArticleTheme } from "../utils/articles";


export function ArticleDetail({ article, loading, setPage, onToggleSave, isSaved }) {
  if (!article) {
    return null;
  }

  const theme = getArticleTheme(article);

  async function handleShare() {
    const shareText = getArticleShareText(article);

    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.summary,
          url: article.url,
        });
        return;
      } catch {
        // Fall through to clipboard copy.
      }
    }

    try {
      await navigator.clipboard.writeText(shareText);
    } catch {
      // Ignore clipboard failures.
    }
  }

  return (
    <div style={{ maxWidth: 920, margin: "0 auto", padding: "24px 32px 60px" }}>
      <button className="btn-ghost" style={{ marginBottom: 32, display: "flex", alignItems: "center", gap: 8, borderRadius: 10 }} onClick={() => setPage("home")}>
        <Icon name="arrow_back" size={16} /> Back to Feed
      </button>

      <div style={{ borderRadius: 24, overflow: "hidden", minHeight: 280, marginBottom: 36, background: theme.gradient, position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 22% 22%, rgba(255,255,255,0.18), transparent 42%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(19,19,20,0.94), rgba(19,19,20,0.2) 60%, transparent)" }} />
        <div style={{ position: "relative", padding: "36px", display: "flex", flexDirection: "column", minHeight: 280 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
            <span className="chip tag" style={{ color: theme.accent }}>{article.source}</span>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: C.onSurfaceVariant }}>{article.timeAgo}</span>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: theme.accent }}>{article.category}</span>
            <span style={{ fontSize: 11, color: C.outline, marginLeft: "auto" }}>{article.readTime}</span>
          </div>
          <div style={{ flex: 1 }} />
          <h1 className="font-headline" style={{ fontSize: 40, fontWeight: 800, color: C.onSurface, lineHeight: 1.15, marginBottom: 16 }}>
            {article.title}
          </h1>
          <p style={{ fontSize: 16, color: C.onSurfaceVariant, lineHeight: 1.7, maxWidth: 700 }}>
            {article.summary}
          </p>
        </div>
      </div>

      <div className="gradient-border-card" style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg, ${theme.accent}, ${C.primaryContainer})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="auto_awesome" fill color={C.onPrimary} size={16} />
          </div>
          <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: theme.accent }}>
            Curator Intelligence
          </div>
          <div className="curator-pulse" style={{ marginLeft: "auto" }} />
        </div>
        <p style={{ fontSize: 15, color: C.onSurfaceVariant, lineHeight: 1.8, fontStyle: "italic" }}>
          {article.aiInsight}
        </p>
      </div>

      <div className="gradient-border-card" style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
          <h3 className="font-headline" style={{ fontSize: 20, fontWeight: 700, color: C.onSurface }}>
            Detailed Briefing
          </h3>
          {loading && <span style={{ fontSize: 12, color: C.outline }}>Loading full source context...</span>}
        </div>
        <div className="detail-body">
          <p>{article.fullContent || article.content || article.summary}</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 40, paddingTop: 32, borderTop: `1px solid rgba(70,69,84,0.2)`, flexWrap: "wrap" }}>
        <button className="btn-ghost" style={{ display: "flex", alignItems: "center", gap: 8, borderRadius: 10 }} onClick={() => onToggleSave(article)}>
          <Icon name={isSaved ? "bookmark" : "bookmark_add"} size={16} /> {isSaved ? "Saved" : "Save"}
        </button>
        <button className="btn-ghost" style={{ display: "flex", alignItems: "center", gap: 8, borderRadius: 10 }} onClick={handleShare}>
          <Icon name="share" size={16} /> Share
        </button>
        <button className="btn-ghost" style={{ display: "flex", alignItems: "center", gap: 8, borderRadius: 10 }} onClick={() => window.open(article.url, "_blank", "noopener,noreferrer")}>
          <Icon name="open_in_new" size={16} /> Open Source
        </button>
        <button className="btn-primary" style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }} onClick={() => setPage("chat")}>
          <Icon name="auto_awesome" fill color={C.onPrimary} size={16} /> Ask AI about this
        </button>
      </div>
    </div>
  );
}
