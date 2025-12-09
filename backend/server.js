const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");

// Initialize app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
connectDB();

// Test Route
app.get("/", (req, res) => {
  res.send("API Running");
});

// Import Routes
const authRoutes = require("./routes/auth");
const captionRoutes = require("./routes/caption");

// Use Routes
app.use("/api/auth", authRoutes);
app.use("/api/captions", captionRoutes);

// Start Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));


