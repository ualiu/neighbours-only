const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');
const { ensureGuest, ensureProfileIncomplete, ensureFirstPostIncomplete } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// @route   GET /
router.get('/', authController.showLanding);

// @route   POST /auth/signup
router.post('/auth/signup', authController.signup);

// @route   POST /auth/login
router.post('/auth/login', authController.login);

// @route   GET /terms
router.get('/terms', (req, res) => {
  res.render('terms', {
    title: 'Terms of Service - Neighbours Only'
  });
});

// @route   GET /privacy
router.get('/privacy', (req, res) => {
  res.render('privacy', {
    title: 'Privacy Policy - Neighbours Only'
  });
});

// @route   GET /auth/google
router.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// @route   GET /auth/google/callback
router.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Check if user needs to complete profile
    if (!req.user.hasCompletedProfile) {
      return res.redirect('/signup/address');
    }
    // Check if user needs to create first post
    if (!req.user.hasCreatedFirstPost) {
      return res.redirect('/signup/first-post');
    }
    res.redirect('/neighborhood');
  }
);

// @route   GET /signup/address
router.get('/signup/address', ensureProfileIncomplete, authController.showAddressForm);

// @route   POST /signup/complete-profile
router.post('/signup/complete-profile', ensureProfileIncomplete, authController.completeProfile);

// @route   GET /signup/first-post
router.get('/signup/first-post', ensureFirstPostIncomplete, authController.showFirstPostForm);

// @route   POST /signup/create-first-post
router.post('/signup/create-first-post', ensureFirstPostIncomplete, upload.single('image'), authController.createFirstPost);

// @route   GET /signup/skip-first-post
router.get('/signup/skip-first-post', ensureFirstPostIncomplete, authController.skipFirstPost);

// @route   GET /auth/logout
router.get('/auth/logout', authController.logout);

module.exports = router;
