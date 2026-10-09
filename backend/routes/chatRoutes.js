const express = require("express");
const Conversation = require("../models/Conversation");
const ClothingItem = require("../models/ClothingItem");

const router = express.Router();

// Helper to determine if a seller is an automated/curated platform account
function isAutomatedSeller(sellerHandle = "", sellerId = "") {
  const handle = (sellerHandle || "").toLowerCase();
  const id = (sellerId || "").toLowerCase();
  return (
    handle.includes("kloset") ||
    handle.includes("curated") ||
    handle.includes("vault") ||
    handle.includes("maya") ||
    id.startsWith("u_") ||
    id === "kloset_admin" ||
    id === "system"
  );
}

// Generate an intelligent thrift seller reply
function generateSellerResponse(text = "", offerPrice = null, item = {}) {
  const lower = text.toLowerCase();
  const itemName = item.name || "piece";
  const itemPrice = item.price || 1000;
  const brand = item.brand || "vintage";

  if (offerPrice && Number(offerPrice) > 0) {
    const offer = Number(offerPrice);
    if (offer >= itemPrice * 0.8) {
      return {
        text: `Thanks for the offer! ₹${offer.toLocaleString("en-IN")} works for me. That's a great price for this ${brand} ${itemName}! You can add it to your bag or checkout whenever you're ready 🏷️✨`,
        accepted: true,
      };
    } else {
      const counter = Math.round((itemPrice * 0.9) / 50) * 50;
      return {
        text: `Thanks for checking it out! ₹${offer.toLocaleString("en-IN")} is a bit low for this authentic ${brand} garment, but I could meet you in the middle at ₹${counter.toLocaleString("en-IN")}. What do you think? 🤝`,
        accepted: false,
      };
    }
  }

  if (lower.includes("available") || lower.includes("still have") || lower.includes("in stock")) {
    return {
      text: `Hey! Yes, this ${itemName} is 100% available and ready to ship within 24 hours. Let me know if you have any questions! 📦`,
    };
  }

  if (lower.includes("fit") || lower.includes("size") || lower.includes("measure")) {
    return {
      text: `It fits true to size (${item.size || "Standard"}). The drape and silhouette look really clean in person. Let me know if you need specific chest or length measurements! 📏`,
    };
  }

  if (lower.includes("discount") || lower.includes("lowest") || lower.includes("less") || lower.includes("deal")) {
    return {
      text: `I'm open to reasonable negotiations! Feel free to hit the "Make Offer" button with your best price and we can work something out 💸`,
    };
  }

  if (lower.includes("condition") || lower.includes("flaw") || lower.includes("stain") || lower.includes("damage")) {
    return {
      text: `No flaws, rips, or stains! It has been dry-cleaned and steam-sanitized before packing. Great fabric texture and quality ✨`,
    };
  }

  if (lower.includes("ship") || lower.includes("delivery") || lower.includes("courier")) {
    return {
      text: `I ship standard express with tracked delivery across India. Usually reaches within 2-4 business days! 🚚`,
    };
  }

  return {
    text: `Hey there! Thanks for your interest in my ${itemName}. It's one of my favorite thrift finds. Let me know if you want to make an offer or have any other questions! 🌿`,
  };
}

