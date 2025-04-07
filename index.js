const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
// Use PORT from environment variables (Railway sets this)
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Create a simple model
const Item = mongoose.model(
  "Item",
  new mongoose.Schema({
    name: String,
    description: String,
    date: { type: Date, default: Date.now },
  })
);

// Test route to verify server is running
app.get("/", (req, res) => {
  res.send("API is running");
});

// API Routes
app.get("/api/items", async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/items", async (req, res) => {
  const newItem = new Item(req.body);
  try {
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get("/test", (req, res) => {
  res.json({ message: "Test route is working" });
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
