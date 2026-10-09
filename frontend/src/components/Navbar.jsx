import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  MessageCircle,
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
  const navigate = useNavigate();
  const location = useLocation();
  const {
    currentUser,
    cart,
    setIsCartOpen,
    isChatOpen,
    setIsChatOpen,
    unreadChatCount,
    openAuthModal,
    logoutUser,
  } = useApp();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    if (showUserMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserMenu]);

  const navLinks = [
    { to: "/market", label: "STORE", icon: Store },
    { to: "/closet", label: "WARDROBE", icon: Shirt },
    { to: "/planner", label: "PLANNER", icon: Sparkles },
    { to: "/add", label: "UPLOAD", icon: PlusCircle },
  ];

  const totalCartCount = cart.reduce((acc, it) => acc + (it.quantity || 1), 0);

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

          {/* Messages / Chat between Buyer & Seller */}
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="navbar-chat-btn"
            title="Messages & Buyer-Seller Offers"
          >
            <MessageCircle size={20} />
            {unreadChatCount > 0 && (
              <span className="navbar-chat-badge">{unreadChatCount}</span>
            )}
          </button>

          {/* User Profile / Auth Button - Google style circular logo */}
          {currentUser ? (
            <div className="user-dropdown-container" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="google-profile-btn"
                aria-label={`Account: ${currentUser.name}`}
                title={`${currentUser.name} (${currentUser.email || currentUser.phone || `@${currentUser.handle}`})`}
              >
                <img
                  src={
                    currentUser.avatar ||
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
                  }
                  alt={currentUser.name}
                  className="google-profile-avatar"
                />
              </button>

              {showUserMenu && (
                <div className="google-account-popover">
                  <div className="google-account-header">
                    <img
                      src={
                        currentUser.avatar ||
                        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
                      }
                      alt={currentUser.name}
                      className="google-large-avatar"
                    />
                    <p className="google-account-name">{currentUser.name}</p>
                    <p className="google-account-email">
                      {currentUser.registrationMethod === "phone"
                        ? `+91 ${currentUser.phone}`
                        : currentUser.email || `@${currentUser.handle}`}
                    </p>
                    <span className="google-account-handle">@{currentUser.handle}</span>
                  </div>

                  <div className="google-account-actions">
                    <Link
                      to="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="google-account-link"
                    >
                      <User size={16} />
                      <span>My Profile & Thrift Rack</span>
                    </Link>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        openAuthModal("register");
                      }}
                      className="google-account-link"
                    >
                      <PlusCircle size={16} />
                      <span>Add / Register Account</span>
                    </button>
                  </div>

                  <div className="google-account-footer">
                    <button
                      onClick={() => {
                        logoutUser();
                        setShowUserMenu(false);
                        navigate("/login");
                      }}
                      className="google-signout-btn"
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="button button-accent auth-cta-btn"
            >
              <LogIn size={16} />
              <span>Register / Sign In</span>
            </Link>
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
