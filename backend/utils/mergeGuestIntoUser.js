
const Guest = require("../models/Guest");
const Subscription = require("../models/Subscription");

module.exports = async function mergeGuestIntoUser(deviceId, userId) {
  if (!deviceId) return;

  const guest = await Guest.findOne({ deviceId });
  if (!guest) return;

  await Subscription.findOneAndUpdate(
    { userId },
    {
      $max: { freeCaptionCount: guest.freeCaptionCount }
    },
    { upsert: true }
  );
};
