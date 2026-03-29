import { Icon } from "./Icon";
import { C } from "../constants/colors";

export function MobileNav({ activePage, setPage }) {
  const items = [
    { icon: "home", page: "home" },
    { icon: "search", page: "search" },
    { icon: "auto_awesome", page: "chat" },
    { icon: "bookmark", page: "saved" },
  ];

  return (
    <nav
      className="mobile-nav"
      style={{
        position: "fixed", bottom: 0, left: 0, right: 0, height: 64,
        background: "rgba(14,14,15,0.92)", backdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        justifyContent: "space-around", alignItems: "center",
        zIndex: 60, padding: "0 16px",
        display: "flex",
      }}
    >
      {items.map(({ icon, page }) => (
        <button
          key={page}
          onClick={() => setPage(page)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 8 }}
        >
          <Icon name={icon} fill={activePage === page} color={activePage === page ? C.primary : C.outline} size={24} />
        </button>
      ))}
    </nav>
  );
}
