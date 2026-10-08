import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  Camera,
  Sparkles,
  Tag,
  Palette,
  Lock,
  Globe,
  Check,
  Shirt,
  ShoppingBag,
} from "lucide-react";
import StudioEnhancer from "../components/StudioEnhancer";
import { useApp } from "../context/AppContext";

export default function AddClothing() {
  const navigate = useNavigate();
  const { currentUser, showToast } = useApp();

  const [selectedImage, setSelectedImage] = useState(null);
  const [enhancedImage, setEnhancedImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    name: "",
    category: "Tops",
    color: "",
    brand: "",
    size: "M",
    description: "",
    isPublic: false,
    isForSale: false,
    price: 28,
    originalPrice: 55,
    isCustomized: false,
    condition: "Like New",
    tags: ["casual", "college"],
  });

  const availableTags = [
    "college",
    "casual",
    "streetwear",
    "formal",
    "party",
    "vintage",
    "y2k",
    "minimalist",
    "athleisure",
  ];

  // Sample items to quickly test without looking for local files
  const sampleImages = [
    {
      title: "Vintage 90s Polo Tee",
      url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80",
    },
    {
      title: "Reworked Denim Jacket",
      url: "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=800&auto=format&fit=crop&q=80",
    },
    {
      title: "Wide Pleated Trousers",
      url: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80",
    },
    {
      title: "Retro Court Sneakers",
      url: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80",
    },
  ];

  const handleImageFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setSelectedImage(uploadEvent.target.result);
      setEnhancedImage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSample = (sample) => {
    setSelectedImage(sample.url);
    setEnhancedImage(null);
    setSelectedFile({ name: sample.title });
  };

  // Called when AI Auto-Detector finishes analysis
  const handleAiAnalysisComplete = (aiResult) => {
    setFormData((prev) => ({
      ...prev,
      name: aiResult.name || prev.name,
      category: aiResult.category || prev.category,
      color: aiResult.color || prev.color,
      brand: aiResult.brand || prev.brand,
      size: aiResult.size || prev.size,
      condition: aiResult.condition || prev.condition,
      price: aiResult.suggestedPrice || prev.price,
      isCustomized: aiResult.isCustomized ?? prev.isCustomized,
      description: aiResult.description || prev.description,
      tags: aiResult.tags?.length > 0 ? aiResult.tags : prev.tags,
    }));
    showToast("AI auto-detected garment attributes & tags! ✨");
  };

  // Toggle Tag
  const handleTagToggle = (tag) => {
    setFormData((prev) => {
      const exists = prev.tags.includes(tag);
      return {
        ...prev,
        tags: exists ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
      };
    });
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast("Please provide a name for this piece.", "info");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        image: selectedImage || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800",
        enhancedImage: enhancedImage || selectedImage,
        userId: currentUser.id,
        sellerName: currentUser.name,
        sellerHandle: currentUser.handle,
        sellerAvatar: currentUser.avatar,
        status: "Available",
      };

      const response = await fetch("http://localhost:5001/api/clothes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok) {
        showToast(
          formData.isForSale
            ? `🎉 "${formData.name}" listed on Thrift Market!`
            : `Added "${formData.name}" to your private wardrobe! 👗`
        );
        navigate(formData.isForSale ? "/market" : "/closet");
      } else {
        alert(data.message || "Failed to add clothing item");
      }
    } catch (err) {
      console.error("Submission error:", err);
      alert("Could not connect to the backend server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-clothing-page">
      <div className="add-clothing-header">
        <h2>Add to Wardrobe & AI Studio</h2>
        <p>
          Upload your garment photo. Our AI will analyze the piece, detect style tags, and apply
          a clean studio backdrop to make it presentable without altering the clothes.
        </p>
      </div>

      <div className="add-clothing-layout">
        {/* Left Column: Image Upload & AI Studio Enhancer */}
        <div className="upload-media-column">
          <div className="upload-box-card">
            <h3 className="section-title">1. Upload Garment Photo</h3>

            {/* Quick Sample Selector */}
            <div className="quick-samples-bar">
              <span className="sample-label">Or test with demo photo:</span>
              <div className="sample-chips-row">
                {sampleImages.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSample(s)}
                    className="sample-chip-btn"
                  >
                    {s.title}
                  </button>
                ))}
              </div>
            </div>

            {/* File Upload Buttons */}
            <div className="upload-buttons-row">
              <label className="upload-cta-btn">
                <Upload size={18} />
                <span>Choose from Gallery</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFile}
                  hidden
                />
              </label>

              <label className="upload-cta-btn secondary">
                <Camera size={18} />
                <span>Take Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageFile}
                  hidden
                />
              </label>
            </div>

            {/* AI Studio Enhancer Component */}
            {selectedImage ? (
              <StudioEnhancer
                imageUrl={selectedImage}
                onAnalysisComplete={handleAiAnalysisComplete}
                onEnhancedImageReady={(enhancedUrl) => setEnhancedImage(enhancedUrl)}
              />
            ) : (
              <div className="upload-placeholder-zone">
                <Shirt size={48} className="placeholder-icon" />
                <p>No photo selected yet</p>
                <span>Upload a photo or click one of the demo samples above to begin.</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Garment Details & Selling Controls */}
        <div className="details-form-column">
          <form onSubmit={handleSubmit} className="garment-form-card">
            <h3 className="section-title">2. Garment Details & Purpose</h3>

            {/* Visibility Mode Switcher */}
            <div className="visibility-mode-picker">
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, isForSale: false, isPublic: false })
                }
                className={`mode-btn ${!formData.isForSale ? "active" : ""}`}
              >
                <Lock size={16} />
                <div>
                  <strong>Private Wardrobe</strong>
                  <span>Keep inside your personal closet for outfit planning</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, isForSale: true, isPublic: true })
                }
                className={`mode-btn ${formData.isForSale ? "active" : ""}`}
              >
                <Globe size={16} />
                <div>
                  <strong>Sell on Thrift Market</strong>
                  <span>Publish to garage sale feed so other users can buy</span>
                </div>
              </button>
            </div>

            {/* If For Sale: Pricing & Condition */}
            {formData.isForSale && (
              <div className="selling-extra-box">
                <div className="selling-box-header">
                  <Tag size={16} />
                  <h4>Thrift Market Listing Details</h4>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label>Selling Price (Rs.)</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: Number(e.target.value) })
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Original Price (Rs.) - optional</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.originalPrice}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          originalPrice: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Garment Condition</label>
                  <select
                    value={formData.condition}
                    onChange={(e) =>
                      setFormData({ ...formData, condition: e.target.value })
                    }
                  >
                    <option value="Brand New with Tags">Brand New with Tags</option>
                    <option value="Like New">Like New</option>
                    <option value="Gently Used">Gently Used</option>
                    <option value="Customized / Upcycled">Customized / Upcycled</option>
                    <option value="Vintage Thrifted">Vintage Thrifted</option>
                  </select>
                </div>

                {/* Customized Piece Checkbox */}
                <label className="checkbox-rework-label">
                  <input
                    type="checkbox"
                    checked={formData.isCustomized}
                    onChange={(e) =>
                      setFormData({ ...formData, isCustomized: e.target.checked })
                    }
                  />
                  <Palette size={16} />
                  <span>Mark as Customized / Reworked Fashion (Handmade/DIY)</span>
                </label>
              </div>
            )}

            {/* Item Name */}
            <div className="form-group">
              <label>Clothing Title / Name</label>
              <input
                type="text"
                placeholder="e.g. Oversized Heavyweight Boxy Tee"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            {/* Category & Color */}
            <div className="form-row-2">
              <div className="form-group">
                <label>Category</label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
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
                <label>Dominant Color</label>
                <input
                  type="text"
                  placeholder="e.g. Vintage Cream"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Brand & Size */}
            <div className="form-row-2">
              <div className="form-group">
                <label>Brand / Origin</label>
                <input
                  type="text"
                  placeholder="e.g. Levi's, Thrifted, Stüssy"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Size</label>
                <input
                  type="text"
                  placeholder="e.g. S, M, L, 32, Free Size"
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                />
              </div>
            </div>

            {/* Occasion & Style Tags */}
            <div className="form-group">
              <label>Style & Occasion Tags (for Outfit Planner & Search)</label>
              <div className="tags-chips-selector">
                {availableTags.map((t) => {
                  const isSelected = formData.tags.includes(t);
                  return (
                    <button
                      type="button"
                      key={t}
                      onClick={() => handleTagToggle(t)}
                      className={`tag-toggle-chip ${isSelected ? "selected" : ""}`}
                    >
                      {isSelected && <Check size={12} />}
                      <span>#{t}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label>Description & Styling Notes</label>
              <textarea
                rows={3}
                placeholder="Mention silhouette drape, fabric feel, or rework story..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={loading}
              className="button button-primary submit-garment-btn"
            >
              {loading ? (
                "Saving to Kloset..."
              ) : formData.isForSale ? (
                <>
                  <Globe size={18} />
                  <span>Publish to Thrift Market (Rs. {formData.price})</span>
                </>
              ) : (
                <>
                  <Shirt size={18} />
                  <span>Save to My Private Wardrobe</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
