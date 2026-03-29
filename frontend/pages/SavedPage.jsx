import { Icon } from "../components/Icon";
import { C } from "../constants/colors";
import { getArticleTheme } from "../utils/articles";


function SavedCard({ article, onOpenArticle, onToggleSave }) {
  const theme = getArticleTheme(article);

  return (
    <article className="article-card" onClick={() => onOpenArticle(article)}>
      <div style={{ height: 170, background: theme.gradient, position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 25% 25%, rgba(255,255,255,0.16), transparent 42%)" }} />
        <div style={{ position: "absolute", left: 18, bottom: 18 }}>
          <span className="chip tag" style={{ color: theme.accent }}>{article.source}</span>
        </div>
        <button
          style={{ position: "absolute", top: 14, right: 14, background: "rgba(19,19,20,0.45)", border: "none", color: theme.accent, cursor: "pointer", borderRadius: 10, padding: 8 }}
          onClick={(event) => {
            event.stopPropagation();
            onToggleSave(article);
          }}
        >
          <Icon name="bookmark" size={18} />
        </button>
      </div>
      <div style={{ padding: "20px 24px 24px" }}>
        <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: C.outline, marginBottom: 12 }}>
          {article.category} • {article.timeAgo}
        </p>
        <h3 className="font-headline" style={{ fontSize: 18, fontWeight: 700, color: C.onSurface, marginBottom: 12, lineHeight: 1.35 }}>
          {article.title}
        </h3>
        <p style={{ fontSize: 13, color: C.onSurfaceVariant, lineHeight: 1.7 }}>{article.summary}</p>
      </div>
    </article>
  );
}

export function SavedPage({ savedArticles, onOpenArticle, onToggleSave }) {
  if (!savedArticles.length) {
    return (
      <div style={{ padding: "24px 32px 60px" }}>
        <div style={{ textAlign: "center", padding: "100px 0 40px" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: C.surfaceHigh, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <Icon name="bookmark" color={C.outline} size={28} />
          </div>
          <h2 className="font-headline" style={{ fontSize: 24, fontWeight: 700, color: C.onSurface, marginBottom: 12 }}>Your saved briefings will appear here</h2>
          <p style={{ color: C.onSurfaceVariant, fontSize: 14, marginBottom: 28 }}>Bookmark stories from the live feed to build your own AI reading queue.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px 32px 60px" }}>
      <div style={{ marginBottom: 24 }}>
        <h2 className="font-headline" style={{ fontSize: 24, fontWeight: 700, color: C.onSurface, marginBottom: 8 }}>Saved Articles</h2>
        <p style={{ color: C.onSurfaceVariant, fontSize: 13 }}>{savedArticles.length} curated item{savedArticles.length === 1 ? "" : "s"} in your library</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
        {savedArticles.map((article) => (
          <SavedCard key={article.id} article={article} onOpenArticle={onOpenArticle} onToggleSave={onToggleSave} />
        ))}
      </div>
    </div>
  );
}
