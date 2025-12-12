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
        freeCaptionCount: 0,
      });
    }

    if (sub.freeTrialUsed) {
      return res.status(400).json({ message: "Trial already used before" });
    }

    sub.productId = productId;
    sub.platform = "google_play";
    sub.autoRenew = true;
    sub.cancelled = false;

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

    const {
      productId,
      expiryDate,
      transactionId,
      purchaseToken,
      autoRenew,
      platform,
      cancelled
    } = req.body;

    if (!productId || !expiryDate || !transactionId || !purchaseToken) {
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

    // NEW FIELDS
    sub.transactionId = transactionId;
    sub.purchaseToken = purchaseToken;
    sub.autoRenew = autoRenew !== undefined ? autoRenew : true;
    sub.platform = platform || "google_play";
    sub.cancelled = cancelled || false;

    await sub.save();

    return res.json({
      success: true,
      subscription: sub,
    });
  } catch (err) {
    console.log("Verify purchase error:", err);
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
        expiryDate: null,
        productId: null,
        autoRenew: false,
        platform: null,
        cancelled: false
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
      expiryDate: sub.expiryDate || null,
      productId: sub.productId || null,
      autoRenew: sub.autoRenew,
      platform: sub.platform,
      cancelled: sub.cancelled,
      transactionId: sub.transactionId || null
    });


  } catch (err) {
    return res.status(500).json({ message: "Could not fetch status" });
  }
};
