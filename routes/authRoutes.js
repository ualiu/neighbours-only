const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');
const { ensureGuest, ensureProfileIncomplete } = require('../middleware/auth');

// @route   GET /
router.get('/', ensureGuest, authController.showLanding);

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
    res.redirect('/neighborhood');
  }
);

// @route   GET /signup/address
router.get('/signup/address', ensureProfileIncomplete, authController.showAddressForm);

// @route   POST /signup/complete-profile
router.post('/signup/complete-profile', ensureProfileIncomplete, authController.completeProfile);

// @route   GET /auth/logout
router.get('/auth/logout', authController.logout);

module.exports = router;
