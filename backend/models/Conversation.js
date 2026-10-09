const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: String,
      required: true,
    },
    senderName: {
      type: String,
      required: true,
    },
    senderAvatar: {
      type: String,
      default: "",
    },
    text: {
      type: String,
      default: "",
    },
    offerPrice: {
      type: Number,
      default: null,
    },
    offerStatus: {
      type: String,
      enum: ["none", "pending", "accepted", "declined"],
      default: "none",
    },
    read: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const conversationSchema = new mongoose.Schema(
  {
    buyerId: {
      type: String,
      required: true,
      index: true,
    },
    buyerName: {
      type: String,
      required: true,
    },
    buyerHandle: {
      type: String,
      default: "buyer",
    },
    buyerAvatar: {
      type: String,
      default: "",
    },
    sellerId: {
      type: String,
      required: true,
      index: true,
    },
    sellerName: {
      type: String,
      required: true,
    },
    sellerHandle: {
      type: String,
      default: "seller",
    },
    sellerAvatar: {
      type: String,
      default: "",
    },
    itemId: {
      type: String,
      required: true,
      index: true,
    },
    itemName: {
      type: String,
      required: true,
    },
    itemImage: {
      type: String,
      default: "",
    },
    itemPrice: {
      type: Number,
      default: 0,
    },
    itemOriginalPrice: {
      type: Number,
      default: 0,
    },
    itemBrand: {
      type: String,
      default: "",
    },
    itemSize: {
      type: String,
      default: "Standard",
    },
    itemStatus: {
      type: String,
      default: "Available",
    },
    messages: [messageSchema],
    lastMessage: {
      type: String,
      default: "",
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    unreadBuyer: {
      type: Number,
      default: 0,
    },
    unreadSeller: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to quickly find chat for a specific item between buyer and seller
conversationSchema.index({ buyerId: 1, sellerId: 1, itemId: 1 });
conversationSchema.index({ lastMessageAt: -1 });

module.exports = mongoose.model("Conversation", conversationSchema);
