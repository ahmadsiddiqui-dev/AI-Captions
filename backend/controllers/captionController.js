exports.generateCaptions = (req, res) => {
  upload(req, res, async () => {
    try {
      let user = await getUserFromReq(req);

      let isSubscribed = false;
      let freeTrialEnabled = false;
      let freeCaptionCount = 0;

      // ============================
      // 1️⃣ ALLOW GUEST USERS
      // ============================
      if (!user) {
        // Guest user → no DB limit; frontend enforces 2 free attempts
        const files = req.files || [];
        const options = JSON.parse(req.body.options || "{}");
        const captions = await generateWithAI(files, options);

        return res.json({
          success: true,
          captions,
          guest: true
        });
      }

      // ============================
      // 2️⃣ LOGGED IN USER
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

      // Logged-in user free limit
      if (!isSubscribed && !freeTrialEnabled && freeCaptionCount >= 2) {
        return res.status(402).json({
          requireSubscription: true,
          message: "Subscription required"
        });
      }

      const files = req.files || [];
      const options = JSON.parse(req.body.options || "{}");

      const captions = await generateWithAI(files, options);

      // Increase DB count for logged-in user
      if (!isSubscribed && !freeTrialEnabled) {
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
