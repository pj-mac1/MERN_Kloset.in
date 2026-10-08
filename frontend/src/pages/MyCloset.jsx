import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  PlusCircle,
  Tag,
  Lock,
  Globe,
  Trash2,
  Edit2,
  Search,
  Shirt,
  Sparkles,
  Palette,
  Check,
} from "lucide-react";
import { useApp } from "../context/AppContext";

export default function MyCloset() {
  const { currentUser, showToast } = useApp();
  const [clothes, setClothes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [visibilityFilter, setVisibilityFilter] = useState("all"); // 'all', 'private', 'for_sale'

  // List for sale modal
  const [sellingModalItem, setSellingModalItem] = useState(null);
  const [sellForm, setSellForm] = useState({
    price: 35,
    originalPrice: 60,
    condition: "Like New",
    isCustomized: false,
  });

  // Edit item state
  const [editingItem, setEditingItem] = useState(null);

  const fetchUserClothes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5001/api/clothes?userId=${currentUser.id}`);
      const data = await response.json();
      setClothes(data);
    } catch (err) {
      console.error("Error fetching closet items:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserClothes();
  }, [currentUser.id]);

  // Toggle sale status (make public/for sale vs private)
  const handleToggleSale = async (item) => {
    if (!item.isForSale) {
      // Open modal to set price
      setSellingModalItem(item);
      setSellForm({
        price: item.price || 25,
        originalPrice: item.originalPrice || 50,
        condition: item.condition || "Like New",
        isCustomized: item.isCustomized || false,
      });
    } else {
      // Turn back to private
      try {
        const response = await fetch(
          `http://localhost:5001/api/clothes/${item._id}/toggle-sale`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isForSale: false, isPublic: false }),
          }
        );
        const updated = await response.json();
        setClothes((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
        showToast(`"${item.name}" moved back to your private wardrobe.`);
      } catch (err) {
        console.error("Toggle error:", err);
      }
    }
  };

  const submitListForSale = async (e) => {
    e.preventDefault();
    if (!sellingModalItem) return;

    try {
      const response = await fetch(
        `http://localhost:5001/api/clothes/${sellingModalItem._id}/toggle-sale`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            isForSale: true,
            isPublic: true,
            price: Number(sellForm.price),
            condition: sellForm.condition,
          }),
        }
      );
      const updated = await response.json();
      setClothes((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
      setSellingModalItem(null);
      showToast(`🎉 "${sellingModalItem.name}" is now public on the Thrift Market!`);
    } catch (err) {
      console.error("Failed to list item for sale:", err);
    }
  };

  // Delete item
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this piece from your closet?")) return;
    try {
      const response = await fetch(`http://localhost:5001/api/clothes/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setClothes((prev) => prev.filter((c) => c._id !== id));
        showToast("Piece removed from closet.");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // Save edit
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5001/api/clothes/${editingItem._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingItem),
      });
      const updated = await response.json();
      if (response.ok) {
        setClothes((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
        setEditingItem(null);
        showToast("Closet item updated!");
      }
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  const categories = ["All", "Tops", "Bottoms", "Dresses", "Outerwear", "Shoes", "Accessories"];

  const filteredClothes = clothes.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.color?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;

    let matchesVisibility = true;
    if (visibilityFilter === "private") matchesVisibility = !item.isForSale;
    if (visibilityFilter === "for_sale") matchesVisibility = item.isForSale;

    return matchesSearch && matchesCategory && matchesVisibility;
  });

  return (
    <div className="closet-page-container">
      {/* Header Banner */}
      <div className="closet-header-card">
        <div className="closet-header-info">
          <h2>My Digital Wardrobe</h2>
          <p>
            Your private catalog of tops, bottoms, shoes & accessories. Keep them for your
            daily outfit planner, or list specific pieces public to sell in the thrift market!
          </p>
        </div>

        <Link to="/add" className="button button-primary add-closet-cta">
          <PlusCircle size={18} />
          <span>Upload New Piece</span>
        </Link>
      </div>

      {/* Filter and Tab Bar */}
      <div className="closet-filters-panel">
        <div className="closet-search-row">
          <div className="search-bar-wrap">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search by name, color, or brand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="visibility-filter-tabs">
            <button
              onClick={() => setVisibilityFilter("all")}
              className={`vis-btn ${visibilityFilter === "all" ? "active" : ""}`}
            >
              All Items ({clothes.length})
            </button>
            <button
              onClick={() => setVisibilityFilter("private")}
              className={`vis-btn ${visibilityFilter === "private" ? "active" : ""}`}
            >
              <Lock size={14} />
              <span>Private Wardrobe</span>
            </button>
            <button
              onClick={() => setVisibilityFilter("for_sale")}
              className={`vis-btn ${visibilityFilter === "for_sale" ? "active" : ""}`}
            >
              <Globe size={14} />
              <span>Listed for Sale</span>
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
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
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="loading-spinner-box">
          <div className="spinner"></div>
          <p>Opening your digital wardrobe...</p>
        </div>
      ) : filteredClothes.length === 0 ? (
        <div className="empty-state">
          <Shirt size={48} />
          <h3>No clothing found in your wardrobe</h3>
          <p>Upload your tops, bottoms, sneakers, or accessories to start planning outfits and selling!</p>
          <Link to="/add" className="button button-primary" style={{ marginTop: "15px" }}>
            Add Clothing with AI Studio
          </Link>
        </div>
      ) : (
        <div className="closet-grid">
          {filteredClothes.map((item) => {
            const isForSale = item.isForSale;

            return (
              <div key={item._id} className="closet-item-card">
                <div className="closet-img-wrap">
                  <img
                    src={item.enhancedImage || item.image || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600"}
                    alt={item.name}
                    className="closet-item-img"
                  />

                  {/* Public / Private Pill */}
                  <div className="closet-visibility-pill">
                    {isForSale ? (
                      <span className="for-sale-pill">
                        <Globe size={12} /> Listed for Rs. {item.price}
                      </span>
                    ) : (
                      <span className="private-pill">
                        <Lock size={12} /> Private Wardrobe
                      </span>
                    )}
                  </div>

                  {item.isCustomized && (
                    <span className="custom-badge-closet">
                      <Palette size={12} /> Rework
                    </span>
                  )}
                </div>

                <div className="closet-item-body">
                  <div className="closet-item-meta-top">
                    <span className="closet-category-tag">{item.category}</span>
                    <span className="closet-color-tag">{item.color}</span>
                  </div>

                  <h3 className="closet-item-title">{item.name}</h3>

                  {item.brand && <p className="closet-item-brand">{item.brand}</p>}

                  {item.tags?.length > 0 && (
                    <div className="closet-tags-row">
                      {item.tags.map((t, i) => (
                        <span key={i} className="hashtag-chip-sm">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Action Bar */}
                  <div className="closet-actions-row">
                    <button
                      onClick={() => handleToggleSale(item)}
                      className={`button sell-toggle-btn ${
                        isForSale ? "button-secondary" : "button-accent"
                      }`}
                      title={isForSale ? "Make Private" : "Sell Item"}
                    >
                      <Tag size={14} />
                      <span>{isForSale ? "Remove from Sale" : "List for Sale"}</span>
                    </button>

                    <div className="closet-sub-actions">
                      <button
                        onClick={() => setEditingItem(item)}
                        className="closet-icon-btn"
                        title="Edit Details"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="closet-icon-btn delete-btn"
                        title="Delete from Closet"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List for Sale Modal */}
      {sellingModalItem && (
        <div className="modal-overlay" onClick={() => setSellingModalItem(null)}>
          <div className="modal-content sale-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>List "{sellingModalItem.name}" on Thrift Market</h3>
              <button onClick={() => setSellingModalItem(null)} className="close-modal-btn">
                ✕
              </button>
            </div>

            <form onSubmit={submitListForSale} className="sale-modal-form">
              <p className="sale-modal-subtitle">
                Set a fair price and condition so other shoppers can purchase this piece from your
                garage sale rack.
              </p>

              <div className="form-group">
                <label>Selling Price (Rs.)</label>
                <input
                  type="number"
                  min="1"
                  value={sellForm.price}
                  onChange={(e) => setSellForm({ ...sellForm, price: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Original Retail Price (Rs.) - optional for showing discount</label>
                <input
                  type="number"
                  min="0"
                  value={sellForm.originalPrice}
                  onChange={(e) =>
                    setSellForm({ ...sellForm, originalPrice: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>Item Condition</label>
                <select
                  value={sellForm.condition}
                  onChange={(e) =>
                    setSellForm({ ...sellForm, condition: e.target.value })
                  }
                >
                  <option value="Brand New with Tags">Brand New with Tags</option>
                  <option value="Like New">Like New</option>
                  <option value="Gently Used">Gently Used</option>
                  <option value="Customized / Upcycled">Customized / Upcycled</option>
                  <option value="Vintage Thrifted">Vintage Thrifted</option>
                </select>
              </div>

              <div className="modal-actions-bar">
                <button
                  type="button"
                  onClick={() => setSellingModalItem(null)}
                  className="button button-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="button button-primary">
                  Publish to Thrift Market
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {editingItem && (
        <div className="modal-overlay" onClick={() => setEditingItem(null)}>
          <div className="modal-content edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Closet Piece</h3>
              <button onClick={() => setEditingItem(null)} className="close-modal-btn">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="edit-modal-form">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={editingItem.name}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select
                  value={editingItem.category}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, category: e.target.value })
                  }
                >
                  <option value="Tops">Tops</option>
                  <option value="Bottoms">Bottoms</option>
                  <option value="Dresses">Dresses</option>
                  <option value="Outerwear">Outerwear</option>
                  <option value="Shoes">Shoes</option>
                  <option value="Accessories">Accessories</option>
                </select>
              </div>

              <div className="form-group">
                <label>Color</label>
                <input
                  type="text"
                  value={editingItem.color}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, color: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Brand</label>
                <input
                  type="text"
                  value={editingItem.brand || ""}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, brand: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>Size</label>
                <input
                  type="text"
                  value={editingItem.size || ""}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, size: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={editingItem.description || ""}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, description: e.target.value })
                  }
                />
              </div>

              <div className="modal-actions-bar">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="button button-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="button button-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