// 1. START OR GET CONVERSATION
router.post("/start", async (req, res) => {
  try {
    const {
      buyerId,
      buyerName,
      buyerHandle,
      buyerAvatar,
      sellerId,
      sellerName,
      sellerHandle,
      sellerAvatar,
      itemId,
      itemName,
      itemImage,
      itemPrice,
      itemOriginalPrice,
      itemBrand,
      itemSize,
      initialMessage,
      offerPrice,
    } = req.body;

    if (!buyerId || !sellerId || !itemId) {
      return res.status(400).json({ message: "buyerId, sellerId, and itemId are required." });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      buyerId,
      sellerId,
      itemId,
    });

    if (!conversation) {
      conversation = new Conversation({
        buyerId,
        buyerName: buyerName || "Buyer",
        buyerHandle: buyerHandle || "buyer",
        buyerAvatar: buyerAvatar || "",
        sellerId,
        sellerName: sellerName || "Seller",
        sellerHandle: sellerHandle || "seller",
        sellerAvatar: sellerAvatar || "",
        itemId,
        itemName: itemName || "Garment",
        itemImage: itemImage || "",
        itemPrice: Number(itemPrice) || 0,
        itemOriginalPrice: Number(itemOriginalPrice) || 0,
        itemBrand: itemBrand || "",
        itemSize: itemSize || "Standard",
        messages: [],
      });
    } else {
      // Update item details if changed
      if (itemPrice !== undefined) conversation.itemPrice = Number(itemPrice);
      if (itemOriginalPrice !== undefined) conversation.itemOriginalPrice = Number(itemOriginalPrice);
      if (itemName) conversation.itemName = itemName;
      if (itemImage) conversation.itemImage = itemImage;
    }

    // If an initial message or offer was provided
    if (initialMessage || offerPrice) {
      const msg = {
        senderId: buyerId,
        senderName: buyerName || "Buyer",
        senderAvatar: buyerAvatar || "",
        text: initialMessage || (offerPrice ? `Submitted an offer of ₹${Number(offerPrice).toLocaleString("en-IN")}` : ""),
        offerPrice: offerPrice ? Number(offerPrice) : null,
        offerStatus: offerPrice ? "pending" : "none",
        createdAt: new Date(),
        read: false,
      };

      conversation.messages.push(msg);
      conversation.lastMessage = msg.text;
      conversation.lastMessageAt = new Date();
      conversation.unreadSeller += 1;

      // Check for automated seller reply if seller is automated or self-bot
      if (isAutomatedSeller(sellerHandle, sellerId) || sellerId !== buyerId) {
        const auto = generateSellerResponse(initialMessage, offerPrice, {
          name: conversation.itemName,
          price: conversation.itemPrice,
          brand: conversation.itemBrand,
          size: conversation.itemSize,
        });

        const sellerReplyMsg = {
          senderId: sellerId,
          senderName: sellerName || "Seller",
          senderAvatar: sellerAvatar || "",
          text: auto.text,
          offerPrice: null,
          offerStatus: "none",
          createdAt: new Date(Date.now() + 1000),
          read: false,
        };

        if (auto.accepted && offerPrice) {
          // Mark the buyer's offer as accepted
          conversation.messages[conversation.messages.length - 1].offerStatus = "accepted";
        }

        conversation.messages.push(sellerReplyMsg);
        conversation.lastMessage = sellerReplyMsg.text;
        conversation.lastMessageAt = sellerReplyMsg.createdAt;
        conversation.unreadBuyer += 1;
      }
    }

    const saved = await conversation.save();
    res.status(200).json(saved);
  } catch (error) {
    console.error("Error starting conversation:", error);
    res.status(500).json({ message: "Failed to start conversation", error: error.message });
  }
});

// 2. GET ALL CONVERSATIONS FOR A USER (as buyer or seller)
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: "userId parameter required" });
    }

    const conversations = await Conversation.find({
      $or: [{ buyerId: userId }, { sellerId: userId }],
    }).sort({ lastMessageAt: -1 });

    res.status(200).json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ message: "Failed to fetch conversations", error: error.message });
  }
});

// 3. GET SPECIFIC CONVERSATION
router.get("/:id", async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }
    res.status(200).json(conversation);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch conversation", error: error.message });
  }
});

