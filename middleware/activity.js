const User = require('../models/User');

/**
 * Update user's lastActive timestamp on each request
 * This tracks when user was last active on the site
 */
const updateActivity = async (req, res, next) => {
  if (req.user && req.user._id) {
    try {
      // Update lastActive timestamp without triggering hooks
      await User.updateOne(
        { _id: req.user._id },
        { lastActive: new Date() }
      );
    } catch (error) {
      // Don't block request if update fails
      console.error('Activity tracking error:', error);
    }
  }
  next();
};

module.exports = { updateActivity };
