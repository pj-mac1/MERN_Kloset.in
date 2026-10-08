const mongoose = require("mongoose");

const outfitSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      default: "u_default",
    },
    creatorHandle: {
      type: String,
      default: "maya_style",
    },
    creatorName: {
      type: String,
      default: "Maya Lin",
    },
    creatorAvatar: {
      type: String,
      default: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    occasion: {
      type: String,
      enum: [
        "All",
        "College",
        "Casual",
        "Formal",
        "Streetwear",
        "Party",
        "Date Night",
        "Athleisure",
      ],
      default: "Casual",
    },
    items: {
      top: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ClothingItem",
      },
      bottom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ClothingItem",
      },
      shoes: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ClothingItem",
      },
      accessory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ClothingItem",
      },
    },
    styleScore: {
      type: Number,
      default: 95,
    },
    styleNotes: {
      type: String,
      default: "",
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    likes: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Outfit", outfitSchema);
