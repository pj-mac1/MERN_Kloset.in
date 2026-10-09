const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const clothingRoutes = require("./routes/clothingRoutes");
const outfitRoutes = require("./routes/outfitRoutes");
const orderRoutes = require("./routes/orderRoutes");
const aiRoutes = require("./routes/aiRoutes");
const seedRoutes = require("./routes/seedRoutes");
const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// API Routes
app.use("/api/clothes", clothingRoutes);
app.use("/api/outfits", outfitRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/seed", seedRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully!"))
  .catch((err) => console.log("MongoDB connection failed:", err));

app.get("/api/test", (req, res) => {
  res.json({
    message: "Kloset backend is working!",
    timestamp: new Date(),
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Kloset server running on http://localhost:${PORT}`);
});