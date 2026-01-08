const Guest = require("../models/Guest");
const Subscription = require("../models/Subscription");

module.exports = async function mergeGuestIntoUser(deviceId, userId) {
  if (!deviceId || !userId) return;

  const guest = await Guest.findOne({ deviceId });
  if (!guest) return;

  if (guest.mergedIntoUser) return;

  const subscription = await Subscription.findOne({ userId });
  if (!subscription) return;

  if ((subscription.freeCaptionCount || 0) === 0) {
    subscription.freeCaptionCount = guest.freeCaptionCount;
    await subscription.save();
  }
  
  guest.mergedIntoUser = true;
  guest.mergedUserId = userId;
  await guest.save();
};
