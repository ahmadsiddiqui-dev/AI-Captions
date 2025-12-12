const Subscription = require("../models/Subscription");

module.exports = async function (req, res, next) {
  try {
    const sub = await Subscription.findOne({ userId: req.user._id });

    // No subscription exists → return defaults
    if (!sub) {
      req.subscription = {
        isSubscribed: false,
        freeTrialEnabled: false,
        freeTrialUsed: false,
        freeCaptionCount: 0,
        trialEnds: null,
        expiryDate: null,
        productId: null
      };
      return next();
    }

    const now = new Date();

    // Check if subscription is active (expiry date must be in future)
    const isActiveSub =
      sub.isSubscribed &&
      sub.expiryDate &&
      new Date(sub.expiryDate) > now;

    // Check if trial is active
    const trialActive =
      sub.freeTrialEnabled &&
      sub.freeTrialEnd &&
      new Date(sub.freeTrialEnd) > now;

    // Disable trial if expired
    if (sub.freeTrialEnabled && !trialActive) {
      sub.freeTrialEnabled = false;
      await sub.save();
    }

    // Attach data to request for controllers
    req.subscription = {
      isSubscribed: isActiveSub,
      freeTrialEnabled: trialActive,
      freeTrialUsed: sub.freeTrialUsed,
      freeCaptionCount: sub.freeCaptionCount || 0,
      trialEnds: sub.freeTrialEnd || null,
      expiryDate: sub.expiryDate || null,
      productId: sub.productId || null
    };

    next();

  } catch (err) {
    console.log("Subscription middleware error:", err);
    res.status(500).json({ message: "Subscription check failed" });
  }
};
