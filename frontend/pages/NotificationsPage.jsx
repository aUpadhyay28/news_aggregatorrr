import { Icon } from "../components/Icon";
import { C } from "../constants/colors";


export function NotificationsPage({ notifications, onOpenArticle, setPage }) {
  return (
    <div style={{ padding: "24px 32px 60px", maxWidth: 760, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h2 className="font-headline" style={{ fontSize: 24, fontWeight: 700, color: C.onSurface, marginBottom: 4 }}>Notifications</h2>
          <p style={{ fontSize: 12, color: C.onSurfaceVariant }}>Latest feed and pipeline activity</p>
        </div>
      </div>

      {!notifications.length ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: C.surfaceHigh, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <Icon name="notifications_none" color={C.outline} size={28} />
          </div>
          <h3 className="font-headline" style={{ fontSize: 18, fontWeight: 700, color: C.onSurface, marginBottom: 8 }}>Nothing new yet</h3>
          <p style={{ color: C.onSurfaceVariant, fontSize: 13 }}>Run a refresh to populate activity from the backend.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {notifications.map((notification) => (
            <div
              key={notification.id}
              style={{
                background: C.surfaceHigh,
                border: "1px solid rgba(192,193,255,0.16)",
                borderRadius: 16,
                padding: 20,
                transition: "all 0.2s",
                cursor: "pointer",
              }}
              onClick={() => onOpenArticle(notification.articleId)}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(192,193,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon name="campaign" color={C.primary} size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: C.onSurface }}>{notification.title}</h3>
                    <span style={{ fontSize: 10, color: C.primary, textTransform: "uppercase", letterSpacing: "0.12em" }}>{notification.category}</span>
                  </div>
                  <p style={{ fontSize: 12, color: C.onSurfaceVariant, marginBottom: 10, lineHeight: 1.6 }}>{notification.message}</p>
                  <span style={{ fontSize: 10, color: C.outline }}>{notification.time}</span>
                </div>
                <Icon name="chevron_right" color={C.outline} size={18} />
              </div>
            </div>
          ))}
        </div>
      )}

      <button className="btn-ghost" style={{ marginTop: 32, display: "flex", alignItems: "center", gap: 8, borderRadius: 10 }} onClick={() => setPage("home")}>
        <Icon name="arrow_back" size={16} /> Back to Feed
      </button>
    </div>
  );
}
