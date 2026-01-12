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

    console.log(" BODY:", req.body);
    console.log("FILES:", req.files?.length);

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
      const deviceId = req.body.deviceId;

      if (!deviceId || typeof deviceId !== "string") {
        return res.status(400).json({ message: "Device ID required" });
      }

      const user = await getUserFromReq(req);

      
      let isSubscribed = false;

if (user) {
  const sub = await Subscription.findOne({ userId: user._id });
  const now = new Date();

  if (sub?.isSubscribed && sub?.expiryDate > now) {
    isSubscribed = true;
  }
}

      // ============================
      //  GET / CREATE GUEST (ALWAYS)
      // ============================
      let guest = await Guest.findOne({ deviceId });

      if (!guest) {
        guest = await Guest.create({ deviceId, freeCaptionCount: 0 });
      }


      // ============================
      //  CHECK GLOBAL LIMIT
      // ============================
    if (!isSubscribed && guest.freeCaptionCount >= 2) {
  return res.status(402).json({
    requireSubscription: true,
    message: "Subscription required",
  });
}


      // ============================
      //  GENERATE CAPTION
      // ============================
      const files = req.files || [];
      const options = JSON.parse(req.body.options || "{}");
      const captions = await generateWithAI(files, options);

      // ============================
      //  INCREMENT GUEST (SOURCE OF TRUTH)
      // ============================
      guest.freeCaptionCount += 1;
      await guest.save();

      // ============================
      //  SYNC USER (IF LOGGED IN)
      // ============================
      if (user) {
        await Subscription.findOneAndUpdate(
          { userId: user._id },
          { freeCaptionCount: guest.freeCaptionCount },
          { upsert: true, new: true }
        );
      }

      return res.json({
        success: true,
        captions,
        freeCaptionCount: guest.freeCaptionCount,
      });

    } catch (err) {
      console.log("Caption Error:", err);
      return res.status(500).json({ message: err.message });
    }
  });
};
