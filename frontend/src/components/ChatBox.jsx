import React, { useState, useEffect, useRef } from "react";
import {
  MessageCircle,
  Send,
  X,
  Minimize2,
  Maximize2,
  ChevronLeft,
  Tag,
  ShoppingBag,
  Check,
  CheckCheck,
  Sparkles,
  ShieldCheck,
  Clock,
  ArrowRight,
} from "lucide-react";
import { useApp } from "../context/AppContext";

export default function ChatBox() {
  const {
    currentUser,
    isChatOpen,
    setIsChatOpen,
    activeConversationId,
    setActiveConversationId,
    addToCart,
    showToast,
    fetchUnreadChatCount,
  } = useApp();

  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [customOfferPrice, setCustomOfferPrice] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  };

  // Load all conversations for current user
  const loadConversations = async () => {
    if (!currentUser?.id) return;
    try {
      const res = await fetch(`http://localhost:5001/api/chat/user/${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setConversations(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
    }
  };

  // Load specific conversation
  const loadChat = async (id) => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5001/api/chat/${id}`);
      if (res.ok) {
        const data = await res.json();
        setCurrentChat(data);
        // Mark as read
        if (currentUser?.id) {
          fetch(`http://localhost:5001/api/chat/${id}/read`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: currentUser.id }),
          }).then(() => {
            fetchUnreadChatCount?.();
          });
        }
      }
    } catch (err) {
      console.error("Failed to load chat:", err);
    } finally {
      setLoading(false);
    }
  };

  // When chat opens or activeId changes
  useEffect(() => {
    if (isChatOpen && currentUser?.id) {
      loadConversations();
      if (activeConversationId) {
        loadChat(activeConversationId);
      }
    }
  }, [isChatOpen, activeConversationId, currentUser?.id]);

  // Scroll whenever messages change
  useEffect(() => {
    if (currentChat?.messages?.length) {
      scrollToBottom();
    }
  }, [currentChat?.messages]);

  // Periodic polling for active chat updates
  useEffect(() => {
    if (!isChatOpen || !activeConversationId) return;
    const interval = setInterval(() => {
      loadChat(activeConversationId);
    }, 4000);
    return () => clearInterval(interval);
  }, [isChatOpen, activeConversationId]);

  if (!isChatOpen || !currentUser) return null;

  // Identify partner in the current chat
  const isBuyer = currentChat && currentChat.buyerId === currentUser.id;
  const partnerName = currentChat
    ? isBuyer
      ? currentChat.sellerName
      : currentChat.buyerName
    : "Member";
  const partnerHandle = currentChat
    ? isBuyer
      ? currentChat.sellerHandle
      : currentChat.buyerHandle
    : "member";
  const partnerAvatar = currentChat
    ? isBuyer
      ? currentChat.sellerAvatar
      : currentChat.buyerAvatar
    : "";

  // Send message
  const handleSendMessage = async (textToSend = inputText, offerVal = null) => {
    const text = (textToSend || "").trim();
    if (!text && !offerVal) return;
    if (!currentChat?._id) return;

    setInputText("");
    setShowOfferModal(false);
    setCustomOfferPrice("");

    // Optimistic UI update
    const tempMsg = {
      _id: "temp_" + Date.now(),
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      text: text || (offerVal ? `Submitted an offer of ₹${Number(offerVal).toLocaleString("en-IN")}` : ""),
      offerPrice: offerVal ? Number(offerVal) : null,
      offerStatus: offerVal ? "pending" : "none",
      createdAt: new Date(),
      read: false,
    };

    setCurrentChat((prev) => ({
      ...prev,
      messages: [...(prev?.messages || []), tempMsg],
      lastMessage: tempMsg.text,
    }));

    setIsTyping(true);

    try {
      const res = await fetch(`http://localhost:5001/api/chat/${currentChat._id}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: currentUser.id,
          senderName: currentUser.name,
          senderAvatar: currentUser.avatar,
          text: text,
          offerPrice: offerVal,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setCurrentChat(updated);
        loadConversations();
        fetchUnreadChatCount?.();
      }
    } catch (err) {
      console.error("Error sending message:", err);
      showToast("Could not send message. Please try again.", "error");
    } finally {
      setIsTyping(false);
    }
  };

  // Handle Offer Accept / Decline
  const handleOfferAction = async (messageId, action) => {
    if (!currentChat?._id) return;
    try {
      const res = await fetch(`http://localhost:5001/api/chat/${currentChat._id}/offer`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId,
          action,
          senderId: currentUser.id,
          senderName: currentUser.name,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setCurrentChat(updated);
        showToast(action === "accept" ? "🎉 Offer accepted!" : "Offer declined.");
        loadConversations();
      }
    } catch (err) {
      console.error("Failed to update offer:", err);
    }
  };

  // Quick prompt chips
  const quickChips = [
    "👋 Is this still available?",
    "💸 Can you do 10% off?",
    "📦 Can you ship tomorrow?",
    "📏 What are the measurements?",
    "✨ Any stains or flaws?",
  ];

  // Quick Offer Calculation
  const itemPrice = currentChat?.itemPrice || 1000;
  const discount10 = Math.round((itemPrice * 0.9) / 10) * 10;
  const discount15 = Math.round((itemPrice * 0.85) / 10) * 10;
  const discount20 = Math.round((itemPrice * 0.8) / 10) * 10;

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      (c.itemName && c.itemName.toLowerCase().includes(q)) ||
      (c.sellerName && c.sellerName.toLowerCase().includes(q)) ||
      (c.buyerName && c.buyerName.toLowerCase().includes(q)) ||
      (c.itemBrand && c.itemBrand.toLowerCase().includes(q))
    );
  });

  return (
    <div
      className={`kloset-chatbox-dock ${isExpanded ? "expanded" : ""} ${
        isMinimized ? "minimized" : ""
      }`}
    >
      {/* =========================================================================
          MINIMIZED BAR
      ========================================================================= */}
      {isMinimized ? (
        <div className="chatbox-minimized-bar" onClick={() => setIsMinimized(false)}>
          <div className="minimized-info">
            <span className="chat-status-dot pulse" />
            <MessageCircle size={18} />
            <span className="minimized-title">
              {currentChat ? `Chat with ${partnerName}` : "Kloset Messages"}
            </span>
          </div>
          <button
            className="chat-ctrl-btn"
            onClick={(e) => {
              e.stopPropagation();
              setIsChatOpen(false);
            }}
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        /* =========================================================================
            EXPANDED / STANDARD WINDOW
        ========================================================================= */
        <div className="chatbox-card">
          {/* TOP HEADER */}
          <div className="chatbox-header">
            <div className="chatbox-header-left">
              {currentChat ? (
                <>
                  <button
                    className="chat-back-btn"
                    onClick={() => {
                      setCurrentChat(null);
                      setActiveConversationId(null);
                      loadConversations();
                    }}
                    title="All Messages"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <div className="chat-avatar-wrapper">
                    <img
                      src={
                        partnerAvatar ||
                        `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(
                          partnerName
                        )}`
                      }
                      alt={partnerName}
                      className="chat-partner-avatar"
                    />
                    <span className="chat-online-badge" />
                  </div>
                  <div className="chat-partner-meta">
                    <div className="chat-partner-title-row">
                      <span className="chat-partner-name">{partnerName}</span>
                      <span className="chat-role-pill">
                        {isBuyer ? "Seller" : "Buyer"}
                      </span>
                    </div>
                    <span className="chat-partner-handle">@{partnerHandle}</span>
                  </div>
                </>
              ) : (
                <div className="chatbox-inbox-title">
                  <div className="chatbox-inbox-icon">
                    <MessageCircle size={18} />
                  </div>
                  <div>
                    <h4>Direct Messages & Offers</h4>
                    <span className="inbox-subtitle">
                      {conversations.length} conversation{conversations.length === 1 ? "" : "s"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Window Controls */}
            <div className="chatbox-header-actions">
              <button
                className="chat-ctrl-btn"
                onClick={() => setIsMinimized(true)}
                title="Minimize chat"
              >
                <Minimize2 size={15} />
              </button>
              <button
                className="chat-ctrl-btn"
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? "Standard view" : "Expand window"}
              >
                <Maximize2 size={15} />
              </button>
              <button
                className="chat-ctrl-btn close"
                onClick={() => {
                  setIsChatOpen(false);
                  setActiveConversationId(null);
                }}
                title="Close chat"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* =====================================================================
              MAIN BODY: 2 MODES (INBOX LIST OR ACTIVE THREAD)
          ===================================================================== */}
          {!currentChat ? (
            /* ===============================================================
                VIEW A: CONVERSATIONS LIST (INBOX)
            =============================================================== */
            <div className="chatbox-inbox-view">
              <div className="inbox-search-bar">
                <input
                  type="text"
                  placeholder="Search chats by piece or seller..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="inbox-list-scroll">
                {filteredConversations.length === 0 ? (
                  <div className="chat-empty-state">
                    <div className="empty-chat-icon">
                      <Sparkles size={28} />
                    </div>
                    <h5>No conversations yet</h5>
                    <p>
                      Browse items on the Thrift Market and click <strong>"Chat with Seller"</strong>{" "}
                      to inquire, negotiate, or make instant offers directly!
                    </p>
                  </div>
                ) : (
                  filteredConversations.map((c) => {
                    const isUserBuyer = c.buyerId === currentUser.id;
                    const cPartnerName = isUserBuyer ? c.sellerName : c.buyerName;
                    const cPartnerAvatar = isUserBuyer ? c.sellerAvatar : c.buyerAvatar;
                    const unread = isUserBuyer ? c.unreadBuyer : c.unreadSeller;

                    return (
                      <div
                        key={c._id}
                        className={`inbox-convo-item ${unread > 0 ? "has-unread" : ""}`}
                        onClick={() => {
                          setActiveConversationId(c._id);
                          loadChat(c._id);
                        }}
                      >
                        <div className="inbox-convo-product-thumb">
                          <img
                            src={
                              c.itemImage ||
                              "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=150"
                            }
                            alt={c.itemName}
                          />
                        </div>

                        <div className="inbox-convo-details">
                          <div className="convo-top-row">
                            <span className="convo-partner-name">{cPartnerName}</span>
                            <span className="convo-time">
                              {new Date(c.lastMessageAt || c.updatedAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>

                          <span className="convo-item-title">{c.itemName}</span>

                          <div className="convo-bottom-row">
                            <p className="convo-snippet">
                              {c.lastMessage || "Started conversation"}
                            </p>
                            {unread > 0 && <span className="convo-unread-badge">{unread}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            /* ===============================================================
                VIEW B: ACTIVE CONVERSATION THREAD
            =============================================================== */
            <div className="chatbox-thread-view">
              {/* PINNED PRODUCT MINI-BANNER */}
              <div className="chat-pinned-product">
                <img
                  src={
                    currentChat.itemImage ||
                    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200"
                  }
                  alt={currentChat.itemName}
                  className="pinned-item-image"
                />
                <div className="pinned-item-info">
                  <span className="pinned-item-name">{currentChat.itemName}</span>
                  <div className="pinned-item-specs">
                    {currentChat.itemBrand && <span>{currentChat.itemBrand} • </span>}
                    <span>Size {currentChat.itemSize || "M"} • </span>
                    <strong className="pinned-price">
                      ₹{Number(currentChat.itemPrice).toLocaleString("en-IN")}.00
                    </strong>
                  </div>
                </div>

                <div className="pinned-item-actions">
                  <button
                    type="button"
                    className="pinned-buy-btn"
                    onClick={() => {
                      addToCart({
                        _id: currentChat.itemId,
                        id: currentChat.itemId,
                        name: currentChat.itemName,
                        price: currentChat.itemPrice,
                        image: currentChat.itemImage,
                        brand: currentChat.itemBrand,
                        size: currentChat.itemSize,
                      });
                      showToast(`Added "${currentChat.itemName}" to cart! 🛍️`);
                    }}
                    title="Add to Shopping Bag"
                  >
                    <ShoppingBag size={14} />
                    <span>Bag</span>
                  </button>

                  {isBuyer && (
                    <button
                      type="button"
                      className="pinned-offer-btn"
                      onClick={() => setShowOfferModal(!showOfferModal)}
                      title="Make an Offer"
                    >
                      <Tag size={14} />
                      <span>Offer</span>
                    </button>
                  )}
                </div>
              </div>

              {/* MAKE AN OFFER SLIDE-OVER */}
              {showOfferModal && isBuyer && (
                <div className="chat-offer-popup">
                  <div className="offer-popup-header">
                    <div className="offer-header-title">
                      <Tag size={16} />
                      <span>Negotiate / Make an Offer</span>
                    </div>
                    <button
                      onClick={() => setShowOfferModal(false)}
                      className="close-popup-btn"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="offer-popup-hint">
                    Current price is <strong>₹{Number(itemPrice).toLocaleString("en-IN")}</strong>. Propose a reasonable amount:
                  </p>

                  <div className="offer-chips-grid">
                    <button
                      type="button"
                      onClick={() => handleSendMessage("", discount10)}
                      className="offer-preset-chip"
                    >
                      <span>-10%</span>
                      <strong>₹{discount10.toLocaleString("en-IN")}</strong>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendMessage("", discount15)}
                      className="offer-preset-chip popular"
                    >
                      <span>-15%</span>
                      <strong>₹{discount15.toLocaleString("en-IN")}</strong>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendMessage("", discount20)}
                      className="offer-preset-chip"
                    >
                      <span>-20%</span>
                      <strong>₹{discount20.toLocaleString("en-IN")}</strong>
                    </button>
                  </div>

                  <div className="custom-offer-row">
                    <div className="custom-offer-input-wrap">
                      <span className="currency-prefix">₹</span>
                      <input
                        type="number"
                        min="1"
                        placeholder="Custom offer amount"
                        value={customOfferPrice}
                        onChange={(e) => setCustomOfferPrice(e.target.value)}
                      />
                    </div>
                    <button
                      type="button"
                      disabled={!customOfferPrice || Number(customOfferPrice) <= 0}
                      onClick={() => {
                        if (Number(customOfferPrice) > 0) {
                          handleSendMessage("", Number(customOfferPrice));
                        }
                      }}
                      className="send-custom-offer-btn"
                    >
                      Send Offer
                    </button>
                  </div>
                </div>
              )}

              {/* MESSAGES SCROLL CONTAINER */}
              <div className="chat-messages-container">
                {/* Security & Authenticity Trust Banner */}
                <div className="chat-trust-banner">
                  <ShieldCheck size={14} />
                  <span>
                    Direct buyer-seller messaging protected by Kloset. Agree on prices and finalize orders safely in-app.
                  </span>
                </div>

                {/* Messages List */}
                {currentChat.messages && currentChat.messages.length > 0 ? (
                  currentChat.messages.map((msg, idx) => {
                    const isMe = msg.senderId === currentUser.id;
                    const hasOffer = msg.offerPrice && Number(msg.offerPrice) > 0;

                    return (
                      <div
                        key={msg._id || idx}
                        className={`chat-msg-row ${isMe ? "outgoing" : "incoming"}`}
                      >
                        {!isMe && (
                          <img
                            src={
                              msg.senderAvatar ||
                              `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(
                                msg.senderName
                              )}`
                            }
                            alt={msg.senderName}
                            className="chat-msg-avatar"
                          />
                        )}

                        <div className="chat-msg-bubble-wrap">
                          <div
                            className={`chat-bubble ${isMe ? "bubble-mine" : "bubble-theirs"} ${
                              hasOffer ? "bubble-offer" : ""
                            }`}
                          >
                            {/* Special Offer Card Bubble */}
                            {hasOffer ? (
                              <div className="offer-card-content">
                                <div className="offer-badge-row">
                                  <span className="offer-tag-icon">
                                    <Tag size={13} />
                                    <span>OFFICIAL OFFER</span>
                                  </span>
                                  <span
                                    className={`offer-status-badge ${msg.offerStatus || "pending"}`}
                                  >
                                    {msg.offerStatus === "accepted"
                                      ? "Accepted 🎉"
                                      : msg.offerStatus === "declined"
                                      ? "Declined"
                                      : "Pending"}
                                  </span>
                                </div>

                                <div className="offer-amount-row">
                                  <span className="offer-lbl">Proposed Price:</span>
                                  <h3 className="offer-val">
                                    ₹{Number(msg.offerPrice).toLocaleString("en-IN")}.00
                                  </h3>
                                </div>

                                {msg.text && (
                                  <p className="offer-note-text">{msg.text}</p>
                                )}

                                {/* If I am the Seller receiving this offer */}
                                {!isMe && msg.offerStatus === "pending" && (
                                  <div className="offer-decision-actions">
                                    <button
                                      type="button"
                                      onClick={() => handleOfferAction(msg._id, "accept")}
                                      className="accept-offer-btn"
                                    >
                                      <Check size={14} />
                                      <span>Accept Offer</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleOfferAction(msg._id, "decline")}
                                      className="decline-offer-btn"
                                    >
                                      <span>Decline</span>
                                    </button>
                                  </div>
                                )}

                                {isMe && msg.offerStatus === "pending" && (
                                  <span className="offer-waiting-hint">
                                    Waiting for {partnerName} to review your offer...
                                  </span>
                                )}
                              </div>
                            ) : (
                              <p className="chat-msg-text">{msg.text}</p>
                            )}

                            <div className="chat-msg-meta">
                              <span className="chat-timestamp">
                                {new Date(msg.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                              {isMe && (
                                <span className="read-status">
                                  {msg.read ? (
                                    <CheckCheck size={13} color="#60a5fa" />
                                  ) : (
                                    <Check size={13} />
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="chat-thread-empty">
                    <p>Start conversation with @{partnerHandle} regarding this garment!</p>
                  </div>
                )}

                {/* Seller typing indicator */}
                {isTyping && (
                  <div className="chat-msg-row incoming">
                    <img
                      src={
                        partnerAvatar ||
                        `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(
                          partnerName
                        )}`
                      }
                      alt={partnerName}
                      className="chat-msg-avatar"
                    />
                    <div className="typing-indicator-bubble">
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* QUICK ICEBREAKER CHIPS */}
              <div className="chat-quick-chips-scroll">
                {quickChips.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(chip)}
                    className="chat-suggestion-chip"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* INPUT BAR */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="chat-input-bar"
              >
                {isBuyer && (
                  <button
                    type="button"
                    onClick={() => setShowOfferModal(!showOfferModal)}
                    className={`chat-offer-trigger-btn ${showOfferModal ? "active" : ""}`}
                    title="Make an Offer"
                  >
                    <Tag size={16} />
                  </button>
                )}

                <input
                  type="text"
                  placeholder={`Message @${partnerHandle}...`}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="chat-text-input"
                />

                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="chat-send-btn"
                  title="Send message"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
