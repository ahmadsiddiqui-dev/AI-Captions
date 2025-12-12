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
        expiryDate: null
      };
      return next();
    }

    const now = new Date();

    // Check active subscription
    const isActiveSub =
      sub.isSubscribed &&
      sub.expiryDate &&
      new Date(sub.expiryDate) > now;

    // Check active trial
    const trialActive =
      sub.freeTrialEnabled &&
      sub.freeTrialEnd &&
      new Date(sub.freeTrialEnd) > now;

    // If trial expired → disable
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
      expiryDate: sub.expiryDate || null
    };

    next();
  } catch (err) {
    console.log(" Subscription middleware error:", err);
    res.status(500).json({ message: "Subscription check failed" });
  }
};
