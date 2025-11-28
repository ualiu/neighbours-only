const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

// @desc    Show settings page
// @route   GET /settings
exports.showSettings = async (req, res) => {
  try {
    res.render('settings', {
      user: req.user,
    });
  } catch (error) {
    console.error('Error loading settings:', error);
    req.flash('error', 'Unable to load settings');
    res.redirect('/neighborhood');
  }
};

// @desc    Update user settings
// @route   POST /settings/update
exports.updateSettings = async (req, res) => {
  try {
    const { showAddress } = req.body;

    // Update user settings
    await User.findByIdAndUpdate(req.user._id, {
      'settings.showAddress': showAddress === 'on',
    });

    req.flash('success', 'Settings updated successfully');
    res.redirect('/settings');
  } catch (error) {
    console.error('Error updating settings:', error);
    req.flash('error', 'Unable to update settings');
    res.redirect('/settings');
  }
};

// @desc    Delete user account
// @route   POST /settings/delete-account
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    // Delete all user's posts
    await Post.deleteMany({ userId });

    // Delete all user's comments
    await Comment.deleteMany({ userId });

    // Delete user account
    await User.findByIdAndDelete(userId);

    // Logout user
    req.logout((err) => {
      if (err) {
        console.error('Logout error:', error);
      }
      req.flash('success', 'Your account has been deleted');
      res.redirect('/');
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    req.flash('error', 'Unable to delete account. Please try again.');
    res.redirect('/settings');
  }
};
