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

    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ClothingItem", clothingItemSchema);