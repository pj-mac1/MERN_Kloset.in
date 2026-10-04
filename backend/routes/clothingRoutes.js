const express = require("express");
const ClothingItem = require("../models/ClothingItem");

const router = express.Router();

// GET all clothing items
router.get("/", async (req, res) => {
  try {
    const clothes = await ClothingItem.find().sort({ createdAt: -1 });

    res.status(200).json(clothes);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch clothing items",
      error: error.message,
    });
  }
});

// GET one clothing item by ID
router.get("/:id", async (req, res) => {
  try {
    const clothingItem = await ClothingItem.findById(req.params.id);

    if (!clothingItem) {
      return res.status(404).json({
        message: "Clothing item not found",
      });
    }

    res.status(200).json(clothingItem);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch clothing item",
      error: error.message,
    });
  }
});

// ADD a new clothing item
router.post("/", async (req, res) => {
  try {
    const clothingItem = new ClothingItem(req.body);

    const savedItem = await clothingItem.save();

    res.status(201).json(savedItem);
  } catch (error) {
    res.status(400).json({
      message: "Failed to add clothing item",
      error: error.message,
    });
  }
});

// DELETE a clothing item
router.delete("/:id", async (req, res) => {
  try {
    const deletedItem = await ClothingItem.findByIdAndDelete(
      req.params.id
    );

    if (!deletedItem) {
      return res.status(404).json({
        message: "Clothing item not found",
      });
    }

    res.status(200).json({
      message: "Clothing item deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete clothing item",
      error: error.message,
    });
  }
});
// UPDATE a clothing item
router.put("/:id", async (req, res) => {
  try {
    const updatedItem = await ClothingItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedItem) {
      return res.status(404).json({
        message: "Clothing item not found",
      });
    }

    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(400).json({
      message: "Failed to update clothing item",
      error: error.message,
    });
  }
});

module.exports = router;