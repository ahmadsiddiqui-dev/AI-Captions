const Subscription = require("../models/Subscription");

module.exports = async function (req, res, next) {
  try {
    const sub = await Subscription.findOne({ userId: req.user._id });

    if (!sub) {
      req.subscription = {
        isSubscribed: false,
        freeTrialEnabled: false,
        freeTrialUsed: false
      };
      return next();
    }

    const isActive =
      sub.isSubscribed && sub.expiryDate && new Date() < new Date(sub.expiryDate);

    req.subscription = {
      ...sub.toObject(),
      isSubscribed: isActive
    };

    next();
  } catch (err) {
    res.status(500).json({ message: "Subscription check failed" });
  }
};
