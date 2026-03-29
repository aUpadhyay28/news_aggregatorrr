import { C } from "../constants/colors";


export function SettingsPage({ settings, onUpdateSettings }) {
  function updateSetting(key, value) {
    onUpdateSettings((current) => ({ ...current, [key]: value }));
  }

  return (
    <div style={{ padding: "24px 32px 60px", maxWidth: 700 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div className="gradient-border-card">
          <h3 className="font-headline" style={{ fontSize: 16, fontWeight: 700, color: C.onSurface, marginBottom: 6 }}>Refresh Depth</h3>
          <p style={{ fontSize: 12, color: C.onSurfaceVariant, marginBottom: 20, lineHeight: 1.5 }}>
            Choose how much of the backend pipeline runs when you refresh the product feed.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { label: "Quick", value: "quick" },
              { label: "Enriched", value: "enriched" },
              { label: "Full", value: "full" },
            ].map((option) => (
              <button
                key={option.value}
                className={settings.refreshMode === option.value ? "btn-primary" : "btn-ghost"}
                style={{ padding: "10px 18px" }}
                onClick={() => updateSetting("refreshMode", option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="gradient-border-card">
          <h3 className="font-headline" style={{ fontSize: 16, fontWeight: 700, color: C.onSurface, marginBottom: 6 }}>Notifications</h3>
          <p style={{ fontSize: 12, color: C.onSurfaceVariant, marginBottom: 20, lineHeight: 1.5 }}>
            Control whether the UI highlights fresh feed items and pipeline activity.
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 14, color: C.onSurfaceVariant }}>Feed activity alerts</span>
            <button
              onClick={() => updateSetting("notifications", !settings.notifications)}
              style={{ width: 44, height: 24, borderRadius: 999, border: "none", cursor: "pointer", position: "relative", background: settings.notifications ? C.primary : C.surfaceVariant, transition: "background 0.2s" }}
            >
              <div style={{ position: "absolute", top: 2, left: settings.notifications ? 22 : 2, width: 20, height: 20, borderRadius: "50%", background: settings.notifications ? C.onPrimary : C.outline, transition: "left 0.2s" }} />
            </button>
          </div>
        </div>

        <div className="gradient-border-card">
          <h3 className="font-headline" style={{ fontSize: 16, fontWeight: 700, color: C.onSurface, marginBottom: 6 }}>Reading Density</h3>
          <p style={{ fontSize: 12, color: C.onSurfaceVariant, marginBottom: 20, lineHeight: 1.5 }}>
            Save a preferred density for the combined Curator experience.
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            {["compact", "comfortable", "spacious"].map((mode) => (
              <button
                key={mode}
                className={settings.density === mode ? "btn-primary" : "btn-ghost"}
                style={{ flex: 1, padding: "10px" }}
                onClick={() => updateSetting("density", mode)}
              >
                {mode[0].toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
