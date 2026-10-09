import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Truck,
  CreditCard,
  Smartphone,
  Banknote,
  Building2,
  MapPin,
  Phone,
  Mail,
  User,
  Lock,
  Tag,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { useApp } from "../context/AppContext";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, clearCart, currentUser, showToast } = useApp();

  const [shipping, setShipping] = useState({
    fullName: currentUser?.name || "",
    phone: currentUser?.phone || "",
    email: currentUser?.email || "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [upiId, setUpiId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(null);
  const [error, setError] = useState("");

  const subtotal = cart.reduce((acc, it) => acc + (it.price || 0) * (it.quantity || 1), 0);
  const totalItemCount = cart.reduce((acc, it) => acc + (it.quantity || 1), 0);
  const shippingFee = subtotal >= 500 || subtotal === 0 ? 0 : 49;
  const platformFee = 0; // 100% Free platform fee for community thrift
  const grandTotal = subtotal + shippingFee + platformFee;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShipping((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError("");

    if (cart.length === 0) {
      setError("Your cart is empty. Add clothes to proceed.");
      return;
    }

    if (!shipping.fullName.trim()) {
      setError("Please provide your full recipient name.");
      return;
    }

    if (!shipping.phone.trim() && !shipping.email.trim()) {
      setError("Please provide a phone number or email for delivery updates.");
      return;
    }

    if (!shipping.address.trim() || !shipping.city.trim() || !shipping.pincode.trim()) {
      setError("Please fill in your complete delivery address (street, city, PIN code).");
      return;
    }

    if (paymentMethod === "upi" && upiId && !upiId.includes("@")) {
      setError("Please enter a valid UPI ID (e.g. mobile@upi, name@okhdfcbank).");
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        buyerId: currentUser?.id || "u_guest",
        buyerName: shipping.fullName,
        buyerHandle: currentUser?.handle || "thrift_shopper",
        items: cart.map((it) => ({
          itemId: it._id,
          name: it.name,
          category: it.category,
          price: it.price,
          quantity: it.quantity || 1,
          image: it.enhancedImage || it.image,
          isCustomized: it.isCustomized,
          condition: it.condition,
          sellerId: it.userId,
          sellerName: it.sellerName,
          sellerHandle: it.sellerHandle,
        })),
        totalAmount: grandTotal,
        shippingAddress: {
          recipientName: shipping.fullName,
          phone: shipping.phone,
          email: shipping.email,
          addressLine: shipping.address,
          city: shipping.city,
          state: shipping.state || "Active State",
          pincode: shipping.pincode,
        },
        paymentMethod:
          paymentMethod === "upi"
            ? `UPI (${upiId || "Instant Pay"})`
            : paymentMethod === "cod"
            ? "Cash on Delivery (COD)"
            : paymentMethod === "card"
            ? "Debit / Credit Card"
            : "Net Banking",
      };

      const res = await fetch("http://localhost:5001/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to process order.");
      }

      const confirmedOrder = data._id ? data : (data.order || {
        _id: `ORD_${Date.now()}`,
        items: cart,
        totalAmount: grandTotal,
        paymentMethod: orderPayload.paymentMethod,
        shippingAddress: orderPayload.shippingAddress,
      });

      setOrderComplete(confirmedOrder);
      clearCart();
      showToast("Order placed successfully! 🎉 Thank you for thrifting sustainably.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err.message || "An unexpected error occurred during checkout.");
      showToast(err.message || "Checkout failed", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS CONFIRMATION VIEW
  if (orderComplete) {
    return (
      <div className="checkout-page-container">
        <div className="checkout-success-card">
          <div className="success-icon-wrap">
            <CheckCircle2 size={54} className="success-checkmark" />
          </div>

          <span className="success-kicker">Order Confirmed</span>
          <h2>Thank You For Your Thrift Order!</h2>
          <p className="success-subtitle">
            Your circular fashion order has been safely placed with our verified sellers.
          </p>

          <div className="order-details-grid">
            <div className="order-detail-tile">
              <span className="tile-label">Order Reference ID</span>
              <strong className="tile-value mono-text">#{orderComplete._id?.slice(-8).toUpperCase() || "KLSET-9821"}</strong>
            </div>

            <div className="order-detail-tile">
              <span className="tile-label">Payment Mode</span>
              <strong className="tile-value">{orderComplete.paymentMethod || "Verified Payment"}</strong>
            </div>

            <div className="order-detail-tile">
              <span className="tile-label">Delivery Estimate</span>
              <strong className="tile-value">3 - 5 Business Days</strong>
            </div>

            <div className="order-detail-tile">
              <span className="tile-label">Total Amount Paid</span>
              <strong className="tile-value price-highlight">Rs. {orderComplete.totalAmount || grandTotal}</strong>
            </div>
          </div>

          {/* Purchased Items List */}
          {orderComplete.items && orderComplete.items.length > 0 && (
            <div className="delivery-destination-box confirmed-items-box">
              <div className="dest-header">
                <ShoppingBag size={18} />
                <h4>Items In This Order ({orderComplete.items.length})</h4>
              </div>
              <div className="confirmed-items-list">
                {orderComplete.items.map((it, idx) => (
                  <div key={idx} className="confirmed-item-row">
                    <img
                      src={
                        it.image ||
                        it.enhancedImage ||
                        "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600"
                      }
                      alt={it.name}
                      className="confirmed-item-img"
                    />
                    <div className="confirmed-item-details">
                      <span className="confirmed-item-name">{it.name}</span>
                      <span className="confirmed-item-meta">
                        {it.category || "Apparel"} • Qty: {it.quantity || 1}
                      </span>
                    </div>
                    <strong className="confirmed-item-price">
                      Rs. {(it.price || 0) * (it.quantity || 1)}
                    </strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Delivery Recipient Box */}
          {orderComplete.shippingAddress && (
            <div className="delivery-destination-box">
              <div className="dest-header">
                <MapPin size={18} />
                <h4>Shipping Address</h4>
              </div>
              <p className="dest-name"><strong>{orderComplete.shippingAddress.recipientName}</strong></p>
              <p className="dest-addr">
                {orderComplete.shippingAddress.addressLine}, {orderComplete.shippingAddress.city} - {orderComplete.shippingAddress.pincode}
              </p>
              {orderComplete.shippingAddress.phone && (
                <p className="dest-contact">Phone: {orderComplete.shippingAddress.phone}</p>
              )}
            </div>
          )}

          <div className="success-action-buttons">
            <Link to="/profile" className="button button-primary action-btn-lg">
              <span>View Order in My Profile</span>
              <ExternalLink size={16} />
            </Link>

            <Link to="/market" className="button button-secondary action-btn-lg">
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // EMPTY CART VIEW
  if (cart.length === 0) {
    return (
      <div className="checkout-page-container">
        <div className="checkout-empty-card">
          <ShoppingBag size={56} className="empty-cart-hero-icon" />
          <h2>Your Shopping Bag is Empty</h2>
          <p>You don't have any second-hand garments queued for checkout yet.</p>
          <div className="empty-actions-row">
            <Link to="/market" className="button button-primary">
              <ArrowLeft size={16} />
              <span>Explore Thrift Store</span>
            </Link>
            <Link to="/closet" className="button button-secondary">
              <span>Check My Wardrobe</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page-container">
      {/* Checkout Breadcrumb / Top Bar */}
      <div className="checkout-header-row">
        <button onClick={() => navigate(-1)} className="checkout-back-link">
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>
        <div className="checkout-page-title-wrap">
          <h1>Secure Checkout</h1>
          <p>Complete your circular thrift purchase directly from community members.</p>
        </div>
      </div>

      {error && (
        <div className="checkout-error-banner">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Main 2-Column Split */}
      <div className="checkout-main-grid">
        {/* Left Column: Delivery & Payment Details Form */}
        <form onSubmit={handlePlaceOrder} className="checkout-form-column">
          {/* STEP 1: Delivery Address */}
          <section className="checkout-section-card">
            <div className="section-title-row">
              <span className="step-number-chip">1</span>
              <div>
                <h3>Delivery Address</h3>
                <p>Where should our thrift sellers ship your clothing?</p>
              </div>
            </div>

            <div className="checkout-fields-grid">
              <div className="checkout-field-wrap span-2">
                <label>
                  Full Name <span className="req">*</span>
                </label>
                <div className="input-with-icon">
                  <User size={16} className="field-icon" />
                  <input
                    type="text"
                    name="fullName"
                    value={shipping.fullName}
                    onChange={handleInputChange}
                    placeholder="e.g. Maya Lin"
                    required
                  />
                </div>
              </div>

              <div className="checkout-field-wrap">
                <label>
                  Phone Number <span className="req">*</span>
                </label>
                <div className="input-with-icon">
                  <Phone size={16} className="field-icon" />
                  <input
                    type="tel"
                    name="phone"
                    value={shipping.phone}
                    onChange={handleInputChange}
                    placeholder="e.g. 9876543210"
                    required
                  />
                </div>
              </div>

              <div className="checkout-field-wrap">
                <label>Email Address</label>
                <div className="input-with-icon">
                  <Mail size={16} className="field-icon" />
                  <input
                    type="email"
                    name="email"
                    value={shipping.email}
                    onChange={handleInputChange}
                    placeholder="e.g. maya@gmail.com"
                  />
                </div>
              </div>

              <div className="checkout-field-wrap span-2">
                <label>
                  Street Address & Flat / House No. <span className="req">*</span>
                </label>
                <div className="input-with-icon">
                  <MapPin size={16} className="field-icon" />
                  <input
                    type="text"
                    name="address"
                    value={shipping.address}
                    onChange={handleInputChange}
                    placeholder="e.g. 402, Greenview Heights, Park Avenue"
                    required
                  />
                </div>
              </div>

              <div className="checkout-field-wrap">
                <label>
                  City <span className="req">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={shipping.city}
                  onChange={handleInputChange}
                  placeholder="e.g. Mumbai, New Delhi"
                  required
                />
              </div>

              <div className="checkout-field-wrap">
                <label>State / Province</label>
                <input
                  type="text"
                  name="state"
                  value={shipping.state}
                  onChange={handleInputChange}
                  placeholder="e.g. Maharashtra"
                />
              </div>

              <div className="checkout-field-wrap">
                <label>
                  PIN Code <span className="req">*</span>
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={shipping.pincode}
                  onChange={handleInputChange}
                  placeholder="e.g. 400001"
                  required
                />
              </div>
            </div>
          </section>

          {/* STEP 2: Payment Method */}
          <section className="checkout-section-card">
            <div className="section-title-row">
              <span className="step-number-chip">2</span>
              <div>
                <h3>Select Payment Method</h3>
                <p>All transactions are verified and secured under Kloset Thrift Protection.</p>
              </div>
            </div>

            <div className="payment-options-grid">
              {/* Option 1: UPI */}
              <label
                className={`payment-option-card ${paymentMethod === "upi" ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="upi"
                  checked={paymentMethod === "upi"}
                  onChange={() => setPaymentMethod("upi")}
                />
                <div className="payment-icon-wrap upi-bg">
                  <Smartphone size={20} />
                </div>
                <div className="payment-text-wrap">
                  <strong>UPI (GPay / PhonePe / Paytm / QR)</strong>
                  <span>Fast zero-fee digital payment via your preferred UPI app</span>
                </div>
              </label>

              {paymentMethod === "upi" && (
                <div className="payment-subfield-box">
                  <label>Enter UPI ID (Optional for fast QR link):</label>
                  <input
                    type="text"
                    placeholder="e.g. 9876543210@paytm or username@okhdfcbank"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                  />
                  <span className="subfield-hint">
                    You can also scan our seller QR code after placing the order.
                  </span>
                </div>
              )}

              {/* Option 2: Cash on Delivery */}
              <label
                className={`payment-option-card ${paymentMethod === "cod" ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                />
                <div className="payment-icon-wrap cod-bg">
                  <Banknote size={20} />
                </div>
                <div className="payment-text-wrap">
                  <strong>Cash on Delivery (COD)</strong>
                  <span>Pay upon arrival at your doorstep in cash or scan delivery QR</span>
                </div>
              </label>

              {/* Option 3: Card */}
              <label
                className={`payment-option-card ${paymentMethod === "card" ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={paymentMethod === "card"}
                  onChange={() => setPaymentMethod("card")}
                />
                <div className="payment-icon-wrap card-bg">
                  <CreditCard size={20} />
                </div>
                <div className="payment-text-wrap">
                  <strong>Debit / Credit Card (Visa, RuPay, Mastercard)</strong>
                  <span>Secured 128-bit encrypted card gateway</span>
                </div>
              </label>

              {/* Option 4: Net Banking */}
              <label
                className={`payment-option-card ${paymentMethod === "netbanking" ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="netbanking"
                  checked={paymentMethod === "netbanking"}
                  onChange={() => setPaymentMethod("netbanking")}
                />
                <div className="payment-icon-wrap bank-bg">
                  <Building2 size={20} />
                </div>
                <div className="payment-text-wrap">
                  <strong>Net Banking</strong>
                  <span>All major banks supported (HDFC, SBI, ICICI, Axis)</span>
                </div>
              </label>
            </div>
          </section>

          {/* Place Order CTA for mobile / primary form */}
          <div className="form-submit-block">
            <button
              type="submit"
              disabled={isSubmitting}
              className="button button-accent place-order-big-btn"
            >
              <Lock size={18} />
              <span>
                {isSubmitting ? "Processing Thrift Order..." : `Place Order (Rs. ${grandTotal})`}
              </span>
            </button>
            <p className="security-assurance-text">
              <ShieldCheck size={14} />
              Protected by 100% Kloset Money-Back Authenticity & Delivery Guarantee
            </p>
          </div>
        </form>

        {/* Right Column: Order Summary & Garment Items */}
        <aside className="checkout-summary-column">
          <div className="summary-sticky-card">
            <div className="summary-header">
              <h3>Order Summary</h3>
              <span className="item-count-pill">{totalItemCount} items</span>
            </div>

            {/* List of items */}
            <div className="summary-items-list">
              {cart.map((item) => (
                <div key={item._id} className="summary-item-tile">
                  <div className="summary-item-img-wrap">
                    <img
                      src={
                        item.enhancedImage ||
                        item.image ||
                        "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600"
                      }
                      alt={item.name}
                      className="summary-img"
                    />
                    {item.isCustomized && <span className="rework-dot-badge" title="Reworked DIY">★</span>}
                  </div>

                  <div className="summary-item-info">
                    <h4 className="summary-item-name">{item.name}</h4>
                    <p className="summary-item-seller">
                      Seller: <strong>@{item.sellerHandle || "community_member"}</strong>
                    </p>
                    <div className="summary-item-tags">
                      <span className="summary-condition-tag">{item.condition || "Pre-loved"}</span>
                      {item.brand && <span className="summary-brand-tag">{item.brand}</span>}
                    </div>
                  </div>

                  <div className="summary-item-price-col">
                    <div className="qty-control-inline">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item._id, (item.quantity || 1) - 1)}
                        className="qty-btn-mini"
                        title="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="qty-val-mini">{item.quantity || 1}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item._id, (item.quantity || 1) + 1)}
                        className="qty-btn-mini"
                        title="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <span className="item-price">Rs. {(item.price || 0) * (item.quantity || 1)}</span>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item._id)}
                      className="remove-from-summary-btn"
                      title="Remove item"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pricing breakdown list */}
            <div className="summary-pricing-breakdown">
              <div className="price-row">
                <span>Items Subtotal</span>
                <span>Rs. {subtotal}</span>
              </div>

              <div className="price-row">
                <span className="label-with-hint">
                  Thrift Shipping
                  {shippingFee === 0 && <span className="free-badge">FREE</span>}
                </span>
                <span>{shippingFee === 0 ? "Rs. 0" : `Rs. ${shippingFee}`}</span>
              </div>

              <div className="price-row">
                <span>Platform & Quality Fee</span>
                <span className="free-badge">FREE</span>
              </div>

              <div className="total-divider"></div>

              <div className="grand-total-row">
                <span>Total Amount</span>
                <span className="grand-total-val">Rs. {grandTotal}</span>
              </div>
            </div>

            {/* Confidence assurance tiles */}
            <div className="confidence-badges-list">
              <div className="badge-item">
                <Truck size={16} />
                <span>Fast carbon-neutral shipping nationwide</span>
              </div>
              <div className="badge-item">
                <ShieldCheck size={16} />
                <span>Verified second-hand quality checked</span>
              </div>
              <div className="badge-item">
                <Tag size={16} />
                <span>Direct circular fashion sustainability</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
