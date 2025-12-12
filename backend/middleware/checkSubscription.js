const Subscription = require("../models/Subscription");

module.exports = async function (req, res, next) {
  try {
    const sub = await Subscription.findOne({ userId: req.user._id });

    if (!sub) {
      req.subscription = {
        isSubscribed: false,
        freeTrialEnabled: false,
        freeTrialUsed: false,
        freeCaptionCount: 0,
        trialEnds: null,
        expiryDate: null,
        productId: null,
        autoRenew: false,
        platform: null,
        cancelled: false,
        transactionId: null
      };
      return next();
    }

    const now = new Date();

    const isActiveSub =
      sub.isSubscribed &&
      sub.expiryDate &&
      new Date(sub.expiryDate) > now;

    const trialActive =
      sub.freeTrialEnabled &&
      sub.freeTrialEnd &&
      new Date(sub.freeTrialEnd) > now;

    if (sub.freeTrialEnabled && !trialActive) {
      sub.freeTrialEnabled = false;
      await sub.save();
    }

    req.subscription = {
      isSubscribed: isActiveSub,
      freeTrialEnabled: trialActive,
      freeTrialUsed: sub.freeTrialUsed,
      freeCaptionCount: sub.freeCaptionCount || 0,
      trialEnds: sub.freeTrialEnd || null,
      expiryDate: sub.expiryDate || null,
      productId: sub.productId || null,
      autoRenew: sub.autoRenew !== undefined ? sub.autoRenew : true,
      platform: sub.platform || "google_play",
      cancelled: sub.cancelled || false,
      transactionId: sub.transactionId || null
    };

    next();
  } catch (err) {
    console.log("Subscription middleware error:", err);
    res.status(500).json({ message: "Subscription check failed" });
  }
};
