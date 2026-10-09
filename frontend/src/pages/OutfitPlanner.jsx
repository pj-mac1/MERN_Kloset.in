import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Shuffle,
  Bookmark,
  Share2,
  Trash2,
  Shirt,
  CheckCircle,
  Plus,
  RefreshCw,
  Sliders,
  Calendar,
  Lock,
} from "lucide-react";
import confetti from "canvas-confetti";
import { useApp } from "../context/AppContext";

export default function OutfitPlanner() {
  const navigate = useNavigate();
  const { currentUser, showToast, openAuthModal } = useApp();

  const [closetItems, setClosetItems] = useState([]);
  const [allUserItems, setAllUserItems] = useState([]);
  const [wardrobeFilter, setWardrobeFilter] = useState("private"); // 'private' | 'all'
  const [savedOutfits, setSavedOutfits] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected Outfit Slots
  const [selectedTop, setSelectedTop] = useState(null);
  const [selectedBottom, setSelectedBottom] = useState(null);
  const [selectedShoes, setSelectedShoes] = useState(null);
  const [selectedAccessory, setSelectedAccessory] = useState(null);

  // Occasion selector
  const [selectedOccasion, setSelectedOccasion] = useState("College");
  const occasions = ["College", "Casual", "Formal", "Streetwear", "Party", "Date Night"];

  // Slot picker modal
  const [activePickingSlot, setActivePickingSlot] = useState(null); // 'top', 'bottom', 'shoes', 'accessory'

  // Outfit Name & Style Score
  const [outfitName, setOutfitName] = useState("Monday Campus Stroll");
  const [styleScore, setStyleScore] = useState(96);
  const [styleFeedback, setStyleFeedback] = useState(
    "Balanced contrast and comfortable relaxed drape for university lectures and coffee runs."
  );
  const [stylingTip, setStylingTip] = useState(
    "Pair with clean white socks or minimal silver accents to accentuate silhouette proportions."
  );
  const [aiSource, setAiSource] = useState("Google Gemini (Free Tier)");
  const [aiConsulting, setAiConsulting] = useState(false);
  const [autoAssembling, setAutoAssembling] = useState(false);

  // Tab: 'creator' vs 'lookbook'
  const [activeTab, setActiveTab] = useState("creator");

  // Occasion Rules & Strict Compatibility Scoring
  const OCCASION_RULES = {
    Casual: {
      matching: [
        "casual", "minimalist", "everyday", "relaxed", "basic", "denim", "tee",
        "t-shirt", "crewneck", "skate", "canvas", "sneaker", "pocket", "overshirt"
      ],
      prohibited: [
        "formal", "cocktail", "gown", "tuxedo", "suit", "blazer", "ballgown", "black-tie", "satin slip"
      ],
    },
    College: {
      matching: [
        "college", "campus", "crewneck", "casual", "vintage", "hoodie", "backpack", "denim", "tote", "sneaker"
      ],
      prohibited: ["tuxedo", "ballgown", "cocktail", "formal gown"],
    },
    Formal: {
      matching: [
        "formal", "tailored", "suit", "blazer", "trouser", "pleated", "elegant", "silk", "oxford", "loafer", "chic"
      ],
      prohibited: ["skate", "distressed", "sweatpants", "hoodie", "graphic tee"],
    },
    Streetwear: {
      matching: [
        "streetwear", "oversized", "y2k", "vintage", "cargo", "hoodie", "acid wash", "sneakers", "baggy"
      ],
      prohibited: ["ballgown", "tuxedo", "business suit"],
    },
    Party: {
      matching: [
        "party", "y2k", "date night", "slip", "leather", "dress", "glam", "statement", "heels"
      ],
      prohibited: ["loungewear", "scrubs", "sweatpants", "office formal"],
    },
    "Date Night": {
      matching: [
        "date night", "party", "chic", "minimalist", "drape", "slip", "knit", "jacket", "leather"
      ],
      prohibited: ["sweatpants", "gym", "athleisure"],
    },
  };

  const scoreItemForOccasion = (item, occ) => {
    if (!item) return -999;
    const config = OCCASION_RULES[occ] || OCCASION_RULES.Casual;
    const tags = (Array.isArray(item.tags) ? item.tags : []).map((t) => String(t).toLowerCase());
    const name = String(item.name || "").toLowerCase();
    const desc = String(item.description || "").toLowerCase();
    const cat = String(item.category || "").toLowerCase();

    let score = 50;

    if (tags.includes(occ.toLowerCase())) {
      score += 70;
    }

    for (const kw of config.matching) {
      if (tags.includes(kw)) score += 30;
      if (name.includes(kw)) score += 20;
      if (desc.includes(kw)) score += 10;
    }

    for (const pw of config.prohibited) {
      if (tags.includes(pw)) score -= 80;
      if (name.includes(pw)) score -= 60;
      if (desc.includes(pw)) score -= 30;
    }

    if (occ === "Casual") {
      if (tags.includes("formal") && !tags.includes("casual")) score -= 120;
      if (tags.includes("party") && !tags.includes("casual")) score -= 60;
      if (cat === "dresses" && !tags.includes("casual")) score -= 100;
      if (
        name.includes("formal") ||
        name.includes("gown") ||
        name.includes("blazer") ||
        name.includes("slip dress")
      ) {
        score -= 100;
      }
    }

    if (occ === "Formal") {
      if (tags.includes("casual") && !tags.includes("formal")) score -= 50;
      if (
        name.includes("hoodie") ||
        name.includes("skate") ||
        name.includes("pocket tee")
      ) {
        score -= 80;
      }
    }

    return score;
  };

  const pickBestSlotItem = (items, occ) => {
    if (!items || items.length === 0) return null;
    const scored = items
      .map((i) => ({ item: i, score: scoreItemForOccasion(i, occ) }))
      .sort((a, b) => b.score - a.score);

    if (scored.length === 0) return null;
    const topScore = scored[0].score;
    const viable = scored.filter((s) => s.score >= topScore - 25);
    return viable[Math.floor(Math.random() * viable.length)].item;
  };

  // Smart Occasion-Based Outfit Assembler
  const assembleOutfitForOccasion = (occ, itemsPool = closetItems) => {
    if (!itemsPool || itemsPool.length === 0) {
      setSelectedTop(null);
      setSelectedBottom(null);
      setSelectedShoes(null);
      setSelectedAccessory(null);
      setStyleScore(0);
      setOutfitName("Empty Private Wardrobe");
      setStyleFeedback(
        "Your private wardrobe has no pieces yet. Upload items in 'Add to Wardrobe' as Private Wardrobe to begin generating personalized outfits!"
      );
      setStylingTip("Keep garments private to use them exclusively for outfit planning.");
      return;
    }

    const tops = itemsPool.filter(
      (i) => i.category === "Tops" || i.category === "Outerwear" || i.category === "Dresses"
    );
    const bottoms = itemsPool.filter((i) => i.category === "Bottoms");
    const shoes = itemsPool.filter((i) => i.category === "Shoes");
    const accs = itemsPool.filter(
      (i) => i.category === "Accessories" || i.category === "Outerwear"
    );

    const bestTop = pickBestSlotItem(tops, occ);
    const bestBottom = pickBestSlotItem(bottoms, occ);
    const bestShoes = pickBestSlotItem(shoes, occ);
    const bestAcc = pickBestSlotItem(accs, occ);

    setSelectedTop(bestTop || null);
    setSelectedBottom(bestBottom || null);
    setSelectedShoes(bestShoes || null);
    setSelectedAccessory(bestAcc || null);

    const calculatedScore = Math.floor(Math.random() * 5) + 94;
    setStyleScore(calculatedScore);

    const titleTemplates = {
      Casual: ["Everyday Clean Casual", "Relaxed Weekend Stroll", "Effortless Minimal Fit"],
      College: ["Campus Lecture Rotation", "Cozy Library Fit", "Collegiate Heritage"],
      Formal: ["Tailored Minimal Elegance", "Modern Studio Formal", "Structured Smart Fit"],
      Streetwear: ["Urban Street Drape", "Neo-Vintage Streetwear", "Boxy Silhouette Vibe"],
      Party: ["Night Out Statement Fit", "Sleek Party Silhouette", "High-Contrast Chic"],
      "Date Night": ["Subtle Romantic Vibe", "Soft Drape Date Night", "Modern Chic Evening"],
    };

    const critiques = {
      Casual: `Effortless proportions with relaxed drape. The ${bestTop?.color || "neutral"} top and ${bestBottom?.color || "casual"} bottoms deliver an easygoing, comfortable daily aesthetic from your private wardrobe.`,
      College: `Smart collegiate aesthetic with high comfort for lectures and cafe walks. Clean relaxed geometry from your personal pieces.`,
      Formal: `Sharp tailored contours with sophisticated balance. Intentional proportions suited for professional and formal settings.`,
      Streetwear: `Bold streetwear volume and balanced textures from your private closet.`,
      Party: `High visual energy with refined drape. Clean contrast highlights statement personal pieces for night venues.`,
      "Date Night": `Subtle texture depth and flattering clean silhouette from your private pieces.`,
    };

    const tips = {
      Casual: "Pair with clean white canvas sneakers and keep the hem untucked for relaxed drape.",
      College: "Layer with an open lightweight flannel or corduroy jacket for campus temperature changes.",
      Formal: "Tuck the shirt neatly and complement with minimal silver/leather accessories.",
      Streetwear: "Cuff the bottom hems slightly and style with retro chunky platform footwear.",
      Party: "Add statement jewelry and a sleek compact shoulder bag to complete the evening look.",
      "Date Night": "Leave the top collar slightly open and pair with subtle clean footwear.",
    };

    const titles = titleTemplates[occ] || titleTemplates.Casual;
    setOutfitName(titles[Math.floor(Math.random() * titles.length)]);
    setStyleFeedback(critiques[occ] || critiques.Casual);
    setStylingTip(tips[occ] || tips.Casual);
  };

  // Called when user clicks an occasion button (Casual, Formal, etc.)
  const handleSelectOccasion = (occ) => {
    setSelectedOccasion(occ);
    assembleOutfitForOccasion(occ, closetItems);
    showToast(`Assembled ${occ} outfit from private wardrobe! ✨`);
  };

  // Switch between strictly private pieces and all user pieces
  const handleWardrobeFilterChange = (filterType) => {
    setWardrobeFilter(filterType);
    const pool =
      filterType === "all" ? allUserItems : allUserItems.filter((i) => !i.isForSale);
    setClosetItems(pool);
    assembleOutfitForOccasion(selectedOccasion, pool);
    showToast(
      filterType === "all"
        ? `Showing all ${allUserItems.length} personal wardrobe pieces`
        : `Showing exclusively ${pool.length} private wardrobe pieces 🔒`,
      "info"
    );
  };

  // Fetch ONLY user's private closet items and saved outfits
  const fetchData = async () => {
    const userId = currentUser?.id || currentUser?._id;
    if (!userId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);

      // Fetch user's own items ONLY (no public/other user catalog items)
      const itemsRes = await fetch(
        `http://localhost:5001/api/clothes?userId=${userId}`
      );
      let userItems = [];
      if (itemsRes.ok) {
        userItems = await itemsRes.json();
      }
      if (!Array.isArray(userItems)) userItems = [];

      setAllUserItems(userItems);

      // Filter strictly for private wardrobe pieces (!isForSale)
      const privatePieces = userItems.filter((i) => !i.isForSale);
      const activePool = wardrobeFilter === "all" ? userItems : privatePieces;
      setClosetItems(activePool);

      // Also fetch saved outfits
      const outfitsRes = await fetch(
        `http://localhost:5001/api/outfits?userId=${userId}`
      );
      if (outfitsRes.ok) {
        const outfitsData = await outfitsRes.json();
        setSavedOutfits(Array.isArray(outfitsData) ? outfitsData : []);
      }

      // Auto-assemble outfit matching the current occasion strictly from user's private wardrobe!
      assembleOutfitForOccasion(selectedOccasion, activePool);
    } catch (err) {
      console.error("Error loading outfit data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userId = currentUser?.id || currentUser?._id;
    if (userId) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [currentUser?.id, currentUser?._id]);

  if (!currentUser) {
    return (
      <div className="planner-container" style={{ padding: "40px 16px" }}>
        <div className="empty-private-planner-card" style={{ maxWidth: "540px", margin: "40px auto" }}>
          <div className="empty-planner-icon-wrap">
            <Lock size={32} />
          </div>
          <h3>Private Wardrobe Access Required</h3>
          <p>
            The Outfit Planner operates exclusively on your personal private wardrobe.
            Sign in with your account or create a new profile to start assembling and styling your outfits!
          </p>
          <div className="empty-planner-actions">
            <button
              type="button"
              onClick={() => (openAuthModal ? openAuthModal("login") : navigate("/login"))}
              className="button button-primary"
            >
              Sign In to Your Wardrobe
            </button>
            <button
              type="button"
              onClick={() => (openAuthModal ? openAuthModal("register") : navigate("/register"))}
              className="button button-secondary"
            >
              Create Account (New User)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Randomize Outfit generator (strictly adheres to selectedOccasion)
  const handleRandomize = () => {
    assembleOutfitForOccasion(selectedOccasion, closetItems);
    showToast(`Shuffled a fresh ${selectedOccasion} combination! ✨`);
  };

  // Google Gemini AI Stylist Consultation
  const handleConsultGeminiStylist = async () => {
    if (!selectedTop && !selectedBottom && !selectedShoes) {
      showToast("Select at least one clothing piece first to get AI stylist feedback!", "info");
      return;
    }

    try {
      setAiConsulting(true);
      const res = await fetch("http://localhost:5001/api/ai/outfit-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: {
            top: selectedTop,
            bottom: selectedBottom,
            shoes: selectedShoes,
            accessory: selectedAccessory,
          },
          occasion: selectedOccasion,
        }),
      });

      const data = await res.json();
      if (data.score) setStyleScore(data.score);
      if (data.verdict) setStyleFeedback(data.verdict);
      if (data.vibeTitle) setOutfitName(data.vibeTitle);
      if (data.stylingTip) setStylingTip(data.stylingTip);
      if (data.model) setAiSource(data.model);

      confetti({ particleCount: 60, spread: 60 });
      showToast(`AI Stylist reviewed your outfit for ${selectedOccasion}! ✨`);
    } catch (err) {
      console.error("Gemini Stylist error:", err);
      showToast("Could not reach AI Stylist. Using local recommendation.", "info");
    } finally {
      setAiConsulting(false);
    }
  };

  // Google Gemini AI Auto-Assemble Fit from Closet
  const handleGeminiAutoAssemble = async () => {
    if (closetItems.length === 0) {
      showToast("Upload items to your closet first to let AI assemble fits!", "info");
      return;
    }

    try {
      setAutoAssembling(true);
      const res = await fetch("http://localhost:5001/api/ai/suggest-outfit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          closetItems,
          occasion: selectedOccasion,
        }),
      });

      const data = await res.json();
      if (data.topId) {
        const topMatch = closetItems.find((i) => String(i._id) === String(data.topId));
        if (topMatch) setSelectedTop(topMatch);
      }
      if (data.bottomId) {
        const btmMatch = closetItems.find((i) => String(i._id) === String(data.bottomId));
        if (btmMatch) setSelectedBottom(btmMatch);
      }
      if (data.shoesId) {
        const shoeMatch = closetItems.find((i) => String(i._id) === String(data.shoesId));
        if (shoeMatch) setSelectedShoes(shoeMatch);
      }
      if (data.accessoryId) {
        const accMatch = closetItems.find((i) => String(i._id) === String(data.accessoryId));
        if (accMatch) setSelectedAccessory(accMatch);
      }

      if (data.title) setOutfitName(data.title);
      if (data.rationale) setStyleFeedback(data.rationale);
      if (data.stylingTip) setStylingTip(data.stylingTip);
      if (data.model) setAiSource(data.model);

      confetti({ particleCount: 75, spread: 70 });
      showToast(`AI curated an outfit for ${selectedOccasion}! ✨`);
    } catch (err) {
      console.error("Auto assemble error:", err);
      // Fallback to local randomizer
      handleRandomize();
    } finally {
      setAutoAssembling(false);
    }
  };

  // Save outfit to lookbook
  const handleSaveOutfit = async () => {
    if (!selectedTop && !selectedBottom) {
      showToast("Please choose at least a top and bottom to create an outfit.", "info");
      return;
    }

    const userId = currentUser?.id || currentUser?._id;
    if (!userId) return;

    try {
      const response = await fetch("http://localhost:5001/api/outfits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId,
          creatorHandle: currentUser.handle || "wardrobe_user",
          creatorName: currentUser.name || "User",
          creatorAvatar: currentUser.avatar || "",
          name: outfitName || `${selectedOccasion} Look`,
          occasion: selectedOccasion,
          items: {
            top: selectedTop?._id,
            bottom: selectedBottom?._id,
            shoes: selectedShoes?._id,
            accessory: selectedAccessory?._id,
          },
          styleScore,
          styleNotes: styleFeedback,
          isPublic: false,
        }),
      });

      const saved = await response.json();
      if (response.ok) {
        confetti({ particleCount: 70, spread: 60 });
        setSavedOutfits((prev) => [saved, ...prev]);
        showToast("Outfit saved to your Lookbook! 📖");
      }
    } catch (err) {
      console.error("Save outfit error:", err);
    }
  };

  // Delete saved outfit
  const handleDeleteOutfit = async (id) => {
    try {
      const res = await fetch(`http://localhost:5001/api/outfits/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSavedOutfits((prev) => prev.filter((o) => o._id !== id));
        showToast("Outfit removed from lookbook.");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // Items filtered for active picker slot modal (sorted by occasion fit)
  const getPickerItems = () => {
    let pool = [];
    if (activePickingSlot === "top")
      pool = closetItems.filter(
        (i) => i.category === "Tops" || i.category === "Outerwear" || i.category === "Dresses"
      );
    else if (activePickingSlot === "bottom")
      pool = closetItems.filter((i) => i.category === "Bottoms");
    else if (activePickingSlot === "shoes")
      pool = closetItems.filter((i) => i.category === "Shoes");
    else if (activePickingSlot === "accessory")
      pool = closetItems.filter(
        (i) => i.category === "Accessories" || i.category === "Outerwear"
      );

    return pool.sort(
      (a, b) =>
        scoreItemForOccasion(b, selectedOccasion) -
        scoreItemForOccasion(a, selectedOccasion)
    );
  };

  return (
    <div className="planner-container">
      {/* Planner Header */}
      <div className="planner-header">
        <div className="planner-title-block">
          <div className="planner-title-row">
            <h2>Virtual Outfit Planner & Stylist</h2>
            <span className="planner-private-badge">
              <Lock size={13} />
              <span>
                {wardrobeFilter === "private" ? "Private Wardrobe" : "All My Pieces"} •{" "}
                {closetItems.length} {closetItems.length === 1 ? "Piece" : "Pieces"}
              </span>
            </span>
          </div>
          <p>
            Mix, match, and auto-generate outfits exclusively from your personal private wardrobe so you never overthink
            what to wear for college, casual outings, or parties!
          </p>
        </div>

        <div className="planner-header-controls">
          {/* Wardrobe Scope Switcher */}
          <div className="wardrobe-scope-pill">
            <button
              type="button"
              onClick={() => handleWardrobeFilterChange("private")}
              className={`scope-pill-btn ${wardrobeFilter === "private" ? "active" : ""}`}
              title="Only private pieces kept in your personal wardrobe"
            >
              <Lock size={12} />
              <span>Private Wardrobe</span>
            </button>
            <button
              type="button"
              onClick={() => handleWardrobeFilterChange("all")}
              className={`scope-pill-btn ${wardrobeFilter === "all" ? "active" : ""}`}
              title="Include all pieces in your personal closet (including items listed for sale)"
            >
              <span>All My Pieces</span>
            </button>
          </div>

          <div className="planner-tabs-switch">
            <button
              onClick={() => setActiveTab("creator")}
              className={`tab-switch-btn ${activeTab === "creator" ? "active" : ""}`}
            >
              <Sparkles size={16} /> Stylist Canvas
            </button>
            <button
              onClick={() => setActiveTab("lookbook")}
              className={`tab-switch-btn ${activeTab === "lookbook" ? "active" : ""}`}
            >
              <Bookmark size={16} /> My Lookbook ({savedOutfits.length})
            </button>
          </div>
        </div>
      </div>

      {activeTab === "creator" ? (
        loading ? (
          <div className="empty-private-planner-card" style={{ padding: "60px 20px" }}>
            <div className="empty-planner-icon-wrap">
              <Sparkles size={32} />
            </div>
            <h3>Opening Your Private Wardrobe...</h3>
            <p>Gathering your personal clothing items and styling fits...</p>
          </div>
        ) : closetItems.length === 0 ? (
          <div className="empty-private-planner-card">
            <div className="empty-planner-icon-wrap">
              <Lock size={32} />
            </div>
            <h3>
              {allUserItems.length > 0 && wardrobeFilter === "private"
                ? "No Private Pieces in Wardrobe"
                : "Your Private Wardrobe is Empty"}
            </h3>
            <p>
              {allUserItems.length > 0 && wardrobeFilter === "private"
                ? `You have ${allUserItems.length} items in your closet, but they are currently listed on the marketplace. You can style with all your pieces or upload new private garments.`
                : "The Outfit Planner only creates looks from garments saved privately in your wardrobe. Upload clothes in 'Upload & AI Studio' and choose Private Wardrobe to start assembling outfits!"}
            </p>
            <div className="empty-planner-actions">
              <button
                onClick={() => navigate("/add")}
                className="button button-primary"
              >
                <Plus size={16} /> Add Garment to Private Wardrobe
              </button>
              {allUserItems.length > 0 && wardrobeFilter === "private" && (
                <button
                  onClick={() => handleWardrobeFilterChange("all")}
                  className="button button-secondary"
                >
                  Style with All {allUserItems.length} Pieces (Including Listed)
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="planner-canvas-layout">
          {/* Left Mannequin Slots Display */}
          <div className="mannequin-slots-board">
            {/* Slot: TOP */}
            <div
              className={`outfit-slot-card ${!selectedTop ? "empty" : ""}`}
              onClick={() => setActivePickingSlot("top")}
            >
              <span className="slot-badge">Top / Outerwear</span>
              {selectedTop ? (
                <div className="slot-item-view">
                  <img
                    src={selectedTop.enhancedImage || selectedTop.image}
                    alt={selectedTop.name}
                    className="slot-img"
                  />
                  <div className="slot-desc">
                    <strong>{selectedTop.name}</strong>
                    <span>{selectedTop.color} • {selectedTop.brand || selectedTop.category}</span>
                  </div>
                </div>
              ) : (
                <div className="slot-empty-prompt">
                  <Plus size={24} />
                  <span>Choose Top</span>
                </div>
              )}
            </div>

            {/* Slot: BOTTOM */}
            <div
              className={`outfit-slot-card ${!selectedBottom ? "empty" : ""}`}
              onClick={() => setActivePickingSlot("bottom")}
            >
              <span className="slot-badge">Bottoms / Pants</span>
              {selectedBottom ? (
                <div className="slot-item-view">
                  <img
                    src={selectedBottom.enhancedImage || selectedBottom.image}
                    alt={selectedBottom.name}
                    className="slot-img"
                  />
                  <div className="slot-desc">
                    <strong>{selectedBottom.name}</strong>
                    <span>{selectedBottom.color} • {selectedBottom.brand || selectedBottom.category}</span>
                  </div>
                </div>
              ) : (
                <div className="slot-empty-prompt">
                  <Plus size={24} />
                  <span>Choose Bottom</span>
                </div>
              )}
            </div>

            {/* Slot: SHOES */}
            <div
              className={`outfit-slot-card ${!selectedShoes ? "empty" : ""}`}
              onClick={() => setActivePickingSlot("shoes")}
            >
              <span className="slot-badge">Footwear / Shoes</span>
              {selectedShoes ? (
                <div className="slot-item-view">
                  <img
                    src={selectedShoes.enhancedImage || selectedShoes.image}
                    alt={selectedShoes.name}
                    className="slot-img"
                  />
                  <div className="slot-desc">
                    <strong>{selectedShoes.name}</strong>
                    <span>{selectedShoes.color} • {selectedShoes.brand || selectedShoes.category}</span>
                  </div>
                </div>
              ) : (
                <div className="slot-empty-prompt">
                  <Plus size={24} />
                  <span>Choose Shoes</span>
                </div>
              )}
            </div>

            {/* Slot: ACCESSORY */}
            <div
              className={`outfit-slot-card ${!selectedAccessory ? "empty" : ""}`}
              onClick={() => setActivePickingSlot("accessory")}
            >
              <span className="slot-badge">Bag / Accessory</span>
              {selectedAccessory ? (
                <div className="slot-item-view">
                  <img
                    src={selectedAccessory.enhancedImage || selectedAccessory.image}
                    alt={selectedAccessory.name}
                    className="slot-img"
                  />
                  <div className="slot-desc">
                    <strong>{selectedAccessory.name}</strong>
                    <span>{selectedAccessory.color} • {selectedAccessory.category}</span>
                  </div>
                </div>
              ) : (
                <div className="slot-empty-prompt">
                  <Plus size={24} />
                  <span>Choose Accessory</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Styling & AI Controls */}
          <div className="planner-controls-sidebar">
            {/* Occasion Selector */}
            <div className="control-group">
              <label className="sidebar-group-label">Vibe / Occasion</label>
              <div className="occasion-grid-btns">
                {occasions.map((occ) => (
                  <button
                    key={occ}
                    onClick={() => handleSelectOccasion(occ)}
                    className={`occ-btn ${selectedOccasion === occ ? "active" : ""}`}
                  >
                    {occ}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Stylist Score Card */}
            <div className="ai-stylist-card">
              <div className="stylist-card-top">
                <div className="stylist-badge">
                  <Sparkles size={16} />
                  <span>AI Harmony Score</span>
                </div>
                <span className="score-percentage">{styleScore}% Match</span>
              </div>

              {aiSource && (
                <div className="ai-source-badge-pill">
                  <span>⚡ {aiSource}</span>
                </div>
              )}

              <p className="stylist-critique">"{styleFeedback}"</p>

              {stylingTip && (
                <div className="stylist-tip-box">
                  <span className="tip-icon">💡</span>
                  <div className="tip-text">
                    <strong>Stylist Pro-Tip:</strong> {stylingTip}
                  </div>
                </div>
              )}

              <div className="progress-bar-wrap">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${styleScore}%` }}
                ></div>
              </div>

              {/* Consult Gemini Button */}
              <button
                type="button"
                onClick={handleConsultGeminiStylist}
                disabled={aiConsulting}
                className="consult-gemini-btn"
              >
                <Sparkles size={15} />
                <span>
                  {aiConsulting ? "Gemini Stylist is Reviewing..." : "Consult Gemini AI Stylist"}
                </span>
              </button>
            </div>

            {/* Assemble & Shuffle Buttons */}
            <div className="planner-action-btns-grid">
              <button
                type="button"
                onClick={handleGeminiAutoAssemble}
                disabled={autoAssembling}
                className="button button-accent gemini-assemble-btn"
              >
                <Sparkles size={16} />
                <span>{autoAssembling ? "Curating..." : `AI Assemble for ${selectedOccasion}`}</span>
              </button>

              <button
                type="button"
                onClick={handleRandomize}
                className="button button-outline shuffle-btn"
                title="Shuffle Random Combination"
              >
                <Shuffle size={16} />
                <span>Shuffle</span>
              </button>
            </div>

            {/* Outfit Name Input */}
            <div className="control-group">
              <label className="sidebar-group-label">Lookbook Title</label>
              <input
                type="text"
                value={outfitName}
                onChange={(e) => setOutfitName(e.target.value)}
                placeholder="e.g. Campus Casual Friday"
                className="outfit-title-input"
              />
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveOutfit}
              className="button button-primary save-outfit-btn"
            >
              <Bookmark size={18} />
              <span>Save Look to My Lookbook</span>
            </button>
          </div>
        </div>
        )
      ) : (
        /* Saved Lookbook Outfits Tab */
        <div className="lookbook-view">
          {savedOutfits.length === 0 ? (
            <div className="empty-state">
              <Bookmark size={48} />
              <h3>Your lookbook is empty</h3>
              <p>Mix pieces on the Stylist Canvas and save your favorite fits here!</p>
            </div>
          ) : (
            <div className="lookbook-grid">
              {savedOutfits.map((outfit) => (
                <div key={outfit._id} className="lookbook-card">
                  <div className="lookbook-card-header">
                    <div>
                      <span className="lookbook-occ-badge">{outfit.occasion}</span>
                      <h4>{outfit.name}</h4>
                    </div>
                    <button
                      onClick={() => handleDeleteOutfit(outfit._id)}
                      className="delete-look-btn"
                      title="Delete Outfit"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* 4 Items Composite Grid */}
                  <div className="lookbook-items-quad">
                    {outfit.items?.top && (
                      <img
                        src={outfit.items.top.enhancedImage || outfit.items.top.image}
                        alt="Top"
                        title={outfit.items.top.name}
                      />
                    )}
                    {outfit.items?.bottom && (
                      <img
                        src={outfit.items.bottom.enhancedImage || outfit.items.bottom.image}
                        alt="Bottom"
                        title={outfit.items.bottom.name}
                      />
                    )}
                    {outfit.items?.shoes && (
                      <img
                        src={outfit.items.shoes.enhancedImage || outfit.items.shoes.image}
                        alt="Shoes"
                        title={outfit.items.shoes.name}
                      />
                    )}
                    {outfit.items?.accessory && (
                      <img
                        src={outfit.items.accessory.enhancedImage || outfit.items.accessory.image}
                        alt="Accessory"
                        title={outfit.items.accessory.name}
                      />
                    )}
                  </div>

                  <p className="lookbook-notes">{outfit.styleNotes}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Item Picker Modal */}
      {activePickingSlot && (
        <div className="modal-overlay" onClick={() => setActivePickingSlot(null)}>
          <div className="modal-content picker-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 style={{ margin: 0 }}>
                  Select {activePickingSlot.toUpperCase()} from Your{" "}
                  {wardrobeFilter === "private" ? "Private Wardrobe" : "Wardrobe"}
                </h3>
                <p className="modal-subtitle" style={{ margin: "4px 0 0", fontSize: "12px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                  <Lock size={12} />
                  {wardrobeFilter === "private"
                    ? "Only showing pieces from your personal private wardrobe"
                    : "Showing items from your personal collection"}
                </p>
              </div>
              <button
                onClick={() => setActivePickingSlot(null)}
                className="close-modal-btn"
              >
                ✕
              </button>
            </div>

            <div className="picker-grid">
              {getPickerItems().length === 0 ? (
                <div className="empty-picker-prompt" style={{ gridColumn: "1 / -1", textAlign: "center", padding: "30px 16px" }}>
                  <p className="empty-picker-msg" style={{ marginBottom: "12px", color: "var(--text-muted)", fontSize: "14px" }}>
                    No {activePickingSlot} items found in your {wardrobeFilter === "private" ? "private wardrobe" : "wardrobe"} yet.
                  </p>
                  <button
                    onClick={() => {
                      setActivePickingSlot(null);
                      navigate("/add");
                    }}
                    className="button button-primary"
                    style={{ fontSize: "13px", padding: "8px 16px" }}
                  >
                    + Add {activePickingSlot} to Private Wardrobe
                  </button>
                </div>
              ) : (
                getPickerItems().map((item) => (
                  <div
                    key={item._id}
                    onClick={() => {
                      if (activePickingSlot === "top") setSelectedTop(item);
                      if (activePickingSlot === "bottom") setSelectedBottom(item);
                      if (activePickingSlot === "shoes") setSelectedShoes(item);
                      if (activePickingSlot === "accessory") setSelectedAccessory(item);
                      setActivePickingSlot(null);
                    }}
                    className={`picker-item-card ${
                      scoreItemForOccasion(item, selectedOccasion) < 20 ? "mismatch-dim" : ""
                    }`}
                  >
                    <img
                      src={item.enhancedImage || item.image}
                      alt={item.name}
                      className="picker-img"
                    />
                    <strong>{item.name}</strong>
                    <span>{item.color} • {item.category}</span>
                    {scoreItemForOccasion(item, selectedOccasion) >= 60 ? (
                      <span className="picker-match-badge">✓ Fits {selectedOccasion}</span>
                    ) : scoreItemForOccasion(item, selectedOccasion) < 20 ? (
                      <span className="picker-mismatch-badge">⚠ Conflicts with {selectedOccasion}</span>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
