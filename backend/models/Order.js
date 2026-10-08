const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    buyerId: {
      type: String,
      required: true,
    },
    buyerName: {
      type: String,
      required: true,
    },
    buyerHandle: {
      type: String,
      default: "",
    },
    sellerId: {
      type: String,
      required: true,
    },
    sellerHandle: {
      type: String,
      required: true,
    },
    sellerName: {
      type: String,
      required: true,
    },
    items: [
      {
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "ClothingItem",
        },
        name: String,
        category: String,
        price: Number,
        image: String,
        isCustomized: Boolean,
        condition: String,
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    shippingAddress: {
      fullName: String,
      street: String,
      city: String,
      postalCode: String,
      country: String,
    },
    paymentMethod: {
      type: String,
      default: "ThriftPay / Card",
    },
    status: {
      type: String,
      enum: ["Confirmed", "Shipped", "Delivered"],
      default: "Confirmed",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);
