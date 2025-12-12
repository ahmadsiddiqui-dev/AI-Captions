const mongoose = require("mongoose");

const SubscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isSubscribed: { type: Boolean, default: false },

    freeTrialEnabled: { type: Boolean, default: false },
    freeTrialUsed: { type: Boolean, default: false },

    freeTrialStart: { type: Date },
    freeTrialEnd: { type: Date },

    productId: { type: String }, 

    purchaseDate: { type: Date },
    expiryDate: { type: Date },

    freeCaptionCount: {
      type: Number,
      default: 0,
    },

    
    transactionId: { type: String },     // Google Play transaction ID
    purchaseToken: { type: String },     // Google token used for renewal verification
    autoRenew: { type: Boolean, default: true }, // Google auto-renew flag
    platform: { type: String, default: "google_play" }, // Always store platform
    cancelled: { type: Boolean, default: false }, // If user canceled but subscription is active until expiry

  },
  { timestamps: true }
);

module.exports = mongoose.model("Subscription", SubscriptionSchema);
