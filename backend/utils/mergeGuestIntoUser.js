const Guest = require("../models/Guest");
const Subscription = require("../models/Subscription");

const mergeGuestIntoUser = async (deviceId, userId) => {
  if (!deviceId) return;

  const guest = await Guest.findOne({ deviceId });
  if (!guest) return;

  await Subscription.findOneAndUpdate(
    { userId },
    { $inc: { freeCaptionCount: guest.freeCaptionCount } },
    { upsert: true }
  );

  await Guest.deleteOne({ deviceId });
};

module.exports = mergeGuestIntoUser;
