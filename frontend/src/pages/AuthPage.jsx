import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Mail,
  Phone,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
  ShieldCheck,
  Tag,
} from "lucide-react";
import { useApp } from "../context/AppContext";

export default function AuthPage({ initialMode = "login" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { registerUser, loginUser, currentUser, cart, showToast } = useApp();

  // Mode: "login" or "register"
  const [mode, setMode] = useState(
    location.pathname === "/register" ? "register" : initialMode
  );

  // Registration sub-method: "gmail" or "phone"
  const [regMethod, setRegMethod] = useState("gmail");

  // Form fields
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    location: "Mumbai, India",
  });

  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.name.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    if (regMethod === "gmail") {
      if (!formData.email.trim() || !formData.email.includes("@")) {
        setErrorMessage("Please enter a valid Gmail / Email address.");
        return;
      }
    } else {
      if (!formData.phone.trim() || formData.phone.length < 7) {
        setErrorMessage("Please enter a valid mobile phone number.");
        return;
      }
    }

    if (!formData.password || formData.password.length < 4) {
      setErrorMessage("Password must be at least 4 characters long.");
      return;
    }

    setIsLoading(true);

    const result = await registerUser({
      name: formData.name.trim(),
      registrationMethod: regMethod,
      email: regMethod === "gmail" ? formData.email.trim() : "",
      phone: regMethod === "phone" ? formData.phone.trim() : "",
      password: formData.password,
      location: formData.location.trim() || "Thrift Community",
    });

    setIsLoading(false);

    if (result.success) {
      // Redirect to checkout if cart has items, otherwise to store
      if (cart.length > 0) {
        navigate("/checkout");
      } else {
        navigate("/market");
      }
    } else {
      setErrorMessage(result.error || "Registration failed. Please try again.");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!loginIdentifier.trim()) {
      setErrorMessage("Please enter your registered Gmail or Phone number.");
      return;
    }

    if (!loginPassword) {
      setErrorMessage("Please enter your password.");
      return;
    }

    setIsLoading(true);

    const result = await loginUser({
      identifier: loginIdentifier.trim(),
      password: loginPassword,
    });

    setIsLoading(false);

    if (result.success) {
      if (cart.length > 0) {
        navigate("/checkout");
      } else {
        navigate("/market");
      }
    } else {
      setErrorMessage(result.error || "Invalid credentials. Please verify your email/phone and password.");
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-page-centered-box">
        <div className="auth-page-card">
          {/* Top Brand Logo */}
          <div className="auth-card-top-brand">
            <Link to="/market" className="brand-logo">
              <span className="brand-name">
                Kloset<span className="brand-dot">.</span>
              </span>
            </Link>
            <p className="auth-card-tagline">Sustainable Community Thrift & Wardrobe</p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="auth-mode-tabs-bar">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setErrorMessage("");
                }}
                className={`auth-mode-tab ${mode === "login" ? "active" : ""}`}
              >
                Sign In
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setErrorMessage("");
                }}
                className={`auth-mode-tab ${mode === "register" ? "active" : ""}`}
              >
                Create Account
              </button>
            </div>

            {errorMessage && (
              <div className="auth-error-alert">
                <span>{errorMessage}</span>
              </div>
            )}

            {/* =========================================================================
                REGISTER FORM
                ========================================================================= */}
            {mode === "register" && (
              <form onSubmit={handleRegister} className="auth-page-form">
                <div className="form-intro-block">
                  <h2>Join the Thrift Community</h2>
                  <p>Choose whether to register using your Gmail or your Mobile Phone number.</p>
                </div>

                {/* Registration Method Selector */}
                <div className="method-choice-wrapper">
                  <label className="method-choice-label">Register using:</label>
                  <div className="method-toggle-grid">
                    <button
                      type="button"
                      onClick={() => setRegMethod("gmail")}
                      className={`method-toggle-btn ${regMethod === "gmail" ? "selected" : ""}`}
                    >
                      <Mail size={16} className="gmail-accent" />
                      <span>Gmail / Email</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRegMethod("phone")}
                      className={`method-toggle-btn ${regMethod === "phone" ? "selected" : ""}`}
                    >
                      <Phone size={16} className="phone-accent" />
                      <span>Phone Number</span>
                    </button>
                  </div>
                </div>

                {/* Full Name */}
                <div className="auth-field-block">
                  <label>
                    Full Name <span className="req">*</span>
                  </label>
                  <div className="input-icon-box">
                    <User size={16} className="field-icon" />
                    <input
                      type="text"
                      name="name"
                      placeholder="e.g. Maya Lin"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                {/* Conditional Gmail vs Phone field */}
                {regMethod === "gmail" ? (
                  <div className="auth-field-block">
                    <label>
                      Gmail / Email Address <span className="req">*</span>
                    </label>
                    <div className="input-icon-box">
                      <Mail size={16} className="field-icon gmail-accent" />
                      <input
                        type="email"
                        name="email"
                        placeholder="e.g. maya.lin@gmail.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <span className="field-hint">We'll use this for buyer order confirmations.</span>
                  </div>
                ) : (
                  <div className="auth-field-block">
                    <label>
                      Mobile Phone Number <span className="req">*</span>
                    </label>
                    <div className="input-icon-box">
                      <Phone size={16} className="field-icon phone-accent" />
                      <input
                        type="tel"
                        name="phone"
                        placeholder="e.g. 9876543210"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <span className="field-hint">Buyers and sellers will contact you via this number.</span>
                  </div>
                )}

                {/* Password */}
                <div className="auth-field-block">
                  <label>
                    Create Password <span className="req">*</span>
                  </label>
                  <div className="input-icon-box">
                    <Lock size={16} className="field-icon" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="At least 4 characters"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="password-toggle-eye"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* City Location */}
                <div className="auth-field-block">
                  <label>City / Location (Optional)</label>
                  <input
                    type="text"
                    name="location"
                    placeholder="e.g. Mumbai, New Delhi, Bengaluru"
                    value={formData.location}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Submit Register Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="button button-accent auth-submit-large-btn"
                >
                  <span>{isLoading ? "Creating Profile..." : "Register & Start Thrifting"}</span>
                  <ArrowRight size={16} />
                </button>

                <p className="auth-switch-footer">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setErrorMessage("");
                    }}
                    className="inline-switch-link"
                  >
                    Sign In here
                  </button>
                </p>

                <div style={{ textAlign: "center", marginTop: "14px", paddingTop: "12px", borderTop: "1px dashed var(--border-light)" }}>
                  <Link to="/market" style={{ fontSize: "12px", color: "var(--text-muted)", textDecoration: "underline", fontWeight: "600" }}>
                    Skip and enter store as Guest →
                  </Link>
                </div>
              </form>
            )}

            {/* =========================================================================
                SIGN IN / LOGIN FORM
                ========================================================================= */}
            {mode === "login" && (
              <form onSubmit={handleLogin} className="auth-page-form">
                <div className="form-intro-block">
                  <h2>Sign In to Your Account</h2>
                  <p>Enter the Gmail address or Mobile Phone number you registered with.</p>
                </div>

                {/* Gmail or Phone identifier */}
                <div className="auth-field-block">
                  <label>
                    Gmail or Phone Number <span className="req">*</span>
                  </label>
                  <div className="input-icon-box">
                    <User size={16} className="field-icon" />
                    <input
                      type="text"
                      placeholder="e.g. maya.lin@gmail.com OR 9876543210"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      required
                    />
                  </div>
                  <span className="field-hint">Supports both your registered Gmail and Phone number.</span>
                </div>

                {/* Password */}
                <div className="auth-field-block">
                  <label>
                    Password <span className="req">*</span>
                  </label>
                  <div className="input-icon-box">
                    <Lock size={16} className="field-icon" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="password-toggle-eye"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Submit Sign In Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="button button-accent auth-submit-large-btn"
                >
                  <span>{isLoading ? "Signing In..." : "Sign In to Kloset"}</span>
                  <ArrowRight size={16} />
                </button>

                <p className="auth-switch-footer">
                  Don't have an account yet?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("register");
                      setErrorMessage("");
                    }}
                    className="inline-switch-link"
                  >
                    Create an account
                  </button>
                </p>

                <div style={{ textAlign: "center", marginTop: "14px", paddingTop: "12px", borderTop: "1px dashed var(--border-light)" }}>
                  <Link to="/market" style={{ fontSize: "12px", color: "var(--text-muted)", textDecoration: "underline", fontWeight: "600" }}>
                    Skip and enter store as Guest →
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    );
}
