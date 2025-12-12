const Subscription = require("../models/Subscription");

// Called when user selects a plan (BEFORE starting trial)
exports.startPlanAndTrial = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Missing product selection" });
    }

    const TRIAL_DAYS = 7;
    const now = new Date();
    const trialEnd = new Date(now);
    trialEnd.setDate(trialEnd.getDate() + TRIAL_DAYS);

    let sub = await Subscription.findOne({ userId });

    if (!sub) {
      sub = new Subscription({
        userId,
        freeCaptionCount: 0, // 🟣 added
      });
    }

    if (sub.freeTrialUsed) {
      return res.status(400).json({ message: "Trial already used before" });
    }

    sub.productId = productId;
    sub.freeTrialEnabled = true;
    sub.freeTrialUsed = true;
    sub.freeTrialStart = now;
    sub.freeTrialEnd = trialEnd;

    await sub.save();

    return res.json({
      success: true,
      message: "Trial started",
      subscription: sub
    });

  } catch (err) {
    return res.status(500).json({ message: "Trial activation failed" });
  }
};


// Called when Google Play purchase is verified
exports.verifyPurchase = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, expiryDate } = req.body;

    if (!productId || !expiryDate) {
      return res.status(400).json({ message: "Missing purchase data" });
    }

    let sub = await Subscription.findOne({ userId });

    if (!sub) {
      sub = new Subscription({
        userId,
        freeCaptionCount: 0, 
      });
    }

    sub.isSubscribed = true;
    sub.productId = productId;
    sub.purchaseDate = new Date();
    sub.expiryDate = new Date(expiryDate);

    await sub.save();

    return res.json({
      success: true,
      subscription: sub
    });

  } catch (err) {
    return res.status(500).json({ message: "Subscription update failed" });
  }
};


exports.getSubscriptionStatus = async (req, res) => {
  try {
    const userId = req.user?._id;
    const sub = await Subscription.findOne({ userId });

    if (!sub) {
      return res.json({
        isSubscribed: false,
        freeTrialEnabled: false,
        freeTrialUsed: false,
        freeCaptionCount: 0,
        trialEnds: null,
        expiryDate: null
      });
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

    // Disable expired trial
    if (sub.freeTrialEnabled && !trialActive) {
      sub.freeTrialEnabled = false;
      await sub.save();
    }

    return res.json({
      isSubscribed: isActiveSub,
      freeTrialEnabled: trialActive,
      freeTrialUsed: sub.freeTrialUsed,
      freeCaptionCount: sub.freeCaptionCount || 0,
      trialEnds: sub.freeTrialEnd || null,
      expiryDate: sub.expiryDate || null
    });

  } catch (err) {
    return res.status(500).json({ message: "Could not fetch status" });
  }
};
