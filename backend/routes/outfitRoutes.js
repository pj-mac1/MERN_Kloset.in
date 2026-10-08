const express = require("express");
const Outfit = require("../models/Outfit");

const router = express.Router();

// GET all outfits (optionally filter by user or public)
router.get("/", async (req, res) => {
  try {
    const { userId, occasion, isPublic } = req.query;
    const filter = {};

    if (userId) filter.userId = userId;
    if (occasion && occasion !== "All") filter.occasion = occasion;
    if (isPublic !== undefined) filter.isPublic = isPublic === "true";

    const outfits = await Outfit.find(filter)
      .populate("items.top")
      .populate("items.bottom")
      .populate("items.shoes")
      .populate("items.accessory")
      .sort({ createdAt: -1 });

    res.status(200).json(outfits);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch outfits",
      error: error.message,
    });
  }
});

// GET single outfit
router.get("/:id", async (req, res) => {
  try {
    const outfit = await Outfit.findById(req.params.id)
      .populate("items.top")
      .populate("items.bottom")
      .populate("items.shoes")
      .populate("items.accessory");

    if (!outfit) {
      return res.status(404).json({ message: "Outfit not found" });
    }

    res.status(200).json(outfit);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch outfit", error: error.message });
  }
});

// CREATE outfit
router.post("/", async (req, res) => {
  try {
    const outfit = new Outfit(req.body);
    const saved = await outfit.save();
    const populated = await Outfit.findById(saved._id)
      .populate("items.top")
      .populate("items.bottom")
      .populate("items.shoes")
      .populate("items.accessory");

    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({
      message: "Failed to save outfit",
      error: error.message,
    });
  }
});

// LIKE / UNLIKE outfit
router.post("/:id/like", async (req, res) => {
  try {
    const { userId = "u_default" } = req.body;
    const outfit = await Outfit.findById(req.params.id);

    if (!outfit) {
      return res.status(404).json({ message: "Outfit not found" });
    }

    const index = outfit.likes.indexOf(userId);
    let liked = false;
    if (index === -1) {
      outfit.likes.push(userId);
      liked = true;
    } else {
      outfit.likes.splice(index, 1);
      liked = false;
    }

    await outfit.save();
    res.status(200).json({ liked, likesCount: outfit.likes.length });
  } catch (error) {
    res.status(500).json({ message: "Failed to update like", error: error.message });
  }
});

// DELETE outfit
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Outfit.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Outfit not found" });
    }
    res.status(200).json({ message: "Outfit deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete outfit", error: error.message });
  }
});

module.exports = router;
