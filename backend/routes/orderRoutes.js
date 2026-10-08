const express = require("express");
const Order = require("../models/Order");
const ClothingItem = require("../models/ClothingItem");

const router = express.Router();

// CREATE a new order (Checkout)
router.post("/", async (req, res) => {
  try {
    const {
      buyerId = "u_default",
      buyerName = "Maya Lin",
      buyerHandle = "maya_style",
      items = [],
      shippingAddress = {},
      paymentMethod = "ThriftPay / Card",
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items provided in order" });
    }

    // Calculate total amount & identify seller
    let totalAmount = 0;
    let sellerId = "u_seller";
    let sellerName = "Thrift Creator";
    let sellerHandle = "creator_style";

    const itemSummaries = [];

    for (const item of items) {
      const dbItem = await ClothingItem.findById(item.itemId || item._id);
      if (!dbItem) {
        return res.status(404).json({ message: `Item ${item.name || "item"} not found` });
      }

      if (dbItem.status === "Sold") {
        return res.status(400).json({ message: `"${dbItem.name}" is already sold!` });
      }

      // Mark item as sold
      dbItem.status = "Sold";
      await dbItem.save();

      totalAmount += dbItem.price || 0;
      sellerId = dbItem.userId || sellerId;
      sellerName = dbItem.sellerName || sellerName;
      sellerHandle = dbItem.sellerHandle || sellerHandle;

      itemSummaries.push({
        itemId: dbItem._id,
        name: dbItem.name,
        category: dbItem.category,
        price: dbItem.price,
        image: dbItem.image || dbItem.enhancedImage,
        isCustomized: dbItem.isCustomized,
        condition: dbItem.condition,
      });
    }

    const newOrder = new Order({
      buyerId,
      buyerName,
      buyerHandle,
      sellerId,
      sellerName,
      sellerHandle,
      items: itemSummaries,
      totalAmount,
      shippingAddress,
      paymentMethod,
      status: "Confirmed",
    });

    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(500).json({
      message: "Order checkout failed",
      error: error.message,
    });
  }
});

// GET user orders (both purchases and sales)
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const purchases = await Order.find({ buyerId: userId }).sort({ createdAt: -1 });
    const sales = await Order.find({ sellerId: userId }).sort({ createdAt: -1 });

    const totalEarnings = sales.reduce((acc, order) => acc + (order.totalAmount || 0), 0);

    res.status(200).json({
      purchases,
      sales,
      totalEarnings,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch user orders",
      error: error.message,
    });
  }
});

module.exports = router;
