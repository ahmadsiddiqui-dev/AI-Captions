const express = require("express");
const router = express.Router();
const {
  startPlanAndTrial,
  verifyPurchase,
  getSubscriptionStatus
} = require("../controllers/subscriptionController");
const auth = require("../middleware/auth");
const checkSubscription = require("../middleware/checkSubscription");

// Start plan + enable trial (requires login)
router.post("/start-trial", auth, startPlanAndTrial);

// Verify Google Play purchase after checkout
router.post("/verify", auth, verifyPurchase);

// Get trial/subscription status on app launch
router.get("/status", auth, checkSubscription, getSubscriptionStatus);

module.exports = router;
