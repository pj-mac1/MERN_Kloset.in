import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  ShoppingBag,
  Shirt,
  Bookmark,
  DollarSign,
  Package,
  MapPin,
  Star,
  Globe,
  Lock,
  ArrowRight,
  Palette,
  Users,
} from "lucide-react";
import { useApp } from "../context/AppContext";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { currentUser, addToCart, showToast } = useApp();

  const [activeTab, setActiveTab] = useState("rack"); // 'rack', 'wardrobe', 'orders', 'lookbook'
  const [userClothes, setUserClothes] = useState([]);
  const [ordersData, setOrdersData] = useState({ purchases: [], sales: [], totalEarnings: 0 });
  const [userOutfits, setUserOutfits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  const fetchProfileData = async () => {
    if (!currentUser?.id) return;
    try {
      setLoading(true);
      // Fetch user's clothing
      const clothesRes = await fetch(
        `http://localhost:5001/api/clothes?userId=${currentUser.id}`
      );
      const clothes = await clothesRes.json();
      setUserClothes(Array.isArray(clothes) ? clothes : []);

      // Fetch user orders & sales
      const ordersRes = await fetch(
        `http://localhost:5001/api/orders/user/${currentUser.id}`
      );
      const orders = await ordersRes.json();
      setOrdersData(orders || { purchases: [], sales: [], totalEarnings: 0 });

      // Fetch user outfits
      const outfitsRes = await fetch(
        `http://localhost:5001/api/outfits?userId=${currentUser.id}`
      );
      const outfits = await outfitsRes.json();
      setUserOutfits(Array.isArray(outfits) ? outfits : []);
    } catch (err) {
      console.error("Error fetching profile data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.id) {
      fetchProfileData();
    }
  }, [currentUser?.id]);

  if (!currentUser) {
    return null;
  }

  const itemsForSale = userClothes.filter((c) => c.isForSale);
  const privateWardrobeItems = userClothes.filter((c) => !c.isForSale);

  return (
    <div className="profile-container">
      {/* Profile Header Box (Instagram Style) */}
      <div className="profile-header-card">
        <div className="profile-avatar-wrap">
          <img src={currentUser.avatar} alt={currentUser.name} className="profile-avatar" />
        </div>

        <div className="profile-info-block">
          <div className="profile-title-row">
            <h2>{currentUser.name}</h2>
            <span className="profile-handle-pill">@{currentUser.handle}</span>
            <div className="profile-rating-pill">
              <Star size={13} fill="#F59E0B" color="#F59E0B" />
              <span>{currentUser.rating || "4.9"}</span>
            </div>
          </div>

          <p className="profile-bio">{currentUser.bio}</p>

          <div className="profile-location-row">
            <MapPin size={14} />
            <span>{currentUser.location || "Community Member"}</span>
            <span style={{ margin: "0 6px", color: "var(--text-light)" }}>•</span>
            <span>
              {currentUser.registrationMethod === "phone"
                ? `📱 Phone: ${currentUser.phone || "Active"}`
                : `✉️ Gmail: ${currentUser.email || "Active"}`}
            </span>
          </div>

          {/* Social Stats */}
          <div className="profile-stats-row">
            <div className="stat-col">
              <strong>{userClothes.length}</strong>
              <span>Total Items</span>
            </div>
            <div className="stat-col">
              <strong>{itemsForSale.length}</strong>
              <span>On Thrift Rack</span>
            </div>
            <div className="stat-col">
              <strong>{currentUser.followers}</strong>
              <span>Followers</span>
            </div>
            <div className="stat-col">
              <strong>Rs. {ordersData.totalEarnings || 0}</strong>
              <span>Sales Earnings</span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Tabs */}
      <div className="profile-nav-tabs">
        <button
          onClick={() => setActiveTab("rack")}
          className={`prof-tab-btn ${activeTab === "rack" ? "active" : ""}`}
        >
          <ShoppingBag size={16} />
          <span>Thrift Rack ({itemsForSale.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("wardrobe")}
          className={`prof-tab-btn ${activeTab === "wardrobe" ? "active" : ""}`}
        >
          <Lock size={16} />
          <span>Private Closet ({privateWardrobeItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("lookbook")}
          className={`prof-tab-btn ${activeTab === "lookbook" ? "active" : ""}`}
        >
          <Bookmark size={16} />
          <span>Outfits Lookbook ({userOutfits.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("orders")}
          className={`prof-tab-btn ${activeTab === "orders" ? "active" : ""}`}
        >
          <Package size={16} />
          <span>Orders & Sales ({ordersData.purchases.length + ordersData.sales.length})</span>
        </button>
      </div>

      {/* Tab Contents */}
      {loading ? (
        <div className="loading-spinner-box">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      ) : activeTab === "rack" ? (
        /* Tab 1: Thrift Rack For Sale */
        <div className="profile-grid">
          {itemsForSale.length === 0 ? (
            <div className="empty-state">
              <ShoppingBag size={48} />
              <h3>Your thrift rack is currently empty</h3>
              <p>You haven't listed any clothes for sale yet. Open your private wardrobe and click "List for Sale" on any item!</p>
              <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "15px" }}>
                <Link to="/market" className="button button-accent">
                  Sell on Thrift Store
                </Link>
                <Link to="/closet" className="button button-secondary">
                  Go to My Wardrobe
                </Link>
              </div>
            </div>
          ) : (
            <div className="closet-grid">
              {itemsForSale.map((item) => (
                <div key={item._id} className="closet-item-card">
                  <div className="closet-img-wrap">
                    <img
                      src={item.enhancedImage || item.image}
                      alt={item.name}
                      className="closet-item-img"
                    />
                    <div className="closet-visibility-pill">
                      <span className="for-sale-pill">
                        <Globe size={12} /> Rs. {item.price}
                      </span>
                    </div>
                    {item.isCustomized && (
                      <span className="custom-badge-closet">
                        <Palette size={12} /> Rework
                      </span>
                    )}
                  </div>
                  <div className="closet-item-body">
                    <span className="closet-category-tag">{item.category}</span>
                    <h3 className="closet-item-title">{item.name}</h3>
                    <p className="closet-item-brand">{item.condition}</p>
                    <div className="card-likes-count" style={{ marginTop: "8px" }}>
                      <strong>{item.likes?.length || 0} likes</strong> • {item.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === "wardrobe" ? (
        /* Tab 2: Private Wardrobe */
        <div className="profile-grid">
          {privateWardrobeItems.length === 0 ? (
            <div className="empty-state">
              <Shirt size={48} />
              <h3>No private items in your closet</h3>
              <p>Add clothing items to start building your wardrobe!</p>
              <Link to="/add" className="button button-primary" style={{ marginTop: "15px" }}>
                Add Clothing
              </Link>
            </div>
          ) : (
            <div className="closet-grid">
              {privateWardrobeItems.map((item) => (
                <div key={item._id} className="closet-item-card">
                  <div className="closet-img-wrap">
                    <img
                      src={item.enhancedImage || item.image}
                      alt={item.name}
                      className="closet-item-img"
                    />
                    <div className="closet-visibility-pill">
                      <span className="private-pill">
                        <Lock size={12} /> Private
                      </span>
                    </div>
                  </div>
                  <div className="closet-item-body">
                    <span className="closet-category-tag">{item.category}</span>
                    <h3 className="closet-item-title">{item.name}</h3>
                    <p className="closet-item-brand">{item.color} • {item.brand || "Unbranded"}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === "lookbook" ? (
        /* Tab 3: Outfits Lookbook */
        <div className="lookbook-view">
          {userOutfits.length === 0 ? (
            <div className="empty-state">
              <Bookmark size={48} />
              <h3>No saved outfits in your lookbook</h3>
              <p>Plan and mix outfits using the Outfit Planner!</p>
              <Link to="/planner" className="button button-primary" style={{ marginTop: "15px" }}>
                Open Outfit Planner
              </Link>
            </div>
          ) : (
            <div className="lookbook-grid">
              {userOutfits.map((outfit) => (
                <div key={outfit._id} className="lookbook-card">
                  <span className="lookbook-occ-badge">{outfit.occasion}</span>
                  <h4>{outfit.name}</h4>
                  <div className="lookbook-items-quad">
                    {outfit.items?.top && (
                      <img src={outfit.items.top.enhancedImage || outfit.items.top.image} alt="Top" />
                    )}
                    {outfit.items?.bottom && (
                      <img src={outfit.items.bottom.enhancedImage || outfit.items.bottom.image} alt="Bottom" />
                    )}
                    {outfit.items?.shoes && (
                      <img src={outfit.items.shoes.enhancedImage || outfit.items.shoes.image} alt="Shoes" />
                    )}
                    {outfit.items?.accessory && (
                      <img src={outfit.items.accessory.enhancedImage || outfit.items.accessory.image} alt="Accessory" />
                    )}
                  </div>
                  <p className="lookbook-notes">{outfit.styleNotes}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Tab 4: Orders & Sales */
        <div className="orders-summary-view">
          <div className="orders-quad-split">
            {/* Sales Section */}
            <div className="orders-sub-panel">
              <div className="sub-panel-title">
                <DollarSign size={20} color="#16a34a" />
                <h3>Your Sales (Rs. {ordersData.totalEarnings})</h3>
              </div>
              {ordersData.sales.length === 0 ? (
                <p className="no-orders-msg">No sales completed yet.</p>
              ) : (
                ordersData.sales.map((s) => (
                  <div key={s._id} className="order-history-card">
                    <div className="order-history-top">
                      <span>Order #{s._id.slice(-6).toUpperCase()}</span>
                      <strong className="sale-amount">+Rs. {s.totalAmount}</strong>
                    </div>
                    <p className="order-buyer-tag">Bought by @{s.buyerHandle}</p>
                    <div className="order-items-mini-list">
                      {s.items?.map((it, idx) => (
                        <div key={idx} className="mini-item-row">
                          <img src={it.image} alt={it.name} />
                          <span>{it.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Purchases Section */}
            <div className="orders-sub-panel">
              <div className="sub-panel-title">
                <Package size={20} color="#C86D51" />
                <h3>Your Purchases ({ordersData.purchases.length})</h3>
              </div>
              {ordersData.purchases.length === 0 ? (
                <p className="no-orders-msg">You haven't bought any thrift pieces yet.</p>
              ) : (
                ordersData.purchases.map((p) => (
                  <div key={p._id} className="order-history-card">
                    <div className="order-history-top">
                      <span>Order #{p._id.slice(-6).toUpperCase()}</span>
                      <strong className="purchase-amount">Rs. {p.totalAmount}</strong>
                    </div>
                    <p className="order-buyer-tag">Purchased from @{p.sellerHandle}</p>
                    <div className="order-items-mini-list">
                      {p.items?.map((it, idx) => (
                        <div key={idx} className="mini-item-row">
                          <img src={it.image} alt={it.name} />
                          <span>{it.name}</span>
                        </div>
                      ))}
                    </div>
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
