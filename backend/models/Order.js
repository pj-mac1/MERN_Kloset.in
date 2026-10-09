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
      default: "u_seller",
    },
    sellerHandle: {
      type: String,
      default: "creator_style",
    },
    sellerName: {
      type: String,
      default: "Thrift Creator",
    },
    items: [
      {
        itemId: {
          type: mongoose.Schema.Types.Mixed,
        },
        name: String,
        category: String,
        price: Number,
        quantity: {
          type: Number,
          default: 1,
        },
        image: String,
        isCustomized: Boolean,
        condition: String,
        sellerId: String,
        sellerHandle: String,
        sellerName: String,
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    shippingAddress: {
      fullName: String,
      recipientName: String,
      phone: String,
      email: String,
      street: String,
      addressLine: String,
      city: String,
      state: String,
      postalCode: String,
      pincode: String,
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
    strict: false,
  }
);

module.exports = mongoose.model("Order", orderSchema);