// 4. SEND A MESSAGE IN AN EXISTING CONVERSATION
router.post("/:id/message", async (req, res) => {
  try {
    const { senderId, senderName, senderAvatar, text, offerPrice } = req.body;
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    if (!text && !offerPrice) {
      return res.status(400).json({ message: "Message text or offerPrice is required" });
    }

    const isOffer = offerPrice && Number(offerPrice) > 0;
    const msgText = text || (isOffer ? `Submitted an offer of ₹${Number(offerPrice).toLocaleString("en-IN")}` : "");

    const newMsg = {
      senderId,
      senderName: senderName || "Member",
      senderAvatar: senderAvatar || "",
      text: msgText,
      offerPrice: isOffer ? Number(offerPrice) : null,
      offerStatus: isOffer ? "pending" : "none",
      createdAt: new Date(),
      read: false,
    };

    conversation.messages.push(newMsg);
    conversation.lastMessage = msgText;
    conversation.lastMessageAt = new Date();

    const isBuyerSending = senderId === conversation.buyerId;
    if (isBuyerSending) {
      conversation.unreadSeller += 1;
    } else {
      conversation.unreadBuyer += 1;
    }

    // Auto-reply simulation if buyer messages an automated/curated seller
    const isAutomated = isAutomatedSeller(conversation.sellerHandle, conversation.sellerId);
    if (isBuyerSending && isAutomated) {
      const auto = generateSellerResponse(text, offerPrice, {
        name: conversation.itemName,
        price: conversation.itemPrice,
        brand: conversation.itemBrand,
        size: conversation.itemSize,
      });

      const replyMsg = {
        senderId: conversation.sellerId,
        senderName: conversation.sellerName,
        senderAvatar: conversation.sellerAvatar,
        text: auto.text,
        offerPrice: null,
        offerStatus: "none",
        createdAt: new Date(Date.now() + 1000),
        read: false,
      };

      if (auto.accepted && isOffer) {
        // Mark the buyer's offer as accepted
        conversation.messages[conversation.messages.length - 1].offerStatus = "accepted";
      }

      conversation.messages.push(replyMsg);
      conversation.lastMessage = replyMsg.text;
      conversation.lastMessageAt = replyMsg.createdAt;
      conversation.unreadBuyer += 1;
    }

    const saved = await conversation.save();
    res.status(200).json(saved);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Failed to send message", error: error.message });
  }
});

// 5. ACCEPT OR DECLINE AN OFFER
router.patch("/:id/offer", async (req, res) => {
  try {
    const { messageId, action, senderId, senderName } = req.body;
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const msg = conversation.messages.id(messageId);
    if (!msg) {
      return res.status(404).json({ message: "Offer message not found" });
    }

    if (action === "accept") {
      msg.offerStatus = "accepted";
      // Add a system announcement message
      conversation.messages.push({
        senderId: senderId || conversation.sellerId,
        senderName: senderName || conversation.sellerName,
        senderAvatar: conversation.sellerAvatar,
        text: `🎉 Offer of ₹${Number(msg.offerPrice).toLocaleString("en-IN")} has been ACCEPTED! The buyer can now claim or add this garment to bag at the agreed price.`,
        offerPrice: null,
        offerStatus: "none",
        createdAt: new Date(),
        read: false,
      });
      conversation.lastMessage = `🎉 Offer of ₹${Number(msg.offerPrice).toLocaleString("en-IN")} accepted!`;
    } else if (action === "decline") {
      msg.offerStatus = "declined";
      conversation.messages.push({
        senderId: senderId || conversation.sellerId,
        senderName: senderName || conversation.sellerName,
        senderAvatar: conversation.sellerAvatar,
        text: `Declined offer of ₹${Number(msg.offerPrice).toLocaleString("en-IN")}. Feel free to submit another counter offer!`,
        offerPrice: null,
        offerStatus: "none",
        createdAt: new Date(),
        read: false,
      });
      conversation.lastMessage = `Offer declined.`;
    }

    conversation.lastMessageAt = new Date();
    const saved = await conversation.save();
    res.status(200).json(saved);
  } catch (error) {
    res.status(500).json({ message: "Failed to update offer", error: error.message });
  }
});

// 6. MARK MESSAGES AS READ
router.patch("/:id/read", async (req, res) => {
  try {
    const { userId } = req.body;
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    if (userId === conversation.buyerId) {
      conversation.unreadBuyer = 0;
    } else if (userId === conversation.sellerId) {
      conversation.unreadSeller = 0;
    }

    conversation.messages.forEach((m) => {
      if (m.senderId !== userId) {
        m.read = true;
      }
    });

    const saved = await conversation.save();
    res.status(200).json(saved);
  } catch (error) {
    res.status(500).json({ message: "Failed to mark as read", error: error.message });
  }
});

module.exports = router;
