import { useState } from "react";
import { C } from "../constants/colors";
import { Icon } from "../components/Icon";

export function LoginPage({ setPage, setIsAuthenticated }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  function handleLogin(e) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simulate login API call
    setTimeout(() => {
      if (email === "demo@thecurator.ai" && password === "demo123") {
        if (setIsAuthenticated) setIsAuthenticated(true);
        if (setPage) setPage("welcome");
      } else {
        setError("Invalid email or password");
      }
      setIsLoading(false);
    }, 1500);
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(135deg, ${C.bg} 0%, ${C.surfaceLowest} 100%)`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px"
    }}>
      <div style={{
        width: "100%",
        maxWidth: 400,
        background: C.surfaceLow,
        borderRadius: 24,
        padding: 40,
        border: `1px solid rgba(70,69,84,0.2)`,
        boxShadow: `0 24px 48px rgba(0,0,0,0.3)`
      }}>
        {/* Logo/Brand */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${C.primary}, ${C.primaryContainer})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px"
          }}>
            <Icon name="auto_awesome" fill color={C.onPrimary} size={32} />
          </div>
          <h1 className="font-headline" style={{
            fontSize: 28,
            fontWeight: 800,
            color: C.onSurface,
            marginBottom: 8,
            letterSpacing: "-0.02em"
          }}>
            Welcome Back
          </h1>
          <p style={{
            fontSize: 14,
            color: C.onSurfaceVariant,
            marginBottom: 0
          }}>
            Sign in to The Curator
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Email Field */}
          <div>
            <label style={{
              fontSize: 12,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: C.outline,
              display: "block",
              marginBottom: 8
            }}>
              Email
            </label>
            <div style={{
              position: "relative",
              background: C.surfaceLowest,
              border: `1px solid ${error ? "rgba(255,107,107,0.3)" : "rgba(70,69,84,0.3)"}`,
              borderRadius: 12,
              padding: "12px 16px",
              transition: "border-color 0.2s"
            }}>
              <Icon name="email" color={C.outline} size={18} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                style={{
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: C.onSurface,
                  fontSize: 14,
                  width: "100%",
                  paddingLeft: 32
                }}
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label style={{
              fontSize: 12,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: C.outline,
              display: "block",
              marginBottom: 8
            }}>
              Password
            </label>
            <div style={{
              position: "relative",
              background: C.surfaceLowest,
              border: `1px solid ${error ? "rgba(255,107,107,0.3)" : "rgba(70,69,84,0.3)"}`,
              borderRadius: 12,
              padding: "12px 16px",
              transition: "border-color 0.2s"
            }}>
              <Icon name="lock" color={C.outline} size={18} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={{
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: C.onSurface,
                  fontSize: 14,
                  width: "100%",
                  paddingLeft: 32
                }}
                required
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              background: "rgba(255,107,107,0.1)",
              border: "1px solid rgba(255,107,107,0.3)",
              borderRadius: 8,
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              gap: 8
            }}>
              <Icon name="error" color="#ff6b6b" size={16} />
              <span style={{ fontSize: 13, color: "#ff6b6b" }}>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              background: `linear-gradient(135deg, ${C.primary}, ${C.primaryContainer})`,
              color: C.onPrimary,
              border: "none",
              borderRadius: 12,
              padding: "14px 24px",
              fontSize: 14,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.7 : 1,
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8
            }}
          >
            {isLoading ? (
              <>
                <div style={{
                  width: 16,
                  height: 16,
                  border: `2px solid ${C.onPrimary}`,
                  borderTop: "2px solid transparent",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite"
                }} />
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Demo Credentials */}
        <div style={{
          marginTop: 24,
          padding: 16,
          background: C.surfaceContainer,
          borderRadius: 12,
          border: "1px solid rgba(70,69,84,0.2)"
        }}>
          <div style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            color: C.primary,
            marginBottom: 8
          }}>
            Demo Credentials
          </div>
          <div style={{ fontSize: 12, color: C.onSurfaceVariant, lineHeight: 1.5 }}>
            <strong>Email:</strong> demo@thecurator.ai<br />
            <strong>Password:</strong> demo123
          </div>
        </div>

        {/* Login Link */}
        <div style={{
          marginTop: 24,
          textAlign: "center",
          fontSize: 14,
          color: C.onSurfaceVariant
        }}>
          Don't have an account?{" "}
          <button
            onClick={() => setPage("signup")}
            style={{
              background: "none",
              border: "none",
              color: C.primary,
              cursor: "pointer",
              fontSize: "inherit",
              textDecoration: "underline"
            }}
          >
            Sign up here
          </button>
        </div>
      </div>

      {/* Custom CSS for spinner animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}