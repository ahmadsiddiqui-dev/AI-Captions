const Guest = require("../models/Guest");
const Subscription = require("../models/Subscription");

module.exports = async function mergeGuestIntoUser(deviceId, userId) {
  if (!deviceId || !userId) return;

  const guest = await Guest.findOne({ deviceId });
  if (!guest) return;

  const usedCount = guest.freeCaptionCount || 0;
  if (usedCount === 0) return;

  // Ensure subscription exists
  const subscription = await Subscription.findOneAndUpdate(
    { userId },
    {},
    { upsert: true, new: true }
  );

  // IMPORTANT: keep max usage (avoid lowering count)
  const updatedCount = Math.max(
    subscription.freeCaptionCount || 0,
    usedCount
  );

  await Subscription.updateOne(
    { userId },
    { $set: { freeCaptionCount: updatedCount } }
  );
};
