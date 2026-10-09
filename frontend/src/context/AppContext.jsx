import React, { createContext, useContext, useState, useEffect } from "react";

const AppContext = createContext();

export function AppProvider({ children }) {
  // Current user (null when signed out - no dummy accounts)
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("kloset_user");
    if (!saved) return null;
    try {
      const parsed = JSON.parse(saved);
      // Clean up legacy dummy demo accounts (u_default, u_sophia, etc.)
      if (!parsed || (parsed.id && String(parsed.id).startsWith("u_"))) {
        localStorage.removeItem("kloset_user");
        localStorage.removeItem("kloset_token");
        return null;
      }
      if (parsed.id && !parsed._id) parsed._id = parsed.id;
      if (parsed._id && !parsed.id) parsed.id = parsed._id;
      return parsed;
    } catch {
      return null;
    }
  });

  // Real registered users from database only
  const [users, setUsers] = useState([]);

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState("register"); // 'register' or 'login'

  // Cart
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("kloset_cart");
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  // Saved / Wishlist items
  const [savedItems, setSavedItems] = useState(() => {
    const saved = localStorage.getItem("kloset_saved");
    return saved ? JSON.parse(saved) : [];
  });

  // Toast notification
  const [toast, setToast] = useState(null);

  // Fetch registered users from backend on mount
  const fetchDbUsers = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/auth/users");
      if (res.ok) {
        const dbUsers = await res.json();
        if (Array.isArray(dbUsers)) {
          setUsers(dbUsers);
        }
      }
    } catch (err) {
      console.warn("Could not load backend users:", err.message);
    }
  };

  // Fetch unread count for chat
  const fetchUnreadChatCount = async () => {
    if (!currentUser?.id) {
      setUnreadChatCount(0);
      return;
    }
    try {
      const res = await fetch(`http://localhost:5001/api/chat/user/${currentUser.id}`);
      if (res.ok) {
        const chats = await res.json();
        if (Array.isArray(chats)) {
          let count = 0;
          chats.forEach((c) => {
            if (c.buyerId === currentUser.id && c.unreadBuyer > 0) count += c.unreadBuyer;
            if (c.sellerId === currentUser.id && c.unreadSeller > 0) count += c.unreadSeller;
          });
          setUnreadChatCount(count);
        }
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (currentUser?.id) {
      fetchUnreadChatCount();
      const interval = setInterval(fetchUnreadChatCount, 15000);
      return () => clearInterval(interval);
    } else {
      setUnreadChatCount(0);
    }
  }, [currentUser?.id]);

  const openChatWithItem = async (item, initialMessage = "") => {
    if (!currentUser) {
      showToast("Please sign in or register to chat with the seller!", "info");
      openAuthModal("login");
      return;
    }

    if (!item) {
      setIsChatOpen(true);
      return;
    }

    if (item.userId && String(item.userId) === String(currentUser.id)) {
      showToast("This is your own piece! Opening your conversations inbox.", "info");
      setIsChatOpen(true);
      return;
    }

    try {
      const payload = {
        buyerId: currentUser.id || currentUser._id,
        buyerName: currentUser.name,
        buyerHandle: currentUser.handle || "buyer",
        buyerAvatar: currentUser.avatar || "",
        sellerId: item.userId || "seller_curated",
        sellerName: item.sellerName || "Thrift Curator",
        sellerHandle: item.sellerHandle || "seller",
        sellerAvatar: item.sellerAvatar || "",
        itemId: item._id || item.id,
        itemName: item.name,
        itemImage: item.image || item.enhancedImage || "",
        itemPrice: Number(item.price) || 0,
        itemOriginalPrice: Number(item.originalPrice) || 0,
        itemBrand: item.brand || "",
        itemSize: item.size || "Standard",
        initialMessage: initialMessage || "",
      };

      const res = await fetch("http://localhost:5001/api/chat/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const conversation = await res.json();
        setActiveConversationId(conversation._id);
        setIsChatOpen(true);
        fetchUnreadChatCount();
      } else {
        setIsChatOpen(true);
      }
    } catch (err) {
      console.error("Error starting chat:", err);
      setIsChatOpen(true);
    }
  };

  useEffect(() => {
    fetchDbUsers();
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("kloset_user", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("kloset_user");
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem("kloset_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("kloset_saved", JSON.stringify(savedItems));
  }, [savedItems]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3800);
  };

  const openAuthModal = (tab = "register") => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  // Register user via backend
  const registerUser = async ({ name, registrationMethod, email, phone, password, location }) => {
    try {
      const res = await fetch("http://localhost:5001/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          registrationMethod,
          email,
          phone,
          password,
          location,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      if (data.token) {
        localStorage.setItem("kloset_token", data.token);
      }

      const userData = {
        ...data.user,
        id: data.user.id || data.user._id,
        _id: data.user._id || data.user.id,
      };

      setCurrentUser(userData);
      setIsAuthModalOpen(false);
      const methodLabel = (data.user?.registrationMethod || "GMAIL").toUpperCase();
      showToast(`Welcome to Kloset, ${data.user?.name || "Thrifter"}! Registered via ${methodLabel} 🎉`);
      fetchDbUsers();
      return { success: true, user: userData };
    } catch (err) {
      showToast(err.message, "error");
      return { success: false, error: err.message };
    }
  };

  // Login user via backend
  const loginUser = async ({ identifier, password }) => {
    try {
      const res = await fetch("http://localhost:5001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      if (data.token) {
        localStorage.setItem("kloset_token", data.token);
      }

      const userData = {
        ...data.user,
        id: data.user.id || data.user._id,
        _id: data.user._id || data.user.id,
      };

      setCurrentUser(userData);
      setIsAuthModalOpen(false);
      showToast(`Welcome back, ${userData.name}! 👋`);
      return { success: true, user: userData };
    } catch (err) {
      showToast(err.message, "error");
      return { success: false, error: err.message };
    }
  };

  const logoutUser = () => {
    localStorage.removeItem("kloset_token");
    localStorage.removeItem("kloset_user");
    setCurrentUser(null);
    showToast("Signed out. Redirecting to login...");
  };

  const addToCart = (item, quantity = 1, openDrawer = false) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((c) => c._id === item._id);
      if (existingIndex > -1) {
        const updated = [...prev];
        const currentQty = updated[existingIndex].quantity || 1;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: currentQty + quantity,
        };
        return updated;
      }
      return [...prev, { ...item, quantity: quantity || 1 }];
    });
    showToast(`Added "${item.name}" to your shopping bag! 🛍️`);
    if (openDrawer) {
      setIsCartOpen(true);
    }
  };

  const updateQuantity = (id, newQty) => {
    if (newQty <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item._id === id ? { ...item, quantity: newQty } : item
      )
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item._id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleSave = (item) => {
    const exists = savedItems.some((s) => s._id === item._id);
    if (exists) {
      setSavedItems((prev) => prev.filter((s) => s._id !== item._id));
      showToast("Removed from saved items");
    } else {
      setSavedItems((prev) => [...prev, item]);
      showToast("Saved to your wishlist! ❤️");
    }
  };

  const switchUser = (user) => {
    setCurrentUser(user);
    showToast(`Switched active profile to @${user.handle}`);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        switchUser,
        users,
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        savedItems,
        toggleSave,
        toast,
        showToast,
        // Auth Modal & operations
        isAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        openAuthModal,
        closeAuthModal,
        registerUser,
        loginUser,
        logoutUser,
        // Chat & Buyer-Seller negotiations
        isChatOpen,
        setIsChatOpen,
        activeConversationId,
        setActiveConversationId,
        unreadChatCount,
        fetchUnreadChatCount,
        openChatWithItem,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
