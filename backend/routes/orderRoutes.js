const express = require("express");
const Order = require("../models/Order");
const ClothingItem = require("../models/ClothingItem");

const router = express.Router();

const mongoose = require("mongoose");

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
      totalAmount: explicitTotal,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items provided in order" });
    }

    // Calculate total amount & identify sellers
    let calculatedTotal = 0;
    let sellerId = "u_seller";
    let sellerName = "Thrift Creator";
    let sellerHandle = "creator_style";

    const itemSummaries = [];

    for (const item of items) {
      const targetId = item.itemId || item._id;
      let dbItem = null;

      if (targetId) {
        try {
          if (mongoose.Types.ObjectId.isValid(targetId)) {
            dbItem = await ClothingItem.findById(targetId);
          }
        } catch (lookupErr) {
          console.warn("Item lookup warning:", lookupErr.message);
        }
      }

      const itemQty = Math.max(1, parseInt(item.quantity, 10) || 1);
      const itemPrice = Number(item.price) || (dbItem ? Number(dbItem.price) : 0) || 0;
      calculatedTotal += itemPrice * itemQty;

      if (dbItem) {
        // Mark item as sold upon purchase without rejecting the order
        dbItem.status = "Sold";
        await dbItem.save();

        sellerId = dbItem.userId || item.sellerId || sellerId;
        sellerName = dbItem.sellerName || item.sellerName || sellerName;
        sellerHandle = dbItem.sellerHandle || item.sellerHandle || sellerHandle;

        itemSummaries.push({
          itemId: dbItem._id,
          name: dbItem.name || item.name,
          category: dbItem.category || item.category,
          price: dbItem.price || itemPrice,
          quantity: itemQty,
          image: dbItem.image || dbItem.enhancedImage || item.image || "",
          isCustomized: dbItem.isCustomized ?? item.isCustomized ?? false,
          condition: dbItem.condition || item.condition || "Pre-loved",
          sellerId: dbItem.userId || sellerId,
          sellerName: dbItem.sellerName || sellerName,
          sellerHandle: dbItem.sellerHandle || sellerHandle,
        });
      } else {
        // Fallback for custom, reworked or demo clothes not found in MongoDB
        sellerId = item.sellerId || sellerId;
        sellerName = item.sellerName || sellerName;
        sellerHandle = item.sellerHandle || sellerHandle;

        itemSummaries.push({
          itemId: targetId,
          name: item.name || "Thrift Garment",
          category: item.category || "Apparel",
          price: itemPrice,
          quantity: itemQty,
          image: item.image || item.enhancedImage || "",
          isCustomized: !!item.isCustomized,
          condition: item.condition || "Pre-loved",
          sellerId: item.sellerId || sellerId,
          sellerName: item.sellerName || sellerName,
          sellerHandle: item.sellerHandle || sellerHandle,
        });
      }
    }

    const finalTotal = explicitTotal !== undefined && explicitTotal !== null ? Number(explicitTotal) : calculatedTotal;

    const newOrder = new Order({
      buyerId,
      buyerName,
      buyerHandle,
      sellerId,
      sellerName,
      sellerHandle,
      items: itemSummaries,
      totalAmount: finalTotal,
      shippingAddress,
      paymentMethod,
      status: "Confirmed",
    });

    const savedOrder = await newOrder.save();

    // Return order object supporting both data._id and data.order
    res.status(201).json({
      ...savedOrder.toObject(),
      order: savedOrder,
    });
  } catch (error) {
    console.error("Order processing error:", error);
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
