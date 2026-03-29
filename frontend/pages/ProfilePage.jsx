import { useEffect, useState } from "react";
import { Icon } from "../components/Icon";
import { C } from "../constants/colors";


export function ProfilePage({ profile, onSaveProfile, savingProfile, stats, setPage }) {
  const [formData, setFormData] = useState(profile);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setFormData(profile);
  }, [profile]);

  function updateField(field, value) {
    setFormData((current) => ({ ...current, [field]: value }));
  }

  function updateInterests(value) {
    setFormData((current) => ({
      ...current,
      interests: value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    }));
  }

  async function saveChanges() {
    await onSaveProfile(formData);
    setIsEditing(false);
  }

  return (
    <div style={{ padding: "24px 32px 60px", maxWidth: 760, margin: "0 auto" }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, gap: 20, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 20 }}>
            <div
              style={{
                width: 96, height: 96, borderRadius: "50%",
                background: `linear-gradient(135deg, ${C.primary}, ${C.primaryContainer})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                border: `3px solid ${C.surfaceHigh}`,
                fontSize: 38, fontWeight: 800, color: C.onPrimary,
              }}
            >
              {(formData.name || "C").charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="font-headline" style={{ fontSize: 28, fontWeight: 700, color: C.onSurface, marginBottom: 8 }}>
                {formData.name}
              </h1>
              <p style={{ fontSize: 13, color: C.tertiary, fontWeight: 600 }}>{formData.title}</p>
            </div>
          </div>
          <button className={isEditing ? "btn-primary" : "btn-ghost"} onClick={() => (isEditing ? saveChanges() : setIsEditing(true))} style={{ display: "flex", alignItems: "center", gap: 8, borderRadius: 10 }}>
            <Icon name={isEditing ? "check" : "edit"} size={16} />
            {savingProfile ? "Saving..." : isEditing ? "Save" : "Edit"}
          </button>
        </div>

        {isEditing ? (
          <div className="gradient-border-card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <input
              className="input-field"
              value={formData.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="Name"
              style={{ background: C.surfaceLow, padding: "14px 16px", borderRadius: 12 }}
            />
            <input
              className="input-field"
              value={formData.title}
              onChange={(event) => updateField("title", event.target.value)}
              placeholder="Title"
              style={{ background: C.surfaceLow, padding: "14px 16px", borderRadius: 12 }}
            />
            <textarea
              value={formData.background}
              onChange={(event) => updateField("background", event.target.value)}
              rows={4}
              style={{ background: C.surfaceLow, border: "none", color: C.onSurface, padding: "14px 16px", borderRadius: 12, resize: "vertical", fontFamily: "inherit", fontSize: 14 }}
            />
            <textarea
              value={formData.interests.join(", ")}
              onChange={(event) => updateInterests(event.target.value)}
              rows={3}
              style={{ background: C.surfaceLow, border: "none", color: C.onSurface, padding: "14px 16px", borderRadius: 12, resize: "vertical", fontFamily: "inherit", fontSize: 14 }}
            />
          </div>
        ) : null}
      </div>

      {!isEditing && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div className="gradient-border-card">
            <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: C.primary, marginBottom: 10 }}>Background</h3>
            <p style={{ fontSize: 14, color: C.onSurfaceVariant, lineHeight: 1.7 }}>{formData.background}</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="gradient-border-card" style={{ minHeight: 120, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(192,193,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="article" color={C.primary} size={18} />
                </div>
                <div>
                  <p style={{ fontSize: 24, fontWeight: 800, color: C.primary }}>{stats?.articles || 0}</p>
                  <p style={{ fontSize: 11, color: C.outline, textTransform: "uppercase", letterSpacing: "0.1em" }}>Tracked Articles</p>
                </div>
              </div>
            </div>
            <div className="gradient-border-card" style={{ minHeight: 120, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(192,193,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="auto_awesome" color={C.primary} size={18} />
                </div>
                <div>
                  <p style={{ fontSize: 24, fontWeight: 800, color: C.primary }}>{stats?.digests || 0}</p>
                  <p style={{ fontSize: 11, color: C.outline, textTransform: "uppercase", letterSpacing: "0.1em" }}>Generated Digests</p>
                </div>
              </div>
            </div>
          </div>

          <div className="gradient-border-card">
            <h3 style={{ fontSize: 16, fontWeight: 700, color: C.onSurface, marginBottom: 16 }}>Interests</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {formData.interests.map((interest) => (
                <span key={interest} className="chip tag" style={{ fontSize: 10 }}>{interest}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      <button className="btn-ghost" style={{ marginTop: 32, display: "flex", alignItems: "center", gap: 8, borderRadius: 10 }} onClick={() => setPage("home")}>
        <Icon name="arrow_back" size={16} /> Back to Feed
      </button>
    </div>
  );
}
