const { generateWithAI } = require("../services/ai.service");
const multer = require("multer");
const Subscription = require("../models/Subscription");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const upload = multer().array("images", 5);

// Get user from token
const getUserFromReq = async (req) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return null;

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return await User.findById(decoded.id);
  } catch {
    return null;
  }
};

exports.generateCaptions = (req, res) => {
  upload(req, res, async () => {
    try {
      const user = await getUserFromReq(req);

      let isSubscribed = false;
      let freeTrialEnabled = false;
      let freeCaptionCount = 0;

      if (!user) {
        return res.status(401).json({
          requireLogin: true,
          message: "Login required"
        });
      }

      const sub = await Subscription.findOne({ userId: user._id });
      if (sub) {
        const now = new Date();

        if (sub.isSubscribed && sub.expiryDate > now) {
          isSubscribed = true;
        }

        if (sub.freeTrialEnabled && sub.freeTrialEnd > now) {
          freeTrialEnabled = true;
        }

        freeCaptionCount = sub.freeCaptionCount || 0;
      }

      // **Only 2 free caption generations allowed before paywall**
      if (!isSubscribed && !freeTrialEnabled && freeCaptionCount >= 2) {
        return res.status(402).json({
          requireSubscription: true,
          message: "Subscription required"
        });
      }

      const files = req.files || [];
      const options = JSON.parse(req.body.options || "{}");

      const captions = await generateWithAI(files, options);

      // Increase free usage ONLY if user is not subscribed and not in trial
      if (!isSubscribed && !freeTrialEnabled) {
        await Subscription.findOneAndUpdate(
          { userId: user._id },
          {
            $inc: { freeCaptionCount: 1 },
            $setOnInsert: {
              userId: user._id,
              freeTrialUsed: false,
              freeTrialEnabled: false,
              freeCaptionCount: 0
            }
          },
          { new: true, upsert: true }
        );

      }

      return res.json({ success: true, captions });

    } catch (err) {
      console.log("Caption Error:", err.message);
      return res.status(500).json({ message: err.message });
    }
  });
};
