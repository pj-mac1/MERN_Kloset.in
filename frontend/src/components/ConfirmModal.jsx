import React, { useEffect } from "react";
import { Trash2, X } from "lucide-react";

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Remove Piece from Closet?",
  message = "Are you sure you want to remove this piece from your closet? This action cannot be undone.",
  item = null,
  confirmText = "Yes, Remove Piece",
  cancelText = "Keep in Closet",
  loading = false,
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="custom-confirm-overlay" onClick={onClose}>
      <div
        className="custom-confirm-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        <button
          type="button"
          className="confirm-close-btn"
          onClick={onClose}
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        <div className="confirm-icon-wrapper">
          <div className="confirm-icon-circle">
            <Trash2 size={24} />
          </div>
        </div>

        <h3 id="confirm-modal-title" className="confirm-modal-title">{title}</h3>
        <p className="confirm-modal-message">{message}</p>

        {item && (
          <div className="confirm-item-preview">
            <img
              src={
                item.enhancedImage ||
                item.image ||
                "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=200"
              }
              alt={item.name}
              className="confirm-item-thumb"
            />
            <div className="confirm-item-details">
              <span className="confirm-item-badge">
                {item.category || "Garment"} {item.brand ? `• ${item.brand}` : ""}
              </span>
              <h4 className="confirm-item-heading">{item.name}</h4>
              <p className="confirm-item-subtext">
                {item.color ? `Color: ${item.color}` : ""}
                {item.size ? ` • Size: ${item.size}` : ""}
                {item.condition ? ` • ${item.condition}` : ""}
              </p>
            </div>
          </div>
        )}

        <div className="confirm-modal-actions">
          <button
            type="button"
            className="button button-secondary confirm-cancel-btn"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className="button confirm-delete-btn"
            onClick={onConfirm}
            disabled={loading}
          >
            <Trash2 size={16} />
            <span>{loading ? "Removing..." : confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
