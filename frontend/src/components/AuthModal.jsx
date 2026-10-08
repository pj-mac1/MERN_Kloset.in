import React, { useState } from "react";
import {
  X,
  Mail,
  Phone,
  User,
  Lock,
  Eye,
  EyeOff,
  MapPin,
  Sparkles,
  ShoppingBag,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { useApp } from "../context/AppContext";

export default function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalTab,
    setAuthModalTab,
    registerUser,
    loginUser,
    switchUser,
    users,
  } = useApp();

  // Registration state
  const [registerType, setRegisterType] = useState("gmail"); // 'gmail' or 'phone'
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [location, setLocation] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Login state
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isAuthModalOpen) return null;

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim()) {
      setErrorMsg("Please enter your name");
      return;
    }

    if (registerType === "gmail" && !email.trim()) {
      setErrorMsg("Please enter your Gmail / Email address");
      return;
    }

    if (registerType === "phone" && !phone.trim()) {
      setErrorMsg("Please enter your phone number");
      return;
    }

    if (!password || password.length < 4) {
      setErrorMsg("Password must be at least 4 characters");
      return;
    }

    setLoading(true);
    const result = await registerUser({
      name: name.trim(),
      registrationMethod: registerType,
      email: registerType === "gmail" ? email.trim() : "",
      phone: registerType === "phone" ? phone.trim() : "",
      password,
      location: location.trim() || "Thrift Community",
    });

    setLoading(false);
    if (!result.success) {
      setErrorMsg(result.error);
    } else {
      // Clear form
      setName("");
      setEmail("");
      setPhone("");
      setPassword("");
      setLocation("");
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!loginIdentifier.trim()) {
      setErrorMsg("Please enter your Gmail or Phone number");
      return;
    }

    if (!loginPassword) {
      setErrorMsg("Please enter your password");
      return;
    }

    setLoading(true);
    const result = await loginUser({
      identifier: loginIdentifier.trim(),
      password: loginPassword,
    });

    setLoading(false);
    if (!result.success) {
      setErrorMsg(result.error);
    } else {
      setLoginIdentifier("");
      setLoginPassword("");
    }
  };

  return (
    <div className="modal-overlay auth-modal-overlay" onClick={closeAuthModal}>
      <div
        className="modal-content auth-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Close Button */}
        <button
          onClick={closeAuthModal}
          className="auth-close-btn"
          title="Close modal"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="auth-header">
          <div className="auth-brand-badge">
            <ShoppingBag size={18} />
            <span>Kloset Thrift Market</span>
          </div>
          <h2>
            {authModalTab === "register"
              ? "Create Your Thrift Account"
              : "Welcome Back to Kloset"}
          </h2>
          <p className="auth-subtitle">
            {authModalTab === "register"
              ? "Register using your Gmail or Phone number to buy pre-loved clothes or sell your own second-hand wardrobe."
              : "Sign in with your registered Gmail or Phone number to continue shopping and managing your thrift rack."}
          </p>

          {/* Mode Switcher Tabs */}
          <div className="auth-tabs-toggle">
            <button
              type="button"
              className={`auth-tab-btn ${
                authModalTab === "register" ? "active" : ""
              }`}
              onClick={() => {
                setAuthModalTab("register");
                setErrorMsg("");
              }}
            >
              <span>Register (New User)</span>
            </button>
            <button
              type="button"
              className={`auth-tab-btn ${
                authModalTab === "login" ? "active" : ""
              }`}
              onClick={() => {
                setAuthModalTab("login");
                setErrorMsg("");
              }}
            >
              <span>Sign In</span>
            </button>
          </div>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="auth-error-banner">
            <span>{errorMsg}</span>
          </div>
        )}

        {/* REGISTER FORM */}
        {authModalTab === "register" ? (
          <form onSubmit={handleRegisterSubmit} className="auth-form">
            {/* Full Name */}
            <div className="auth-field-group">
              <label>Your Full Name</label>
              <div className="auth-input-wrapper">
                <User size={18} className="auth-input-icon" />
                <input
                  type="text"
                  placeholder="e.g. Priya Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Registration Method Choice (Gmail vs Phone) */}
            <div className="auth-field-group">
              <label className="method-label">
                Register Using:
                <span className="method-hint">Select Gmail or Phone</span>
              </label>

              <div className="method-selector-grid">
                <button
                  type="button"
                  className={`method-select-card ${
                    registerType === "gmail" ? "selected" : ""
                  }`}
                  onClick={() => {
                    setRegisterType("gmail");
                    setErrorMsg("");
                  }}
                >
                  <div className="method-card-top">
                    <span className="gmail-badge-icon">
                      <Mail size={16} />
                    </span>
                    <strong>Gmail / Email</strong>
                  </div>
                  <span className="method-subtext">Google mail address</span>
                </button>

                <button
                  type="button"
                  className={`method-select-card ${
                    registerType === "phone" ? "selected" : ""
                  }`}
                  onClick={() => {
                    setRegisterType("phone");
                    setErrorMsg("");
                  }}
                >
                  <div className="method-card-top">
                    <span className="phone-badge-icon">
                      <Phone size={16} />
                    </span>
                    <strong>Phone Number</strong>
                  </div>
                  <span className="method-subtext">Mobile / WhatsApp</span>
                </button>
              </div>
            </div>

            {/* Conditional Identifier Field */}
            {registerType === "gmail" ? (
              <div className="auth-field-group">
                <div className="field-label-row">
                  <label>Gmail Address</label>
                  <span className="sample-helper">e.g. username@gmail.com</span>
                </div>
                <div className="auth-input-wrapper">
                  <Mail size={18} className="auth-input-icon" />
                  <input
                    type="email"
                    placeholder="yourname@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="auth-field-group">
                <div className="field-label-row">
                  <label>Mobile Phone Number</label>
                  <span className="sample-helper">e.g. 9876543210</span>
                </div>
                <div className="auth-input-wrapper">
                  <Phone size={18} className="auth-input-icon" />
                  <input
                    type="tel"
                    placeholder="+91 98765 43210 or 10-digit phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div className="auth-field-group">
              <label>Create Password</label>
              <div className="auth-input-wrapper">
                <Lock size={18} className="auth-input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 4 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="eye-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Location (City) */}
            <div className="auth-field-group">
              <label>Your City / Location (optional)</label>
              <div className="auth-input-wrapper">
                <MapPin size={18} className="auth-input-icon" />
                <input
                  type="text"
                  placeholder="e.g. Mumbai, New York, Delhi, Austin"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>

            {/* Submit Register */}
            <button
              type="submit"
              disabled={loading}
              className="button button-primary auth-submit-btn"
            >
              {loading ? (
                "Creating Thrift Account..."
              ) : (
                <>
                  <span>
                    Register with{" "}
                    {registerType === "gmail" ? "Gmail" : "Phone Number"}
                  </span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <div className="auth-switch-prompt">
              <span>Already have an account?</span>
              <button
                type="button"
                onClick={() => {
                  setAuthModalTab("login");
                  setErrorMsg("");
                }}
                className="auth-link-btn"
              >
                Sign In here
              </button>
            </div>
          </form>
        ) : (
          /* LOGIN FORM */
          <form onSubmit={handleLoginSubmit} className="auth-form">
            <div className="auth-field-group">
              <div className="field-label-row">
                <label>Gmail Address OR Phone Number</label>
              </div>
              <div className="auth-input-wrapper">
                <Mail size={18} className="auth-input-icon" />
                <input
                  type="text"
                  placeholder="Enter your Gmail or Phone number"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="auth-field-group">
              <label>Password</label>
              <div className="auth-input-wrapper">
                <Lock size={18} className="auth-input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="eye-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="button button-primary auth-submit-btn"
            >
              {loading ? "Signing In..." : "Sign In to Kloset"}
            </button>

            <div className="auth-switch-prompt">
              <span>Don't have an account yet?</span>
              <button
                type="button"
                onClick={() => {
                  setAuthModalTab("register");
                  setErrorMsg("");
                }}
                className="auth-link-btn"
              >
                Register with Gmail or Phone
              </button>
            </div>
          </form>
        )}

        {/* Quick Demo Accounts Switcher Bar */}
        <div className="auth-demo-section">
          <div className="demo-divider">
            <span>Or quick demo switch</span>
          </div>
          <div className="demo-users-pills">
            {users.slice(0, 3).map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => {
                  switchUser(u);
                  closeAuthModal();
                }}
                className="demo-user-pill"
              >
                <img src={u.avatar} alt={u.name} />
                <span>@{u.handle}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
