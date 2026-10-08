import React, { useState, useEffect } from "react";
import {
  ShoppingBag,
  Sparkles,
  Search,
  Filter,
  Palette,
  Heart,
  Tag,
  CheckCircle,
  Eye,
  PlusCircle,
  Phone,
  Mail,
  Shirt,
  DollarSign,
  Upload,
  Camera,
  Check,
  Trash2,
  Lock,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { useApp } from "../context/AppContext";

export default function ThriftMarket() {
  const {
    addToCart,
    currentUser,
    showToast,
    openAuthModal,
  } = useApp();

  // Active Main View: 'buy' | 'sell' | 'my-listings'
  const [activeView, setActiveView] = useState("buy");

  // Market Items State
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters for Buying
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [conditionFilter, setConditionFilter] = useState("All");
  const [onlyCustomized, setOnlyCustomized] = useState(false);
  const [maxPrice, setMaxPrice] = useState(150);
  const [sortBy, setSortBy] = useState("newest"); // 'newest' | 'price_low' | 'price_high'

  // Quick view modal
  const [quickViewItem, setQuickViewItem] = useState(null);

  // SELL FORM STATE
  const [sellPhoto, setSellPhoto] = useState(null);
  const [sellLoading, setSellLoading] = useState(false);
  const [sellForm, setSellForm] = useState({
    name: "",
    category: "Tops",
    color: "",
    brand: "",
    size: "M",
    description: "",
    condition: "Gently Used",
    price: 30,
    originalPrice: 65,
    isCustomized: false,
    sellerPhone: currentUser.phone || "",
    sellerEmail: currentUser.email || "",
    tags: ["vintage", "casual"],
  });

  // Demo clothing photos for fast one-click testing
  const sampleGarments = [
    {
      title: "Vintage 90s Bomber Jacket",
      category: "Outerwear",
      color: "Olive Green",
      brand: "Alpha Thrift",
      size: "L",
      condition: "Vintage Thrifted",
      price: 45,
      originalPrice: 120,
      url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80",
    },
    {
      title: "Distressed Levi's 501 Jeans",
      category: "Bottoms",
      color: "Light Washed Denim",
      brand: "Levi's",
      size: "32",
      condition: "Gently Used",
      price: 38,
      originalPrice: 85,
      url: "https://images.unsplash.com/photo-1542272604-780c96856592?w=800&auto=format&fit=crop&q=80",
    },
    {
      title: "Collegiate Heavyweight Hoodie",
      category: "Tops",
      color: "Heather Grey",
      brand: "Champion",
      size: "M",
      condition: "Like New",
      price: 28,
      originalPrice: 60,
      url: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80",
    },
    {
      title: "Retro High-Top Sneakers",
      category: "Shoes",
      color: "White & Crimson",
      brand: "Nike Vintage",
      size: "US 10",
      condition: "Gently Used",
      price: 52,
      originalPrice: 110,
      url: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80",
    },
  ];

  // Fetch all thrift clothes for sale
  const fetchMarketItems = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5001/api/clothes?isForSale=true");
      const data = await response.json();
      setItems(data);
    } catch (err) {
      console.error("Failed to load thrift market items:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketItems();
  }, []);

  // Update seller contact when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setSellForm((prev) => ({
        ...prev,
        sellerPhone: prev.sellerPhone || currentUser.phone || "",
        sellerEmail: prev.sellerEmail || currentUser.email || "",
      }));
    }
  }, [currentUser]);

  // Photo upload handler
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setSellPhoto(uploadEvent.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handlePickSample = (sample) => {
    setSellPhoto(sample.url);
    setSellForm((prev) => ({
      ...prev,
      name: sample.title,
      category: sample.category,
      color: sample.color,
      brand: sample.brand,
      size: sample.size,
      condition: sample.condition,
      price: sample.price,
      originalPrice: sample.originalPrice,
    }));
    showToast(`Loaded "${sample.title}" sample!`);
  };

  // Submit Sell Form
  const handleSellSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser || !currentUser.id) {
      openAuthModal("register");
      showToast("Please register or sign in before listing clothes for sale", "info");
      return;
    }

    if (!sellForm.name.trim()) {
      showToast("Please provide a name/title for your garment", "error");
      return;
    }

    setSellLoading(true);
    try {
      const payload = {
        name: sellForm.name.trim(),
        category: sellForm.category,
        color: sellForm.color.trim() || "Multi",
        brand: sellForm.brand.trim() || "Thrifted",
        size: sellForm.size.trim() || "Standard",
        condition: sellForm.condition,
        price: Number(sellForm.price) || 20,
        originalPrice: Number(sellForm.originalPrice) || Number(sellForm.price) * 1.5,
        isCustomized: sellForm.isCustomized,
        description: sellForm.description.trim() || "Pre-loved second-hand piece in great shape.",
        image:
          sellPhoto ||
          "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800",
        enhancedImage: sellPhoto,
        isForSale: true,
        isPublic: true,
        status: "Available",
        userId: currentUser.id,
        sellerName: currentUser.name,
        sellerHandle: currentUser.handle,
        sellerAvatar: currentUser.avatar,
        sellerPhone: sellForm.sellerPhone || currentUser.phone || "",
        sellerEmail: sellForm.sellerEmail || currentUser.email || "",
        tags: sellForm.tags,
      };

      const response = await fetch("http://localhost:5001/api/clothes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        showToast(`🎉 "${sellForm.name}" is now live on the Thrift Store!`);
        // Reset form
        setSellForm({
          name: "",
          category: "Tops",
          color: "",
          brand: "",
          size: "M",
          description: "",
          condition: "Gently Used",
          price: 30,
          originalPrice: 65,
          isCustomized: false,
          sellerPhone: currentUser.phone || "",
          sellerEmail: currentUser.email || "",
          tags: ["vintage", "casual"],
        });
        setSellPhoto(null);
        // Refresh items and switch to buy view to see the new item
        await fetchMarketItems();
        setActiveView("buy");
      } else {
        alert(data.message || "Failed to list item for sale");
      }
    } catch (err) {
      console.error("Sell listing error:", err);
      alert("Could not connect to the backend server.");
    } finally {
      setSellLoading(false);
    }
  };

  // Delete an item from seller's listings
  const handleDeleteListing = async (id) => {
    if (!window.confirm("Remove this second-hand listing from the thrift store?")) return;
    try {
      const res = await fetch(`http://localhost:5001/api/clothes/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setItems((prev) => prev.filter((it) => it._id !== id));
        showToast("Listing removed from thrift store.");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // Mark item as sold
  const handleMarkSold = async (item) => {
    try {
      const newStatus = item.status === "Sold" ? "Available" : "Sold";
      const res = await fetch(`http://localhost:5001/api/clothes/${item._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setItems((prev) =>
          prev.map((it) => (it._id === item._id ? { ...it, status: newStatus } : it))
        );
        showToast(
          newStatus === "Sold" ? "Marked as SOLD! 🎉" : "Item re-opened as Available!"
        );
      }
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  const categories = ["All", "Tops", "Bottoms", "Outerwear", "Dresses", "Shoes", "Accessories"];
  const conditions = [
    "All",
    "Gently Used",
    "Like New",
    "Brand New with Tags",
    "Vintage Thrifted",
    "Customized / Upcycled",
  ];

  // User's own listings
  const myListings = items.filter((item) => item.userId === currentUser?.id);

  // Filtered Items for Buying
  const filteredItems = items
    .filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sellerHandle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.color?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
      const matchesCondition =
        conditionFilter === "All" || item.condition === conditionFilter;
      const matchesCustom = !onlyCustomized || item.isCustomized;
      const matchesPrice = item.price <= maxPrice;

      return matchesSearch && matchesCategory && matchesCondition && matchesCustom && matchesPrice;
    })
    .sort((a, b) => {
      if (sortBy === "price_low") return a.price - b.price;
      if (sortBy === "price_high") return b.price - a.price;
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

  return (
    <div className="thrift-store-page">
      {/* Top Main Navigation Bar: BUY vs SELL */}
      <div className="thrift-mode-banner">
        <div className="thrift-mode-inner">
          <div className="thrift-mode-title-block">
            <span className="mode-pill-tag">
              <Sparkles size={13} /> Circular Thrift Fashion
            </span>
            <h1>Community Thrift Store</h1>
            <p>Buy curated pre-loved clothes or sell your second-hand wardrobe with direct contacts.</p>
          </div>

          <div className="thrift-view-switcher">
            <button
              onClick={() => setActiveView("buy")}
              className={`thrift-switch-btn ${activeView === "buy" ? "active" : ""}`}
            >
              <ShoppingBag size={18} />
              <span>Buy Clothes ({items.length})</span>
            </button>

            <button
              onClick={() => setActiveView("sell")}
              className={`thrift-switch-btn ${activeView === "sell" ? "active sell-active" : ""}`}
            >
              <PlusCircle size={18} />
              <span>Sell Clothes</span>
            </button>

            <button
              onClick={() => setActiveView("my-listings")}
              className={`thrift-switch-btn ${activeView === "my-listings" ? "active" : ""}`}
            >
              <Tag size={18} />
              <span>My Listings ({myListings.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          VIEW 1: BUY SECOND-HAND CLOTHES
          ========================================================================= */}
      {activeView === "buy" && (
        <div className="buy-section-container">
          {/* Controls & Filters Bar */}
          <div className="market-controls-wrapper">
            {/* Search Input */}
            <div className="search-bar-wrap">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search second-hand clothes (Levi's, oversized sweaters, denim...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} className="clear-search-btn">
                  ✕
                </button>
              )}
            </div>

            {/* Categories Row */}
            <div className="categories-pill-row">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`cat-pill ${categoryFilter === cat ? "active" : ""}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Condition & Price Bar */}
            <div className="sub-filters-row">
              {/* Garment Condition Filters */}
              <div className="condition-filter-group">
                <span className="sub-filter-label">Condition:</span>
                {conditions.map((cond) => (
                  <button
                    key={cond}
                    onClick={() => setConditionFilter(cond)}
                    className={`tag-pill ${conditionFilter === cond ? "active" : ""}`}
                  >
                    {cond}
                  </button>
                ))}
              </div>

              {/* Price & Sort Filters */}
              <div className="filter-toggles-group">
                <div className="sort-select-wrap">
                  <span className="sub-filter-label">Sort:</span>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="newest">Latest Drops</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                  </select>
                </div>

                <div className="price-slider-wrap">
                  <span>Max: Rs. {maxPrice}</span>
                  <input
                    type="range"
                    min="10"
                    max="200"
                    step="5"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="loading-spinner-box">
              <div className="spinner"></div>
              <p>Fetching second-hand pieces from thrift closets...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="empty-state">
              <ShoppingBag size={48} />
              <h3>No second-hand clothes matched your search</h3>
              <p>Try resetting filters or be the first to sell a piece in this category!</p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setCategoryFilter("All");
                  setConditionFilter("All");
                  setMaxPrice(150);
                }}
                className="button button-secondary"
                style={{ marginTop: "12px" }}
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="market-products-grid">
              {filteredItems.map((item) => {
                const isSold = item.status === "Sold";
                const isOwnItem = item.userId === currentUser?.id;
                const savings =
                  item.originalPrice > item.price
                    ? Math.round(
                        ((item.originalPrice - item.price) / item.originalPrice) * 100
                      )
                    : 0;

                return (
                  <div key={item._id} className="product-card thrift-item-card">
                    <div className="product-image-wrap">
                      <img
                        src={item.enhancedImage || item.image || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600"}
                        alt={item.name}
                        className="product-img"
                      />

                      {/* Top Badges */}
                      <div className="product-badges-top">
                        <span className="condition-chip-badge">{item.condition}</span>
                        {savings > 0 && (
                          <span className="savings-badge-pill">Save {savings}%</span>
                        )}
                        {item.isCustomized && (
                          <span className="custom-rework-badge">
                            <Palette size={12} /> Rework
                          </span>
                        )}
                        {isSold && <span className="sold-badge">SOLD</span>}
                      </div>

                      {/* Quick Action Button */}
                      <button
                        onClick={() => setQuickViewItem(item)}
                        className="quick-view-btn"
                        title="Quick Details"
                      >
                        <Eye size={16} /> View Details
                      </button>
                    </div>

                    <div className="product-details">
                      {/* Seller Info Row */}
                      <div className="product-seller-row">
                        <span className="product-seller-handle">
                          @{item.sellerHandle || "seller"}
                        </span>
                        {item.sellerPhone && (
                          <span className="seller-contact-chip" title={`Seller: ${item.sellerPhone}`}>
                            <Phone size={11} /> Verified Seller
                          </span>
                        )}
                      </div>

                      <h3 className="product-name">{item.name}</h3>

                      <div className="product-meta-row">
                        <span className="product-brand">{item.brand || item.category}</span>
                        {item.size && <span className="product-size">Size {item.size}</span>}
                        {item.color && <span className="product-color">• {item.color}</span>}
                      </div>

                      {/* Pricing & Cart Action */}
                      <div className="product-pricing-bar">
                        <div className="price-stack">
                          <span className="price-main">Rs. {item.price}</span>
                          {item.originalPrice > item.price && (
                            <span className="price-original">Rs. {item.originalPrice}</span>
                          )}
                        </div>

                        {!isSold ? (
                          <button
                            onClick={() => addToCart(item)}
                            className="button button-primary add-bag-btn"
                          >
                            <ShoppingBag size={15} />
                            <span>Add to Bag</span>
                          </button>
                        ) : (
                          <span className="sold-out-text">Sold Out</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          VIEW 2: SELL SECOND-HAND CLOTHES
          ========================================================================= */}
      {activeView === "sell" && (
        <div className="sell-section-container">
          {/* Prompt if user is not registered / logged in */}
          {!currentUser || !currentUser.id ? (
            <div className="sell-auth-gate-card">
              <div className="gate-icon-wrap">
                <Shirt size={48} />
              </div>
              <h2>Register to Sell Second-Hand Clothes</h2>
              <p>
                To maintain trust and safety on Kloset Thrift Store, sellers must register their name
                using a valid Gmail address or phone number.
              </p>
              <div className="gate-cta-buttons">
                <button
                  onClick={() => openAuthModal("register")}
                  className="button button-accent gate-btn"
                >
                  <Mail size={18} />
                  <span>Register with Gmail or Phone</span>
                </button>
                <button
                  onClick={() => openAuthModal("login")}
                  className="button button-secondary gate-btn"
                >
                  <span>Already have an account? Sign In</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="sell-form-wrapper">
              {/* Seller Intro Banner */}
              <div className="seller-status-header">
                <div className="seller-avatar-block">
                  <img src={currentUser.avatar} alt={currentUser.name} />
                  <div>
                    <div className="seller-id-row">
                      <h3>{currentUser.name}</h3>
                      <span className="seller-handle-badge">@{currentUser.handle}</span>
                      <span className="seller-verified-pill">
                        <CheckCircle size={12} /> Registered Seller
                      </span>
                    </div>
                    <p className="seller-contact-hint">
                      {currentUser.registrationMethod === "phone"
                        ? `Registered via Phone: ${currentUser.phone || "Yes"}`
                        : `Registered via Gmail: ${currentUser.email || "Yes"}`}
                      {" • "}Your listings will be displayed in the live thrift store.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveView("my-listings")}
                  className="button button-secondary view-my-items-btn"
                >
                  <Tag size={15} />
                  <span>My Active Listings ({myListings.length})</span>
                </button>
              </div>

              <form onSubmit={handleSellSubmit} className="thrift-sell-form">
                {/* 1. Garment Photo Upload */}
                <div className="form-card-block">
                  <div className="block-header">
                    <span className="step-number">1</span>
                    <div>
                      <h4>Upload Garment Photo</h4>
                      <p>Clear front photo of the clothes you want to sell.</p>
                    </div>
                  </div>

                  {/* Fast Samples */}
                  <div className="fast-samples-bar">
                    <span className="samples-title">Or test with demo garment:</span>
                    <div className="sample-chips-wrap">
                      {sampleGarments.map((sg, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handlePickSample(sg)}
                          className="sample-item-chip"
                        >
                          {sg.title}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="photo-upload-grid">
                    <div className="photo-preview-box">
                      {sellPhoto ? (
                        <div className="preview-image-wrap">
                          <img src={sellPhoto} alt="Garment preview" className="preview-img" />
                          <button
                            type="button"
                            onClick={() => setSellPhoto(null)}
                            className="remove-photo-btn"
                            title="Remove photo"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="photo-placeholder-box">
                          <Shirt size={48} className="placeholder-icon" />
                          <p>No photo selected yet</p>
                          <span>Upload a photo or choose a demo piece above</span>
                        </div>
                      )}
                    </div>

                    <div className="photo-actions-box">
                      <label className="upload-cta-button primary">
                        <Upload size={18} />
                        <span>Choose Photo from Gallery</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          hidden
                        />
                      </label>

                      <label className="upload-cta-button secondary">
                        <Camera size={18} />
                        <span>Take Live Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handlePhotoUpload}
                          hidden
                        />
                      </label>
                      <p className="photo-tip">
                        💡 Tip: Hang your garment against a neutral wall or flat surface for the best buyer appeal!
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. Garment Details */}
                <div className="form-card-block">
                  <div className="block-header">
                    <span className="step-number">2</span>
                    <div>
                      <h4>Garment Title & Specification</h4>
                      <p>Accurate sizing and categorization helps buyers find your piece faster.</p>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Garment Title / Item Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. 90s Vintage Oversized Fleece Crewneck"
                      value={sellForm.name}
                      onChange={(e) => setSellForm({ ...sellForm, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-row-3">
                    <div className="form-group">
                      <label>Category *</label>
                      <select
                        value={sellForm.category}
                        onChange={(e) => setSellForm({ ...sellForm, category: e.target.value })}
                      >
                        <option value="Tops">Tops</option>
                        <option value="Bottoms">Bottoms</option>
                        <option value="Outerwear">Outerwear / Jackets</option>
                        <option value="Dresses">Dresses</option>
                        <option value="Shoes">Shoes</option>
                        <option value="Accessories">Accessories</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Brand / Maker</label>
                      <input
                        type="text"
                        placeholder="e.g. Levi's, Zara, Nike, Unbranded"
                        value={sellForm.brand}
                        onChange={(e) => setSellForm({ ...sellForm, brand: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label>Size</label>
                      <input
                        type="text"
                        placeholder="e.g. S, M, L, XL, 32"
                        value={sellForm.size}
                        onChange={(e) => setSellForm({ ...sellForm, size: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label>Dominant Color</label>
                      <input
                        type="text"
                        placeholder="e.g. Olive Green, Washed Navy, Black"
                        value={sellForm.color}
                        onChange={(e) => setSellForm({ ...sellForm, color: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label>Second-Hand Condition *</label>
                      <select
                        value={sellForm.condition}
                        onChange={(e) => setSellForm({ ...sellForm, condition: e.target.value })}
                      >
                        <option value="Brand New with Tags">Brand New with Tags (Never worn)</option>
                        <option value="Like New">Like New (Worn once or twice)</option>
                        <option value="Gently Used">Gently Used (Good shape, minimal wear)</option>
                        <option value="Vintage Thrifted">Vintage Thrifted (Authentic retro aged piece)</option>
                        <option value="Customized / Upcycled">Customized / Upcycled (Handmade reworked)</option>
                      </select>
                    </div>
                  </div>

                  <label className="checkbox-rework-label">
                    <input
                      type="checkbox"
                      checked={sellForm.isCustomized}
                      onChange={(e) =>
                        setSellForm({ ...sellForm, isCustomized: e.target.checked })
                      }
                    />
                    <Palette size={16} />
                    <span>This piece is a Customized or Upcycled rework</span>
                  </label>
                </div>

                {/* 3. Pricing & Seller Contact */}
                <div className="form-card-block">
                  <div className="block-header">
                    <span className="step-number">3</span>
                    <div>
                      <h4>Pricing & Seller Contact Information</h4>
                      <p>Set a fair thrift price and confirm how buyers can reach you.</p>
                    </div>
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label>Selling Price (Rs.) *</label>
                      <div className="price-input-wrapper">
                        <span className="currency-prefix">Rs.</span>
                        <input
                          type="number"
                          min="1"
                          value={sellForm.price}
                          onChange={(e) =>
                            setSellForm({ ...sellForm, price: Number(e.target.value) })
                          }
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Original Retail Price (Rs.) - optional</label>
                      <div className="price-input-wrapper">
                        <span className="currency-prefix">Rs.</span>
                        <input
                          type="number"
                          min="0"
                          value={sellForm.originalPrice}
                          onChange={(e) =>
                            setSellForm({ ...sellForm, originalPrice: Number(e.target.value) })
                          }
                        />
                      </div>
                      <span className="field-hint">
                        Shows buyers how much they save by shopping thrift!
                      </span>
                    </div>
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label>Seller Phone Number (WhatsApp / Calls)</label>
                      <div className="contact-input-wrapper">
                        <Phone size={16} className="contact-icon" />
                        <input
                          type="text"
                          placeholder="e.g. +91 98765 43210"
                          value={sellForm.sellerPhone}
                          onChange={(e) =>
                            setSellForm({ ...sellForm, sellerPhone: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Seller Gmail / Email</label>
                      <div className="contact-input-wrapper">
                        <Mail size={16} className="contact-icon" />
                        <input
                          type="email"
                          placeholder="e.g. yourname@gmail.com"
                          value={sellForm.sellerEmail}
                          onChange={(e) =>
                            setSellForm({ ...sellForm, sellerEmail: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Garment Description & Condition Notes</label>
                    <textarea
                      rows={3}
                      placeholder="Mention fabric feel, fit, any flaws, or why you're passing it on..."
                      value={sellForm.description}
                      onChange={(e) =>
                        setSellForm({ ...sellForm, description: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Submit Action */}
                <div className="form-submit-row">
                  <button
                    type="submit"
                    disabled={sellLoading}
                    className="button button-accent big-publish-btn"
                  >
                    {sellLoading ? (
                      "Publishing to Thrift Store..."
                    ) : (
                      <>
                        <Tag size={18} />
                        <span>List on Thrift Store for Rs. {sellForm.price}</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          VIEW 3: MY ACTIVE THRIFT LISTINGS
          ========================================================================= */}
      {activeView === "my-listings" && (
        <div className="my-listings-container">
          <div className="listings-header-bar">
            <div>
              <h2>My Active Thrift Listings</h2>
              <p>Manage second-hand clothes you have put up for sale.</p>
            </div>
            <button
              onClick={() => setActiveView("sell")}
              className="button button-primary"
            >
              <PlusCircle size={16} />
              <span>List Another Piece</span>
            </button>
          </div>

          {myListings.length === 0 ? (
            <div className="empty-state">
              <Tag size={48} />
              <h3>You don't have any active thrift listings yet</h3>
              <p>Click "Sell Clothes" to put your first second-hand piece on the market!</p>
              <button
                onClick={() => setActiveView("sell")}
                className="button button-accent"
                style={{ marginTop: "14px" }}
              >
                Sell Second-Hand Clothes
              </button>
            </div>
          ) : (
            <div className="my-listings-grid">
              {myListings.map((item) => {
                const isSold = item.status === "Sold";

                return (
                  <div key={item._id} className="my-listing-card">
                    <img
                      src={item.enhancedImage || item.image}
                      alt={item.name}
                      className="listing-thumb"
                    />

                    <div className="listing-info">
                      <div className="listing-status-row">
                        <span className={`status-pill ${isSold ? "sold" : "available"}`}>
                          {item.status || "Available"}
                        </span>
                        <span className="listing-cond">{item.condition}</span>
                      </div>

                      <h4 className="listing-title">{item.name}</h4>
                      <p className="listing-meta">
                        {item.category} • Size {item.size || "M"} • {item.color}
                      </p>

                      <div className="listing-price-row">
                        <span className="listing-price">Rs. {item.price}</span>
                        {item.originalPrice > item.price && (
                          <span className="listing-orig-price">Rs. {item.originalPrice}</span>
                        )}
                      </div>

                      <div className="listing-actions-row">
                        <button
                          onClick={() => handleMarkSold(item)}
                          className={`button ${isSold ? "button-secondary" : "button-primary"} action-sm`}
                        >
                          {isSold ? "Mark as Available" : "Mark as Sold"}
                        </button>

                        <button
                          onClick={() => handleDeleteListing(item._id)}
                          className="button button-secondary delete-sm"
                          title="Delete listing"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          QUICK VIEW / DETAILS MODAL
          ========================================================================= */}
      {quickViewItem && (
        <div className="modal-overlay" onClick={() => setQuickViewItem(null)}>
          <div className="modal-content quick-view-modal" onClick={(e) => e.stopPropagation()}>
            <div className="quick-view-grid">
              <div className="quick-view-image-pane">
                <img
                  src={quickViewItem.enhancedImage || quickViewItem.image || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600"}
                  alt={quickViewItem.name}
                  className="quick-view-img"
                />
              </div>

              <div className="quick-view-info-pane">
                <div className="quick-view-header">
                  <div className="seller-profile-row">
                    <img
                      src={quickViewItem.sellerAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                      alt={quickViewItem.sellerName}
                      className="seller-avatar-mini"
                    />
                    <div>
                      <strong>@{quickViewItem.sellerHandle}</strong>
                      <p>{quickViewItem.sellerName} • Verified Thrift Seller</p>
                    </div>
                  </div>
                  <button onClick={() => setQuickViewItem(null)} className="close-modal-btn">
                    ✕
                  </button>
                </div>

                <h2 className="quick-view-title">{quickViewItem.name}</h2>

                <div className="quick-view-price-row">
                  <span className="big-price">Rs. {quickViewItem.price}</span>
                  {quickViewItem.originalPrice > quickViewItem.price && (
                    <span className="struck-price">Rs. {quickViewItem.originalPrice}</span>
                  )}
                  {quickViewItem.isCustomized && (
                    <span className="custom-rework-badge">
                      <Palette size={13} /> 1-of-1 Upcycled Art
                    </span>
                  )}
                </div>

                <div className="quick-view-specs">
                  <div className="spec-item">
                    <span className="spec-label">Category:</span>
                    <strong>{quickViewItem.category}</strong>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Condition:</span>
                    <strong>{quickViewItem.condition}</strong>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Size:</span>
                    <strong>{quickViewItem.size || "Standard"}</strong>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Color:</span>
                    <strong>{quickViewItem.color}</strong>
                  </div>
                </div>

                <p className="quick-view-desc">{quickViewItem.description}</p>

                {/* Direct Seller Contact Details */}
                {(quickViewItem.sellerPhone || quickViewItem.sellerEmail) && (
                  <div className="seller-direct-contact-card">
                    <h5>Direct Seller Contact:</h5>
                    <div className="contact-methods-row">
                      {quickViewItem.sellerPhone && (
                        <a
                          href={`tel:${quickViewItem.sellerPhone}`}
                          className="seller-call-pill"
                        >
                          <Phone size={13} />
                          <span>Call / WhatsApp: {quickViewItem.sellerPhone}</span>
                        </a>
                      )}
                      {quickViewItem.sellerEmail && (
                        <a
                          href={`mailto:${quickViewItem.sellerEmail}`}
                          className="seller-mail-pill"
                        >
                          <Mail size={13} />
                          <span>Gmail: {quickViewItem.sellerEmail}</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}

                <div className="quick-view-actions">
                  {quickViewItem.status !== "Sold" ? (
                    <button
                      onClick={() => {
                        addToCart(quickViewItem);
                        setQuickViewItem(null);
                      }}
                      className="button button-primary big-buy-btn"
                    >
                      <ShoppingBag size={18} />
                      <span>Add to Bag • Rs. {quickViewItem.price}</span>
                    </button>
                  ) : (
                    <button disabled className="button button-secondary disabled-btn">
                      Item Has Been Sold
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
