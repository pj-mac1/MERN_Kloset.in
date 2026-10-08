import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ShoppingBag,
  Sparkles,
  Shirt,
  PlusCircle,
  User,
  Store,
  ChevronDown,
  Check,
  LogIn,
  LogOut,
  Mail,
  Phone,
} from "lucide-react";
import { useApp } from "../context/AppContext";

export default function Navbar() {
  const location = useLocation();
  const {
    currentUser,
    users,
    switchUser,
    cart,
    setIsCartOpen,
    openAuthModal,
    logoutUser,
  } = useApp();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navLinks = [
    { to: "/market", label: "STORE", icon: Store },
    { to: "/closet", label: "WARDROBE", icon: Shirt },
    { to: "/planner", label: "PLANNER", icon: Sparkles },
    { to: "/add", label: "UPLOAD", icon: PlusCircle },
  ];

  const totalCartCount = cart.length;

  return (
    <header className="navbar-container">
      <div className="navbar-inner">
        {/* Left Side: Brand Logo & Navigation Links */}
        <div className="navbar-left">
          <Link to="/market" className="brand-logo">
            <span className="brand-name">
              Kloset<span className="brand-dot">.</span>
            </span>
          </Link>

          <nav className="desktop-nav">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                location.pathname === link.to ||
                (link.to === "/market" && (location.pathname === "/thrift" || location.pathname === "/thrift-store"));

              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`nav-item ${isActive ? "active" : ""}`}
                >
                  <Icon size={17} className="nav-icon" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Actions: Cart & User Account */}
        <div className="navbar-actions">
          {/* Cart Bag */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="cart-btn"
            title="Shopping Bag"
          >
            <ShoppingBag size={20} />
            {totalCartCount > 0 && (
              <span className="cart-badge">{totalCartCount}</span>
            )}
          </button>

          {/* User Profile / Auth Button */}
          {currentUser ? (
            <div className="user-dropdown-container">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="user-pill-btn"
              >
                <img
                  src={currentUser.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                  alt={currentUser.name}
                  className="user-avatar-sm"
                />
                <div className="user-pill-text">
                  <span className="user-pill-name">{currentUser.name}</span>
                  <span className="user-handle">@{currentUser.handle}</span>
                </div>
                <ChevronDown size={14} className="chevron-icon" />
              </button>

              {showUserMenu && (
                <div className="user-dropdown-menu">
                  <div className="dropdown-header">
                    <p className="dropdown-title">Logged in as</p>
                    <p className="dropdown-subtitle">{currentUser.name}</p>
                    <p className="dropdown-contact-meta">
                      {currentUser.registrationMethod === "phone"
                        ? `📱 ${currentUser.phone || "Phone User"}`
                        : `✉️ ${currentUser.email || "Gmail User"}`}
                    </p>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setShowUserMenu(false)}
                    className="dropdown-item profile-link"
                  >
                    <User size={16} />
                    <span>My Profile & Thrift Rack</span>
                  </Link>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      openAuthModal("register");
                    }}
                    className="dropdown-item"
                  >
                    <PlusCircle size={16} />
                    <span>Register New Account</span>
                  </button>

                  <div className="dropdown-divider"></div>
                  <p className="dropdown-label">Quick Switch User Profile:</p>

                  <div className="dropdown-user-list">
                    {users.slice(0, 4).map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUser(u);
                          setShowUserMenu(false);
                        }}
                        className={`dropdown-user-option ${
                          u.id === currentUser.id ? "selected" : ""
                        }`}
                      >
                        <img src={u.avatar} alt={u.name} className="user-avatar-xs" />
                        <div className="user-option-info">
                          <span className="user-option-name">{u.name}</span>
                          <span className="user-option-handle">@{u.handle}</span>
                        </div>
                        {u.id === currentUser.id && (
                          <Check size={14} className="check-icon" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="dropdown-divider"></div>
                  <button
                    onClick={() => {
                      logoutUser();
                      setShowUserMenu(false);
                    }}
                    className="dropdown-item logout-link"
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => openAuthModal("register")}
              className="button button-accent auth-cta-btn"
            >
              <LogIn size={16} />
              <span>Register / Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-bottom-nav">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive =
            location.pathname === link.to ||
            (link.to === "/market" && (location.pathname === "/thrift" || location.pathname === "/thrift-store"));

          return (
            <Link
              key={link.to}
              to={link.to}
              className={`mobile-nav-item ${isActive ? "active" : ""}`}
            >
              <Icon size={20} />
              <span>{link.label}</span>
            </Link>
          );
        })}
        <Link
          to="/profile"
          className={`mobile-nav-item ${
            location.pathname === "/profile" ? "active" : ""
          }`}
        >
          <User size={20} />
          <span>Profile</span>
        </Link>
      </nav>
    </header>
  );
}
