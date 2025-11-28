const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { ensureAuth, ensureProfileComplete } = require('../middleware/auth');

// @route   POST /api/posts/:postId/concern
// @desc    Send a concern about a post (user reporting)
router.post(
  '/posts/:postId/concern',
  ensureAuth,
  ensureProfileComplete,
  reportController.sendConcern
);

module.exports = router;
