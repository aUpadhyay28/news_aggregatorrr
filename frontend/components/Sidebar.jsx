import { Icon } from "./Icon";
import { C } from "../constants/colors";

export function Sidebar({ activePage, setPage }) {
  const items = [
    { icon: "home", label: "Feed", page: "home" },
    { icon: "search", label: "Search", page: "search" },
    { icon: "bookmark", label: "Saved", page: "saved" },
    { icon: "auto_awesome", label: "AI Chat", page: "chat" },
    { icon: "settings", label: "Settings", page: "settings" },
  ];

  return (
    <aside
      className="sidebar"
      style={{
        position: "fixed", left: 0, top: 0, height: "100vh",
        width: 240, background: C.surfaceLowest,
        display: "flex", flexDirection: "column",
        padding: "28px 16px", gap: 0, zIndex: 60,
      }}
    >
      {/* Brand */}
      <div style={{ padding: "0 8px 32px" }}>
        <div className="font-headline" style={{ fontSize: 22, fontWeight: 800, color: C.primary, letterSpacing: "-0.02em" }}>
          The Curator
        </div>
        <div style={{ fontSize: 9, fontWeight: 700, color: C.outline, textTransform: "uppercase", letterSpacing: "0.2em", marginTop: 4 }}>
          Unified AI News
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
        {items.map(({ icon, label, page }) => (
          <button
            key={page}
            className={`nav-item ${activePage === page ? "active" : ""}`}
            onClick={() => setPage(page)}
          >
            <Icon name={icon} fill={activePage === page} color={activePage === page ? C.primary : undefined} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* Upgrade */}
      <div style={{ paddingTop: 16 }}>
        <button className="btn-primary" style={{ width: "100%", padding: "12px" }} onClick={() => setPage("profile")}>
          Personalize Feed
        </button>
      </div>
    </aside>
  );
}
