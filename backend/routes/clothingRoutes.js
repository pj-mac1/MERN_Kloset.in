const express = require("express");
const ClothingItem = require("../models/ClothingItem");

const router = express.Router();

// GET all clothing items with powerful filtering
router.get("/", async (req, res) => {
  try {
    const {
      userId,
      isPublic,
      isForSale,
      category,
      tag,
      isCustomized,
      condition,
      status,
      search,
      sort,
    } = req.query;

    const filter = {};

    if (userId) {
      filter.userId = userId;
    }

    if (isPublic !== undefined) {
      filter.isPublic = isPublic === "true";
    }

    if (isForSale !== undefined) {
      filter.isForSale = isForSale === "true";
    }

    if (category && category !== "All") {
      filter.category = category;
    }

    if (condition && condition !== "All") {
      filter.condition = condition;
    }

    if (tag && tag !== "All") {
      filter.tags = { $in: [new RegExp(tag, "i")] };
    }

    if (isCustomized !== undefined) {
      filter.isCustomized = isCustomized === "true";
    }

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { color: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    let sortOptions = { createdAt: -1 };
    if (sort === "price_asc") sortOptions = { price: 1 };
    else if (sort === "price_desc") sortOptions = { price: -1 };
    else if (sort === "popular") sortOptions = { "likes.length": -1, createdAt: -1 };

    const clothes = await ClothingItem.find(filter).sort(sortOptions);
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

// TOGGLE list for sale / public vs private closet
router.patch("/:id/toggle-sale", async (req, res) => {
  try {
    const item = await ClothingItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Clothing item not found" });
    }

    const { isForSale, price, originalPrice, condition, isCustomized } = req.body;
    item.isForSale = isForSale !== undefined ? isForSale : !item.isForSale;
    item.isPublic = item.isForSale ? true : (req.body.isPublic ?? false);
    if (price !== undefined && price !== null && price !== "") {
      item.price = Number(price);
    }
    if (originalPrice !== undefined && originalPrice !== null && originalPrice !== "") {
      item.originalPrice = Number(originalPrice);
    }
    if (condition) item.condition = condition;
    if (isCustomized !== undefined) item.isCustomized = Boolean(isCustomized);

    const saved = await item.save();
    res.status(200).json(saved);
  } catch (error) {
    res.status(500).json({ message: "Failed to toggle sale status", error: error.message });
  }
});

// LIKE / UNLIKE an item
router.post("/:id/like", async (req, res) => {
  try {
    const { userId = "u_default" } = req.body;
    const item = await ClothingItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Clothing item not found" });
    }

    const index = item.likes.indexOf(userId);
    let liked = false;
    if (index === -1) {
      item.likes.push(userId);
      liked = true;
    } else {
      item.likes.splice(index, 1);
      liked = false;
    }

    await item.save();
    res.status(200).json({ liked, likesCount: item.likes.length, likes: item.likes });
  } catch (error) {
    res.status(500).json({ message: "Failed to update like", error: error.message });
  }
});

// ADD COMMENT to an item
router.post("/:id/comment", async (req, res) => {
  try {
    const {
      userId = "u_default",
      username = "Guest",
      avatar = "",
      text,
    } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const item = await ClothingItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Clothing item not found" });
    }

    const newComment = {
      userId,
      username,
      avatar: avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      text: text.trim(),
      createdAt: new Date(),
    };

    item.comments.push(newComment);
    await item.save();

    res.status(201).json(item.comments);
  } catch (error) {
    res.status(500).json({ message: "Failed to post comment", error: error.message });
  }
});

// DELETE a clothing item
router.delete("/:id", async (req, res) => {
  try {
    const deletedItem = await ClothingItem.findByIdAndDelete(req.params.id);

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

module.exports = router;