const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const clothingRoutes = require("./routes/clothingRoutes");

const app = express();

app.use(express.json());
app.use(cors());
app.use("/api/clothes", clothingRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully!"))
  .catch((err) => console.log("MongoDB connection failed:", err));

app.get("/api/test", (req, res) => {
  res.json({
    message: "Kloset backend is working!"
  });
});

app.listen(5001, () => {
  console.log("Kloset server running on http://localhost:5001");
});