const mongoose = require("mongoose");

const GuestSchema = new mongoose.Schema({
  deviceId: { type: String, required: true, unique: true },
  freeCaptionCount: { type: Number, default: 0 },
});

module.exports = mongoose.model("Guest", GuestSchema);
