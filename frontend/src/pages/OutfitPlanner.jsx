import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import confetti from "canvas-confetti";
import { useApp } from "../context/AppContext";

export default function OutfitPlanner() {
  const { currentUser, showToast } = useApp();
  const [closetItems, setClosetItems] = useState([]);
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

  // Tab: 'creator' vs 'lookbook'
  const [activeTab, setActiveTab] = useState("creator");

  // Fetch user closet items and saved outfits
  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch user's own items
      const itemsRes = await fetch(
        `http://localhost:5001/api/clothes?userId=${currentUser.id}`
      );
      const itemsData = await itemsRes.json();
      setClosetItems(itemsData);

      // Also fetch saved outfits
      const outfitsRes = await fetch(
        `http://localhost:5001/api/outfits?userId=${currentUser.id}`
      );
      const outfitsData = await outfitsRes.json();
      setSavedOutfits(outfitsData);

      // Auto-populate slots if empty
      const tops = itemsData.filter((i) => i.category === "Tops" || i.category === "Outerwear");
      const bottoms = itemsData.filter((i) => i.category === "Bottoms");
      const shoes = itemsData.filter((i) => i.category === "Shoes");
      const accs = itemsData.filter((i) => i.category === "Accessories" || i.category === "Outerwear");

      if (tops.length > 0) setSelectedTop(tops[0]);
      if (bottoms.length > 0) setSelectedBottom(bottoms[0]);
      if (shoes.length > 0) setSelectedShoes(shoes[0]);
      if (accs.length > 0) setSelectedAccessory(accs[0]);
    } catch (err) {
      console.error("Error loading outfit data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser.id]);

  // Randomize Outfit generator
  const handleRandomize = () => {
    // Filter by chosen occasion if possible, else all items
    const matchOccasion = (item) =>
      !selectedOccasion ||
      selectedOccasion === "All" ||
      item.tags?.includes(selectedOccasion.toLowerCase());

    const candidateTops = closetItems.filter(
      (i) => (i.category === "Tops" || i.category === "Outerwear") && matchOccasion(i)
    );
    const candidateBottoms = closetItems.filter(
      (i) => i.category === "Bottoms" && matchOccasion(i)
    );
    const candidateShoes = closetItems.filter(
      (i) => i.category === "Shoes" && matchOccasion(i)
    );
    const candidateAccs = closetItems.filter(
      (i) => (i.category === "Accessories" || i.category === "Outerwear") && matchOccasion(i)
    );

    const pick = (arr, fallbackCategory) => {
      if (arr.length > 0) return arr[Math.floor(Math.random() * arr.length)];
      const fallback = closetItems.filter((i) => i.category === fallbackCategory);
      return fallback[Math.floor(Math.random() * fallback.length)] || null;
    };

    const newTop = pick(candidateTops, "Tops");
    const newBottom = pick(candidateBottoms, "Bottoms");
    const newShoes = pick(candidateShoes, "Shoes");
    const newAcc = pick(candidateAccs, "Accessories");

    setSelectedTop(newTop);
    setSelectedBottom(newBottom);
    setSelectedShoes(newShoes);
    setSelectedAccessory(newAcc);

    // Dynamic style score & critique
    const calculatedScore = Math.floor(Math.random() * 8) + 92;
    setStyleScore(calculatedScore);

    const critiques = [
      `Aesthetic ${selectedOccasion} silhouette with effortless proportion balance.`,
      `Color tones harmonize seamlessly. Textures create depth without visual clutter.`,
      `Clean everyday styling with high comfort and versatile layering.`,
      `Contemporary thrift look with vintage proportions and modern footwear.`,
    ];
    setStyleFeedback(critiques[Math.floor(Math.random() * critiques.length)]);
    setOutfitName(`${selectedOccasion} ${["Aesthetic", "Drape", "Vibe", "Rotation"][Math.floor(Math.random() * 4)]}`);
    showToast("Generated a fresh outfit combination! ✨");
  };

  // Save outfit to lookbook
  const handleSaveOutfit = async () => {
    if (!selectedTop && !selectedBottom) {
      showToast("Please choose at least a top and bottom to create an outfit.", "info");
      return;
    }

    try {
      const response = await fetch("http://localhost:5001/api/outfits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          creatorHandle: currentUser.handle,
          creatorName: currentUser.name,
          creatorAvatar: currentUser.avatar,
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
          isPublic: true,
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

  // Items filtered for active picker slot modal
  const getPickerItems = () => {
    if (activePickingSlot === "top")
      return closetItems.filter((i) => i.category === "Tops" || i.category === "Outerwear");
    if (activePickingSlot === "bottom")
      return closetItems.filter((i) => i.category === "Bottoms");
    if (activePickingSlot === "shoes")
      return closetItems.filter((i) => i.category === "Shoes");
    if (activePickingSlot === "accessory")
      return closetItems.filter(
        (i) => i.category === "Accessories" || i.category === "Outerwear"
      );
    return [];
  };

  return (
    <div className="planner-container">
      {/* Planner Header */}
      <div className="planner-header">
        <div>
          <h2>Virtual Outfit Planner & Stylist</h2>
          <p>
            Mix, match, and auto-generate outfits from your digital wardrobe so you never overthink
            what to wear for college, casual outings, or parties!
          </p>
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

      {activeTab === "creator" ? (
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
                    onClick={() => setSelectedOccasion(occ)}
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
              <p className="stylist-critique">"{styleFeedback}"</p>
              <div className="progress-bar-wrap">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${styleScore}%` }}
                ></div>
              </div>
            </div>

            {/* Randomizer Button */}
            <button
              onClick={handleRandomize}
              className="button button-accent randomize-big-btn"
            >
              <Shuffle size={18} />
              <span>Randomize Outfit for {selectedOccasion}</span>
            </button>

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
              <h3>Select {activePickingSlot.toUpperCase()} from Your Wardrobe</h3>
              <button
                onClick={() => setActivePickingSlot(null)}
                className="close-modal-btn"
              >
                ✕
              </button>
            </div>

            <div className="picker-grid">
              {getPickerItems().length === 0 ? (
                <p className="empty-picker-msg">
                  No {activePickingSlot} items found in your closet yet. Add some from the "Add Clothing" page!
                </p>
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
                    className="picker-item-card"
                  >
                    <img
                      src={item.enhancedImage || item.image}
                      alt={item.name}
                      className="picker-img"
                    />
                    <strong>{item.name}</strong>
                    <span>{item.color}</span>
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
