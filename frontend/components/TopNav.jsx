import { Icon } from "./Icon";
import { C } from "../constants/colors";

export function TopNav({ activePage, setPage, searchQuery, setSearchQuery, onRefresh, refreshing, stats }) {
  return (
    <header
      style={{
        position: "fixed", top: 0, left: 240, right: 0, height: 64,
        background: "rgba(14,14,15,0.85)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        display: "flex", alignItems: "center",
        padding: "0 32px", gap: 24, zIndex: 50,
        justifyContent: "space-between",
      }}
    >
      {/* Page title / search */}
      <div style={{ display: "flex", alignItems: "center", gap: 24, flex: 1 }}>
        <span className="font-headline" style={{ fontSize: 18, fontWeight: 700, color: C.onSurface, letterSpacing: "-0.01em" }}>
          {activePage === "home" && "AI News Feed"}
          {activePage === "chat" && "AI Intelligence"}
          {activePage === "search" && "Search & Discover"}
          {activePage === "article" && "Article Briefing"}
          {activePage === "saved" && "Saved Articles"}
          {activePage === "settings" && "Settings"}
          {activePage === "notifications" && "Notifications"}
          {activePage === "profile" && "Profile"}
        </span>
        {activePage === "home" && (
          <div className="search-bar-container top-nav-search" style={{ width: 320 }}>
            <Icon name="search" color={C.outline} size={16} />
            <input
              className="input-field"
              placeholder="Search news, AI insights..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && searchQuery.trim()) setPage("search"); }}
            />
          </div>
        )}
        {activePage === "home" && (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 11, color: C.outline, textTransform: "uppercase", letterSpacing: "0.12em" }}>
              {stats?.articles || 0} live items
            </span>
            <button className="btn-ghost" style={{ borderRadius: 10, padding: "8px 16px" }} onClick={onRefresh}>
              {refreshing ? "Refreshing..." : "Refresh Feed"}
            </button>
          </div>
        )}
      </div>

      {/* Right actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button style={{ padding: 8, background: "none", border: "none", cursor: "pointer", borderRadius: 8, color: C.onSurfaceVariant }}
          onClick={() => setPage("notifications")}
          onMouseEnter={e => e.currentTarget.style.color = C.primary}
          onMouseLeave={e => e.currentTarget.style.color = C.onSurfaceVariant}>
          <Icon name="notifications" size={20} />
        </button>
        <button style={{ padding: 8, background: "none", border: "none", cursor: "pointer", borderRadius: 8, color: C.onSurfaceVariant }}
          onClick={() => setPage("settings")}
          onMouseEnter={e => e.currentTarget.style.color = C.primary}
          onMouseLeave={e => e.currentTarget.style.color = C.onSurfaceVariant}>
          <Icon name="settings" size={20} />
        </button>
        <div
          onClick={() => setPage("profile")}
          style={{
            width: 34, height: 34, borderRadius: "50%",
            background: `linear-gradient(135deg, ${C.primary}, ${C.primaryContainer})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", border: `1px solid rgba(70,69,84,0.3)`,
            transition: "transform 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
        >
          <span style={{ fontSize: 13, fontWeight: 700, color: C.onPrimary }}>A</span>
        </div>
      </div>
    </header>
  );
}
