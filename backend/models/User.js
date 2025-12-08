const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true,
    },

    email: { 
      type: String, 
      required: true, 
      unique: true 
    },

    password: {
      type: String,
      required: function () {
        // Password required ONLY if not using Google
        return this.provider !== "google";
      },
      default: null,
    },

    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

    googleId: {
      type: String,
      default: null,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
