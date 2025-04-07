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
  .connect(process.env.MONGODB_URI, {
    connectTimeoutMS: 30000, // 30 seconds
    socketTimeoutMS: 45000, // 45 seconds
    serverSelectionTimeoutMS: 30000, // 30 seconds
  })
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
    // Check connection status before attempting query
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({
        message: "Database not connected",
        readyState: mongoose.connection.readyState,
      });
    }

    const items = await Item.find();
    res.json(items);
  } catch (err) {
    console.error("Detailed error:", err);
    res.status(500).json({
      message: err.message,
      code: err.code,
      name: err.name,
    });
  }
});

app.get("/test", (req, res) => {
  res.json({ message: "Test route is working" });
});

app.get("/test2", (req, res) => {
  res.json({ message: "Test route is working" });
});

app.get("/test-db", async (req, res) => {
  try {
    const connectionState = mongoose.connection.readyState;
    let status;

    switch (connectionState) {
      case 0:
        status = "disconnected";
        break;
      case 1:
        status = "connected";
        break;
      case 2:
        status = "connecting";
        break;
      case 3:
        status = "disconnecting";
        break;
      default:
        status = "unknown";
    }

    // Get environment variable (hide credentials)
    const mongoUriRedacted = process.env.MONGODB_URI
      ? process.env.MONGODB_URI.replace(/:\/\/([^:]+):([^@]+)@/, "://***:***@")
      : "Not set";

    res.json({
      mongoDbStatus: status,
      connectionState: connectionState,
      mongoUriPresent: !!process.env.MONGODB_URI,
      mongoUriRedacted: mongoUriRedacted,
      host: mongoose.connection.host || "Not connected",
      database: mongoose.connection.name || "Not connected",
      error: mongoose.connection.error
        ? mongoose.connection.error.message
        : "No error",
    });
  } catch (err) {
    console.error("Database test error:", err);
    res.status(500).json({
      error: err.message,
      stack: err.stack,
    });
  }
});

// Add a test route that tries to create an item
app.get("/create-test-item", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({
        message: "Database not connected",
        readyState: mongoose.connection.readyState,
      });
    }

    const testItem = new Item({
      name: "Test Item " + Date.now(),
      description: "Created as a test at " + new Date().toISOString(),
    });

    const result = await testItem.save();
    res.json({
      message: "Test item created successfully",
      item: result,
    });
  } catch (err) {
    console.error("Create test item error:", err);
    res.status(500).json({
      message: err.message,
      code: err.code,
      name: err.name,
    });
  }
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
