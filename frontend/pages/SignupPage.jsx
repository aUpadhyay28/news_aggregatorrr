import { useState } from "react";
import { C } from "../constants/colors";
import { Icon } from "../components/Icon";

export function SignupPage({ setPage, setIsAuthenticated }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  function validateForm() {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Password must contain uppercase, lowercase, and number";
    }

    // Confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Terms agreement
    if (!formData.agreeToTerms) {
      newErrors.terms = "You must agree to the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleInputChange(field, value) {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  }

  function handleSignup(e) {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    // Simulate signup API call
    setTimeout(() => {
      setIsLoading(false);
      setSuccess(true);

      // Auto-login after successful signup
      setTimeout(() => {
        if (setIsAuthenticated) setIsAuthenticated(true);
        if (setPage) setPage("welcome");
      }, 2000);
    }, 2000);
  }

  if (success) {
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
          boxShadow: `0 24px 48px rgba(0,0,0,0.3)`,
          textAlign: "center"
        }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: `linear-gradient(135deg, #4ade80, #22c55e)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px"
          }}>
            <Icon name="check_circle" fill color="#ffffff" size={32} />
          </div>
          <h2 className="font-headline" style={{
            fontSize: 24,
            fontWeight: 700,
            color: C.onSurface,
            marginBottom: 12
          }}>
            Welcome to The Curator!
          </h2>
          <p style={{
            fontSize: 14,
            color: C.onSurfaceVariant,
            marginBottom: 24
          }}>
            Your account has been created successfully. Redirecting you to the dashboard...
          </p>
          <div style={{
            width: 32,
            height: 32,
            border: `3px solid ${C.primary}`,
            borderTop: "3px solid transparent",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto"
          }} />
        </div>
      </div>
    );
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
        {/* Header */}
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
            Join The Curator
          </h1>
          <p style={{
            fontSize: 14,
            color: C.onSurfaceVariant
          }}>
            Create your account to get started
          </p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Name Field */}
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
              Full Name
            </label>
            <div style={{
              position: "relative",
              background: C.surfaceLowest,
              border: `1px solid ${errors.name ? "rgba(255,107,107,0.3)" : "rgba(70,69,84,0.3)"}`,
              borderRadius: 12,
              padding: "12px 16px",
              transition: "border-color 0.2s"
            }}>
              <Icon name="person" color={C.outline} size={18} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter your full name"
                style={{
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: C.onSurface,
                  fontSize: 14,
                  width: "100%",
                  paddingLeft: 32
                }}
              />
            </div>
            {errors.name && (
              <span style={{ fontSize: 12, color: "#ff6b6b", marginTop: 4, display: "block" }}>
                {errors.name}
              </span>
            )}
          </div>

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
              Email Address
            </label>
            <div style={{
              position: "relative",
              background: C.surfaceLowest,
              border: `1px solid ${errors.email ? "rgba(255,107,107,0.3)" : "rgba(70,69,84,0.3)"}`,
              borderRadius: 12,
              padding: "12px 16px",
              transition: "border-color 0.2s"
            }}>
              <Icon name="email" color={C.outline} size={18} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
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
              />
            </div>
            {errors.email && (
              <span style={{ fontSize: 12, color: "#ff6b6b", marginTop: 4, display: "block" }}>
                {errors.email}
              </span>
            )}
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
              border: `1px solid ${errors.password ? "rgba(255,107,107,0.3)" : "rgba(70,69,84,0.3)"}`,
              borderRadius: 12,
              padding: "12px 16px",
              transition: "border-color 0.2s"
            }}>
              <Icon name="lock" color={C.outline} size={18} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                placeholder="Create a strong password"
                style={{
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: C.onSurface,
                  fontSize: 14,
                  width: "100%",
                  paddingLeft: 32
                }}
              />
            </div>
            {errors.password && (
              <span style={{ fontSize: 12, color: "#ff6b6b", marginTop: 4, display: "block" }}>
                {errors.password}
              </span>
            )}
            <div style={{ fontSize: 11, color: C.outline, marginTop: 6, lineHeight: 1.4 }}>
              Must be 8+ characters with uppercase, lowercase, and number
            </div>
          </div>

          {/* Confirm Password Field */}
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
              Confirm Password
            </label>
            <div style={{
              position: "relative",
              background: C.surfaceLowest,
              border: `1px solid ${errors.confirmPassword ? "rgba(255,107,107,0.3)" : "rgba(70,69,84,0.3)"}`,
              borderRadius: 12,
              padding: "12px 16px",
              transition: "border-color 0.2s"
            }}>
              <Icon name="lock" color={C.outline} size={18} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                placeholder="Confirm your password"
                style={{
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: C.onSurface,
                  fontSize: 14,
                  width: "100%",
                  paddingLeft: 32
                }}
              />
            </div>
            {errors.confirmPassword && (
              <span style={{ fontSize: 12, color: "#ff6b6b", marginTop: 4, display: "block" }}>
                {errors.confirmPassword}
              </span>
            )}
          </div>

          {/* Terms Checkbox */}
          <div>
            <label style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              cursor: "pointer",
              fontSize: 13,
              color: C.onSurfaceVariant,
              lineHeight: 1.5
            }}>
              <input
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={(e) => handleInputChange("agreeToTerms", e.target.checked)}
                style={{
                  marginTop: 2,
                  width: 16,
                  height: 16,
                  accentColor: C.primary
                }}
              />
              <span>
                I agree to the{" "}
                <a href="#" style={{ color: C.primary, textDecoration: "none" }}>
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" style={{ color: C.primary, textDecoration: "none" }}>
                  Privacy Policy
                </a>
              </span>
            </label>
            {errors.terms && (
              <span style={{ fontSize: 12, color: "#ff6b6b", marginTop: 4, display: "block" }}>
                {errors.terms}
              </span>
            )}
          </div>

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
              gap: 8,
              marginTop: 8
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
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Login Link */}
        <div style={{
          marginTop: 24,
          textAlign: "center",
          fontSize: 14,
          color: C.onSurfaceVariant
        }}>
          Already have an account?{" "}
          <button
            onClick={() => setPage("login")}
            style={{
              background: "none",
              border: "none",
              color: C.primary,
              cursor: "pointer",
              fontSize: "inherit",
              textDecoration: "underline"
            }}
          >
            Sign in here
          </button>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: 24,
          textAlign: "center",
          fontSize: 12,
          color: C.outline
        }}>
          The Curator • AI Intelligence Platform
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