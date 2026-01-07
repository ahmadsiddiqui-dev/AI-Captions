const { generateWithAI } = require("../services/ai.service");
const multer = require("multer");
const Subscription = require("../models/Subscription");
const User = require("../models/User");
const Guest = require("../models/Guest");
const jwt = require("jsonwebtoken");

const upload = multer().array("images", 5);

// Extract logged in user
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
      console.log("HEADERS:", req.headers);
      console.log("x-device-id value:", req.headers["x-device-id"]);
      console.log("x-device-id type:", typeof req.headers["x-device-id"]);

      const user = await getUserFromReq(req);
      const deviceId = req.body.deviceId;

      if (
        !deviceId ||
        typeof deviceId !== "string" ||
        deviceId === "[object Object]"
      ) {
        return res.status(400).json({ message: "Invalid device ID" });
      }

      let isSubscribed = false;
      let freeTrialEnabled = false;
      let freeCaptionCount = 0;

      // ============================
      //  GUEST USER LOGIC
      // ============================
      if (!user) {

        if (!deviceId) {
          return res.status(400).json({ message: "Device ID missing" });
        }

        let guest = await Guest.findOne({ deviceId });

        // Create guest record if not exists
        if (!guest) {
          guest = await Guest.create({ deviceId });
        }

        // Check limit
        if (guest.freeCaptionCount >= 2) {
          return res.status(402).json({
            requireSubscription: true,
            message: "Subscription required"
          });
        }

        // Process caption
        const files = req.files || [];
        const options = JSON.parse(req.body.options || "{}");
        const captions = await generateWithAI(files, options);

        // Increase guest usage
        guest.freeCaptionCount += 1;
        await guest.save();

        return res.json({ success: true, captions, guest: true });
      }

      // ============================
      //  LOGGED-IN USER LOGIC
      // ============================

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

      if (!isSubscribed && !freeTrialEnabled && freeCaptionCount >= 2) {
        return res.status(402).json({
          requireSubscription: true,
          message: "Subscription required"
        });
      }

      const files = req.files || [];
      const options = JSON.parse(req.body.options || "{}");

      const captions = await generateWithAI(files, options);

      if (!isSubscribed && !freeTrialEnabled) {
        await Subscription.findOneAndUpdate(
          { userId: user._id },
          { $inc: { freeCaptionCount: 1 } },
          { new: true, upsert: true }
        );
      }

      return res.json({ success: true, captions });

    } catch (err) {
      console.log("Caption Error:", err);
      return res.status(500).json({ message: err.message });
    }
  });
};
