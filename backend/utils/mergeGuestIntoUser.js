const Guest = require("../models/Guest");
const Subscription = require("../models/Subscription");

module.exports = async function mergeGuestIntoUser(deviceId, userId) {
  if (!deviceId || !userId) return;

  const guest = await Guest.findOne({ deviceId });
  if (!guest) return;

  // already merged → do nothing
  if (guest.mergedIntoUser) return;

  const subscription = await Subscription.findOne({ userId });
  if (!subscription) return;

  // 🔥 KEY FIX: transfer ONLY if user has not used captions yet
  if ((subscription.freeCaptionCount || 0) === 0) {
    subscription.freeCaptionCount = guest.freeCaptionCount;
    await subscription.save();
  }

  // 🔒 lock guest forever
  guest.mergedIntoUser = true;
  guest.mergedUserId = userId;
  await guest.save();
};
