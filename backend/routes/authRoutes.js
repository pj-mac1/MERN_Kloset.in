const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "kloset_secret_key_2026";

// Helper to generate a clean handle
function generateHandle(name) {
  const base = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  const randomNum = Math.floor(100 + Math.random() * 900);
  return `${base || "thrift"}_${randomNum}`;
}

// Generate random avatar based on name initials / dicebear or stylish unsplash
function getAvatar(name) {
  const encoded = encodeURIComponent(name);
  return `https://api.dicebear.com/7.x/adventurer/svg?seed=${encoded}&backgroundColor=ffd5dc,ffdfbf,d1d4f9,c0aede,b6e3f4`;
}

// REGISTER USER
router.post("/register", async (req, res) => {
  try {
    const {
      name,
      registrationMethod = "gmail",
      email,
      phone,
      password,
      location = "Thrift Community",
      bio = "Thrift enthusiast & sustainable fashion lover 🌿",
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Full Name is required" });
    }

    if (!password || password.length < 4) {
      return res.status(400).json({ message: "Password must be at least 4 characters long" });
    }

    // Validation based on registration method
    const method = (registrationMethod || "").toLowerCase();
    let sanitizedEmail = email ? email.trim().toLowerCase() : undefined;
    let sanitizedPhone = phone ? phone.trim().replace(/[\s\-\(\)]/g, "") : undefined;

    if (method === "phone") {
      if (!sanitizedPhone) {
        return res.status(400).json({ message: "Phone number is required for phone registration" });
      }
      // Check if phone already registered
      const existingPhone = await User.findOne({
        $or: [{ phone: sanitizedPhone }, { phone: phone.trim() }],
      });
      if (existingPhone) {
        return res.status(400).json({ message: "This phone number is already registered. Please sign in." });
      }
    } else {
      // Default to email/gmail
      if (!sanitizedEmail) {
        return res.status(400).json({ message: "Gmail / Email address is required" });
      }
      // Check if email already registered
      const existingEmail = await User.findOne({ email: sanitizedEmail });
      if (existingEmail) {
        return res.status(400).json({ message: "This Gmail/email is already registered. Please sign in." });
      }
    }

    // Auto-generate unique handle
    let handle = req.body.handle ? req.body.handle.replace(/^@/, "").trim() : generateHandle(name);
    let handleExists = await User.findOne({ handle });
    while (handleExists) {
      handle = generateHandle(name);
      handleExists = await User.findOne({ handle });
    }

    // Avatar
    const avatar = req.body.avatar || getAvatar(name);

    const newUser = new User({
      name: name.trim(),
      registrationMethod: method === "phone" ? "phone" : "gmail",
      email: sanitizedEmail,
      phone: sanitizedPhone,
      password,
      handle,
      avatar,
      bio,
      location,
    });

    const savedUser = await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: savedUser._id, handle: savedUser.handle },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    const userResponse = {
      id: savedUser._id.toString(),
      _id: savedUser._id.toString(),
      name: savedUser.name,
      email: savedUser.email || "",
      phone: savedUser.phone || "",
      registrationMethod: savedUser.registrationMethod || (savedUser.email ? "gmail" : "phone"),
      handle: savedUser.handle,
      avatar: savedUser.avatar,
      bio: savedUser.bio,
      location: savedUser.location,
      followers: savedUser.followers || 0,
      following: savedUser.following || 0,
    };

    res.status(201).json({
      success: true,
      message: `Account created successfully for ${savedUser.name}!`,
      user: userResponse,
      token,
    });
  } catch (error) {
    console.error("Register error:", error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || "credential";
      return res.status(400).json({
        message: `An account with this ${field} is already registered. Please sign in instead.`,
      });
    }
    res.status(500).json({
      message: error.message || "Registration failed",
      error: error.message,
    });
  }
});

// LOGIN USER (by Gmail or Phone)
router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !identifier.trim()) {
      return res.status(400).json({ message: "Please provide your Gmail or Phone number" });
    }
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const cleanIdentifier = identifier.trim();
    const normalizedPhone = cleanIdentifier.replace(/[\s\-\(\)]/g, "");

    // Search by email OR phone OR handle
    const user = await User.findOne({
      $or: [
        { email: cleanIdentifier.toLowerCase() },
        { phone: cleanIdentifier },
        { phone: normalizedPhone },
        { handle: cleanIdentifier.replace(/^@/, "") },
      ],
    });

    if (!user) {
      return res.status(404).json({
        message: "No account found with this Gmail, phone number, or handle",
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password. Please try again." });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, handle: user.handle },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    const userResponse = {
      id: user._id.toString(),
      _id: user._id.toString(),
      name: user.name,
      email: user.email || "",
      phone: user.phone || "",
      registrationMethod: user.registrationMethod || (user.email ? "gmail" : "phone"),
      handle: user.handle,
      avatar: user.avatar,
      bio: user.bio,
      location: user.location,
      followers: user.followers || 0,
      following: user.following || 0,
    };

    res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      user: userResponse,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: error.message || "Login failed",
      error: error.message,
    });
  }
});

// GET ALL USERS (for seller explore and switching)
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({}, "-password").sort({ createdAt: -1 });
    const formatted = users.map((u) => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email || "",
      phone: u.phone || "",
      registrationMethod: u.registrationMethod,
      handle: u.handle,
      avatar: u.avatar,
      bio: u.bio,
      location: u.location,
      followers: u.followers,
      following: u.following,
    }));
    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users", error: error.message });
  }
});

// GET USER BY ID
router.get("/me/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id, "-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({
      id: user._id.toString(),
      name: user.name,
      email: user.email || "",
      phone: user.phone || "",
      registrationMethod: user.registrationMethod,
      handle: user.handle,
      avatar: user.avatar,
      bio: user.bio,
      location: user.location,
      followers: user.followers,
      following: user.following,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user", error: error.message });
  }
});

module.exports = router;
