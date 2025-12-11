const { generateWithAI } = require("../services/ai.service");
const multer = require("multer");
const Subscription = require("../models/Subscription");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const upload = multer().array("images", 5);

// Extract user from token — optional (not required)
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
      // Try to get logged in user, but not required
      const user = await getUserFromReq(req);

      // Safe JSON parse
      let options = {};
      try {
        options = JSON.parse(req.body.options || "{}");
      } catch {
        options = {};
      }

      const files = req.files || [];

      // ---------------------------------------------------
      // 1️⃣ GUEST USERS — No DB, no login, FE only limits
      // ---------------------------------------------------
      if (!user) {
        const captions = await generateWithAI(files, options);
        return res.json({
          success: true,
          captions,
          guest: true,  // frontend uses this to track 2 attempts
        });
      }

      // ---------------------------------------------------
      // 2️⃣ LOGGED USERS — Use DB limit
      // ---------------------------------------------------
      let isSubscribed = false;
      let freeCaptionCount = 0;

      const sub = await Subscription.findOne({ userId: user._id });

      if (sub) {
        const now = new Date();

        if (sub.isSubscribed && sub.expiryDate > now) {
          isSubscribed = true;
        }

        freeCaptionCount = sub.freeCaptionCount || 0;
      }

      // ❗ LIMIT: 2 FREE GENERATIONS FOR LOGGED USERS
      if (!isSubscribed && freeCaptionCount >= 2) {
        return res.status(402).json({
          requireSubscription: true,
          message: "Subscription required",
        });
      }

      // Generate captions
      const captions = await generateWithAI(files, options);

      // Increase usage only for logged user & not subscribed
      if (!isSubscribed) {
        await Subscription.findOneAndUpdate(
          { userId: user._id },
          { $inc: { freeCaptionCount: 1 } },
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
