const Guest = require("../models/Guest");
const Subscription = require("../models/Subscription");

module.exports = async function mergeGuestIntoUser(deviceId, userId) {
  if (!deviceId || !userId) return;

  const guest = await Guest.findOne({ deviceId });
  if (!guest) return;

  const subscription = await Subscription.findOneAndUpdate(
    { userId },
    { userId },
    { upsert: true, new: true }
  );

  subscription.freeCaptionCount = guest.freeCaptionCount;
  await subscription.save();

};
