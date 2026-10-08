const mongoose = require("mongoose");

const clothingItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Tops",
        "Bottoms",
        "Dresses",
        "Outerwear",
        "Shoes",
        "Accessories",
      ],
    },
    color: {
      type: String,
      required: true,
      trim: true,
    },
    brand: {
      type: String,
      default: "",
    },
    size: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    enhancedImage: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    userId: {
      type: String,
      default: "u_default",
    },
    sellerName: {
      type: String,
      default: "Maya Lin",
    },
    sellerHandle: {
      type: String,
      default: "maya_style",
    },
    sellerAvatar: {
      type: String,
      default: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
    sellerPhone: {
      type: String,
      default: "",
    },
    sellerEmail: {
      type: String,
      default: "",
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    isForSale: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      default: 0,
    },
    originalPrice: {
      type: Number,
      default: 0,
    },
    isCustomized: {
      type: Boolean,
      default: false,
    },
    condition: {
      type: String,
      enum: [
        "Brand New with Tags",
        "Like New",
        "Gently Used",
        "Customized / Upcycled",
        "Vintage Thrifted",
      ],
      default: "Like New",
    },
    tags: {
      type: [String],
      default: [],
    },
    likes: {
      type: [String],
      default: [],
    },
    saves: {
      type: [String],
      default: [],
    },
    comments: [
      {
        userId: String,
        username: String,
        avatar: String,
        text: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    status: {
      type: String,
      enum: ["Available", "Sold", "Reserved"],
      default: "Available",
    },
    aiAnalysis: {
      detectedCategory: String,
      dominantColors: [String],
      confidence: Number,
      styleTags: [String],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ClothingItem", clothingItemSchema);