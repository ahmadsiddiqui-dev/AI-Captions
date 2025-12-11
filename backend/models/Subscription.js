const mongoose = require("mongoose");

const SubscriptionSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true
  },

  isSubscribed: { 
    type: Boolean, 
    default: false 
  },

  freeTrialEnabled: { 
    type: Boolean, 
    default: false 
  },

  freeTrialUsed: { 
    type: Boolean, 
    default: false 
  },

  freeTrialStart: { type: Date },
  freeTrialEnd: { type: Date },

  productId: { type: String }, 
  purchaseDate: { type: Date },
  expiryDate: { type: Date },

  freeCaptionCount: {
    type: Number,
    default: 0,
  }

}, 
{ timestamps: true }
);

module.exports = mongoose.model("Subscription", SubscriptionSchema);
