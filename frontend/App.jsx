import { useEffect, useMemo, useState } from "react";
import { styles } from "./constants/styles";
import { C } from "./constants/colors";
import { Sidebar } from "./components/Sidebar";
import { TopNav } from "./components/TopNav";
import { MobileNav } from "./components/MobileNav";
import { HomeFeed } from "./pages/HomeFeed";
import { ArticleDetail } from "./pages/ArticleDetail";
import { AIChatPage } from "./pages/AIChatPage";
import { SearchPage } from "./pages/SearchPage";
import { SavedPage } from "./pages/SavedPage";
import { SettingsPage } from "./pages/SettingsPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { api } from "./utils/api";


const DEFAULT_PROFILE = {
  name: "Curator",
  title: "AI Research Operator",
  background: "Tracking OpenAI, Anthropic, and creator ecosystems for practical AI intelligence.",
  interests: ["LLMs", "AI tooling", "Model releases", "Agent workflows"],
  expertise_level: "Advanced",
  preferences: {
    prefer_practical: true,
    prefer_technical_depth: true,
  },
};

const DEFAULT_SETTINGS = {
  refreshMode: "quick",
  notifications: true,
  density: "comfortable",
};

function readStoredValue(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeStoredValue(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage errors in private browsing or restricted environments.
  }
}

function mergeArticles(existingMap, items) {
  const next = { ...existingMap };
  items.forEach((item) => {
    next[item.id] = { ...(next[item.id] || {}), ...item };
  });
  return next;
}

