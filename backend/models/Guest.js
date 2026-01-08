const mongoose = require("mongoose");

const GuestSchema = new mongoose.Schema({
  deviceId: { type: String, required: true, unique: true },
  freeCaptionCount: { type: Number, default: 0 },

  mergedIntoUser: { type: Boolean, default: false },
  mergedUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});

module.exports = mongoose.model("Guest", GuestSchema);
