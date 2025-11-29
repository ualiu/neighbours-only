const User = require('../models/User');

/**
 * Update user's lastActive timestamp on each request
 * This tracks when user was last active on the site
 */
const updateActivity = async (req, res, next) => {
  if (req.user && req.user._id) {
    try {
      // Update lastActive timestamp without triggering hooks
      const result = await User.updateOne(
        { _id: req.user._id },
        { lastActive: new Date() }
      );
      console.log(`📍 Activity tracked for user ${req.user._id} (${req.user.displayName}) - matched: ${result.matchedCount}, modified: ${result.modifiedCount}`);
    } catch (error) {
      // Don't block request if update fails
      console.error('Activity tracking error:', error);
    }
  }
  next();
};

module.exports = { updateActivity };
