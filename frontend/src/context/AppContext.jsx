import React, { createContext, useContext, useState, useEffect } from "react";

const AppContext = createContext();

export const DEMO_USERS = [
  {
    id: "u_default",
    name: "Maya Lin",
    handle: "maya_style",
    email: "maya.lin@gmail.com",
    phone: "9876543210",
    registrationMethod: "gmail",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    bio: "College student & sustainable fashion enthusiast ✨ Mixing 90s vintage with daily fits.",
    location: "New York, NY",
    followers: 1240,
    following: 480,
    salesCount: 14,
    rating: 4.9,
  },
  {
    id: "u_sophia",
    name: "Sophia Chen",
    handle: "sophia_rework",
    email: "sophia.rework@gmail.com",
    phone: "9812345678",
    registrationMethod: "gmail",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    bio: "DIY & Rework artist 🎨 Giving thrifted denim and jackets a second life.",
    location: "San Francisco, CA",
    followers: 4890,
    following: 610,
    salesCount: 62,
    rating: 5.0,
  },
  {
    id: "u_alex",
    name: "Alex Rivers",
    handle: "vintage_alex",
    email: "alex.vintage@gmail.com",
    phone: "9765432109",
    registrationMethod: "phone",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    bio: "90s collegiate sweaters, retro sneakers, and heavy outerwear thrift hunter 🧥📦",
    location: "Austin, TX",
    followers: 2310,
    following: 340,
    salesCount: 29,
    rating: 4.8,
  },
  {
    id: "u_kai",
    name: "Kai Tanaka",
    handle: "kai_streetwear",
    email: "kai.tanaka@gmail.com",
    phone: "9823456789",
    registrationMethod: "phone",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    bio: "Japanese denim & relaxed tailored silhouettes. Selling closet rotation pieces 🛹",
    location: "Seattle, WA",
    followers: 3120,
    following: 290,
    salesCount: 41,
    rating: 4.9,
  },
];

export function AppProvider({ children }) {
  // Current user
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("kloset_user");
    return saved ? JSON.parse(saved) : DEMO_USERS[0];
  });

  // User list (demo + DB users)
  const [users, setUsers] = useState(DEMO_USERS);

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState("register"); // 'register' or 'login'

  // Cart
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("kloset_cart");
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

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
        if (Array.isArray(dbUsers) && dbUsers.length > 0) {
          // Merge avoiding duplicates by handle/id
          const combined = [...dbUsers];
          DEMO_USERS.forEach((du) => {
            if (!combined.some((u) => u.handle === du.handle || u.id === du.id)) {
              combined.push(du);
            }
          });
          setUsers(combined);
        }
      }
    } catch (err) {
      console.warn("Could not load backend users, using demo users:", err.message);
    }
  };

  useEffect(() => {
    fetchDbUsers();
  }, []);

  useEffect(() => {
    localStorage.setItem("kloset_user", JSON.stringify(currentUser));
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

      setCurrentUser(data.user);
      setIsAuthModalOpen(false);
      showToast(`Welcome to Kloset, ${data.user.name}! Registered via ${data.user.registrationMethod.toUpperCase()} 🎉`);
      fetchDbUsers();
      return { success: true, user: data.user };
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

      setCurrentUser(data.user);
      setIsAuthModalOpen(false);
      showToast(`Welcome back, ${data.user.name}! 👋`);
      return { success: true, user: data.user };
    } catch (err) {
      showToast(err.message, "error");
      return { success: false, error: err.message };
    }
  };

  const logoutUser = () => {
    localStorage.removeItem("kloset_token");
    setCurrentUser(DEMO_USERS[0]);
    showToast("Signed out. Switched to guest browsing mode.");
  };

  const addToCart = (item) => {
    if (cart.some((c) => c._id === item._id)) {
      showToast("Item is already in your shopping bag!", "info");
      setIsCartOpen(true);
      return;
    }
    setCart((prev) => [...prev, item]);
    showToast(`Added "${item.name}" to bag!`);
    setIsCartOpen(true);
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
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