export default function App() {
  const [page, setPage] = useState("home");
  const [selectedArticleId, setSelectedArticleId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [feedItems, setFeedItems] = useState([]);
  const [stats, setStats] = useState({ articles: 0, digests: 0, sourceBreakdown: {} });
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [notifications, setNotifications] = useState([]);
  const [articleCache, setArticleCache] = useState({});
  const [savedIds, setSavedIds] = useState(() => readStoredValue("curator-saved-ids", []));
  const [settings, setSettings] = useState(() => readStoredValue("curator-settings", DEFAULT_SETTINGS));
  const [bootstrapInProgress, setBootstrapInProgress] = useState(false);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingArticle, setLoadingArticle] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    writeStoredValue("curator-saved-ids", savedIds);
  }, [savedIds]);

  useEffect(() => {
    writeStoredValue("curator-settings", settings);
  }, [settings]);

  async function loadFeed(activeSource = sourceFilter) {
    setLoadingFeed(true);
    setError("");
    try {
      const response = await api.getFeed({ source: activeSource, limit: 24 });
      setFeedItems(response.items || []);
      setStats(response.stats || { articles: 0, digests: 0, sourceBreakdown: {} });
      setProfile(response.profile || DEFAULT_PROFILE);
      setBootstrapInProgress(Boolean(response.bootstrapInProgress));
      setArticleCache((current) => mergeArticles(current, response.items || []));
    } catch (err) {
      setError("The backend feed is not reachable yet. Start the Python API and refresh.");
      setFeedItems([]);
      setBootstrapInProgress(false);
    } finally {
      setLoadingFeed(false);
    }
  }

  async function loadMeta() {
    try {
      const [profileResponse, notificationResponse] = await Promise.all([
        api.getProfile(),
        api.getNotifications(),
      ]);
      setProfile(profileResponse || DEFAULT_PROFILE);
      setNotifications(notificationResponse.items || []);
    } catch {
      setNotifications([]);
    }
  }

  useEffect(() => {
    loadFeed(sourceFilter);
  }, [sourceFilter]);

  useEffect(() => {
    if (!bootstrapInProgress) return undefined;

    const timeoutId = window.setTimeout(() => {
      loadFeed(sourceFilter);
    }, 8000);

    return () => window.clearTimeout(timeoutId);
  }, [bootstrapInProgress, sourceFilter]);

  useEffect(() => {
    loadMeta();
  }, []);

  const selectedArticle = selectedArticleId ? articleCache[selectedArticleId] || null : null;
  const savedArticles = useMemo(
    () => savedIds.map((id) => articleCache[id]).filter(Boolean),
    [savedIds, articleCache]
  );

  function navigate(nextPage) {
    setPage(nextPage);
    window.scrollTo(0, 0);
  }

  async function openArticle(article) {
    const articleId = typeof article === "string" ? article : article.id;
    const seedArticle = typeof article === "string" ? articleCache[articleId] : article;

    if (seedArticle) {
      setArticleCache((current) => mergeArticles(current, [seedArticle]));
    }
    setSelectedArticleId(articleId);
    setPage("article");
    setLoadingArticle(true);

    try {
      const detail = await api.getArticle(articleId);
      setArticleCache((current) => mergeArticles(current, [detail]));
    } catch {
      // Keep the preview article if full detail is unavailable.
    } finally {
      setLoadingArticle(false);
    }
  }

  function toggleSave(article) {
    setArticleCache((current) => mergeArticles(current, [article]));
    setSavedIds((current) =>
      current.includes(article.id)
        ? current.filter((id) => id !== article.id)
        : [...current, article.id]
    );
  }

  async function refreshFeed() {
    setRefreshing(true);
    setError("");
    try {
      await api.refreshPipeline({ hours: 96, mode: settings.refreshMode });
      await Promise.all([loadFeed(sourceFilter), loadMeta()]);
    } catch {
      setError("Refresh failed. The API is running, but the scraping pipeline could not complete.");
    } finally {
      setRefreshing(false);
    }
  }

  async function saveProfile(nextProfile) {
    setSavingProfile(true);
    try {
      const updatedProfile = await api.updateProfile(nextProfile);
      setProfile(updatedProfile);
    } finally {
      setSavingProfile(false);
    }
  }

  return (
    <>
      <style>{styles}</style>
      <div style={{ minHeight: "100vh", background: C.bg }}>
        <Sidebar activePage={page} setPage={navigate} />
        <div className="main-content" style={{ marginLeft: 240 }}>
          <TopNav
            activePage={page}
            setPage={navigate}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onRefresh={refreshFeed}
            refreshing={refreshing}
            stats={stats}
          />
          <main style={{ paddingTop: 64, minHeight: "100vh" }}>
            {page === "home" && (
              <HomeFeed
                articles={feedItems}
                activeSource={sourceFilter}
                onSourceChange={setSourceFilter}
                onOpenArticle={openArticle}
                onToggleSave={toggleSave}
                savedIds={new Set(savedIds)}
                onRefresh={refreshFeed}
                refreshing={refreshing}
                loading={loadingFeed}
                error={error}
                bootstrapInProgress={bootstrapInProgress}
              />
            )}
            {page === "article" && (
              <ArticleDetail
                article={selectedArticle}
                loading={loadingArticle}
                setPage={navigate}
                onToggleSave={toggleSave}
                isSaved={selectedArticle ? savedIds.includes(selectedArticle.id) : false}
              />
            )}
            {page === "chat" && (
              <AIChatPage
                article={selectedArticle}
                articles={feedItems}
              />
            )}
            {page === "search" && (
              <SearchPage
                setPage={navigate}
                onOpenArticle={openArticle}
                onToggleSave={toggleSave}
                savedIds={new Set(savedIds)}
                initialQuery={searchQuery}
              />
            )}
            {page === "saved" && (
              <SavedPage
                savedArticles={savedArticles}
                onOpenArticle={openArticle}
                onToggleSave={toggleSave}
              />
            )}
            {page === "settings" && (
              <SettingsPage
                settings={settings}
                onUpdateSettings={setSettings}
              />
            )}
            {page === "notifications" && (
              <NotificationsPage
                notifications={notifications}
                onOpenArticle={openArticle}
                setPage={navigate}
              />
            )}
            {page === "profile" && (
              <ProfilePage
                profile={profile}
                onSaveProfile={saveProfile}
                savingProfile={savingProfile}
                stats={stats}
                setPage={navigate}
              />
            )}
          </main>
        </div>
        <MobileNav activePage={page} setPage={navigate} />
      </div>
    </>
  );
}
