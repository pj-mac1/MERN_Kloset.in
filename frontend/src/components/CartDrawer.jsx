import React, { useState } from "react";
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import confetti from "canvas-confetti";
import { useApp } from "../context/AppContext";

export default function CartDrawer() {
  const { cart, removeFromCart, clearCart, isCartOpen, setIsCartOpen, currentUser, showToast } =
    useApp();
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(null);

  const [address, setAddress] = useState({
    fullName: currentUser?.name || "Thrift Shopper",
    street: "742 Evergreen Terrace",
    city: currentUser?.location?.split(",")[0] || "New York",
    postalCode: "10001",
  });

  React.useEffect(() => {
    if (currentUser?.name) {
      setAddress((prev) => ({
        ...prev,
        fullName: currentUser.name,
        city: currentUser.location?.split(",")[0] || prev.city,
      }));
    }
  }, [currentUser]);

  if (!isCartOpen) return null;

  const subtotal = cart.reduce((acc, item) => acc + (item.price || 0), 0);
  const total = subtotal;

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5001/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerId: currentUser.id,
          buyerName: currentUser.name,
          buyerHandle: currentUser.handle,
          items: cart,
          shippingAddress: address,
          paymentMethod: "ThriftPay Digital Balance",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Fire celebration confetti!
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });

        setOrderComplete(data);
        clearCart();
        showToast("Order placed successfully! 🎉");
      } else {
        alert(data.message || "Failed to complete purchase.");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Could not connect to the backend server.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsCartOpen(false);
    setOrderComplete(null);
  };

  return (
    <div className="drawer-overlay" onClick={handleClose}>
      <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="drawer-header-title">
            <ShoppingBag size={20} />
            <h3>Your Shopping Bag ({cart.length})</h3>
          </div>
          <button onClick={handleClose} className="drawer-close-btn">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="drawer-body">
          {orderComplete ? (
            <div className="order-success-view">
              <div className="success-badge-icon">
                <CheckCircle2 size={48} color="#16a34a" />
              </div>
              <h3>Order Confirmed!</h3>
              <p className="order-id-label">
                Receipt #{orderComplete._id?.slice(-8).toUpperCase()}
              </p>
              <p className="order-message">
                Thank you, <strong>{orderComplete.buyerName}</strong>! The seller{" "}
                <strong>@{orderComplete.sellerHandle}</strong> has been notified and
                will prepare your package.
              </p>

              <div className="order-receipt-box">
                <div className="receipt-row">
                  <span>Items ({orderComplete.items?.length})</span>
                  <span>Rs. {orderComplete.totalAmount?.toFixed(2)}</span>
                </div>
                <div className="receipt-row">
                  <span>Shipping</span>
                  <span className="free-tag">FREE (Community Promo)</span>
                </div>
                <div className="receipt-total-row">
                  <span>Total Paid</span>
                  <strong>Rs. {orderComplete.totalAmount?.toFixed(2)}</strong>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="button button-primary continue-btn"
              >
                Continue Shopping
              </button>
            </div>
          ) : cart.length === 0 ? (
            <div className="empty-cart-view">
              <ShoppingBag size={48} className="empty-cart-icon" />
              <h4>Your bag is empty</h4>
              <p>Explore the thrift feed or garage sale to find unique reworked & vintage clothes!</p>
              <button
                onClick={handleClose}
                className="button button-primary"
                style={{ marginTop: "15px" }}
              >
                Browse Thrift Market
              </button>
            </div>
          ) : (
            <>
              {/* Item List */}
              <div className="cart-items-list">
                {cart.map((item) => (
                  <div key={item._id} className="cart-item-card">
                    <img
                      src={item.image || item.enhancedImage || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600"}
                      alt={item.name}
                      className="cart-item-thumb"
                    />
                    <div className="cart-item-details">
                      <div className="cart-item-top">
                        <span className="cart-item-seller">
                          @{item.sellerHandle || "seller"}
                        </span>
                        {item.isCustomized && (
                          <span className="custom-rework-pill-sm">Rework</span>
                        )}
                      </div>
                      <h4 className="cart-item-name">{item.name}</h4>
                      <div className="cart-item-meta">
                        <span>{item.category}</span>
                        {item.size && <span>• Size {item.size}</span>}
                      </div>
                      <div className="cart-item-price-row">
                        <span className="cart-item-price">Rs. {item.price}</span>
                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="cart-item-remove-btn"
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Shipping & Payment Section */}
              <form onSubmit={handleCheckout} className="checkout-form">
                <div className="checkout-section-title">
                  <ShieldCheck size={16} />
                  <span>Delivery Address</span>
                </div>

                <div className="checkout-input-row">
                  <input
                    type="text"
                    placeholder="Recipient Full Name"
                    value={address.fullName}
                    onChange={(e) =>
                      setAddress({ ...address, fullName: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="checkout-input-row">
                  <input
                    type="text"
                    placeholder="Street Address"
                    value={address.street}
                    onChange={(e) =>
                      setAddress({ ...address, street: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="checkout-input-group">
                  <input
                    type="text"
                    placeholder="City"
                    value={address.city}
                    onChange={(e) =>
                      setAddress({ ...address, city: e.target.value })
                    }
                    required
                  />
                  <input
                    type="text"
                    placeholder="Zip / Postal Code"
                    value={address.postalCode}
                    onChange={(e) =>
                      setAddress({ ...address, postalCode: e.target.value })
                    }
                    required
                  />
                </div>

                {/* Totals */}
                <div className="cart-summary-box">
                  <div className="summary-line">
                    <span>Subtotal</span>
                    <span>Rs. {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="summary-line">
                    <span>Thrift Buyer Protection</span>
                    <span className="free-tag">Included</span>
                  </div>
                  <div className="summary-line total-line">
                    <span>Total</span>
                    <span>Rs. {total.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="button button-primary checkout-submit-btn"
                >
                  {loading ? (
                    "Processing Purchase..."
                  ) : (
                    <>
                      <span>Complete Checkout (Rs. {total})</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
