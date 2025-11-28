const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { ensureAuth } = require('../middleware/auth');

// @route   GET /settings
router.get('/', ensureAuth, settingsController.showSettings);

// @route   POST /settings/update
router.post('/update', ensureAuth, settingsController.updateSettings);

// @route   POST /settings/delete-account
router.post('/delete-account', ensureAuth, settingsController.deleteAccount);

module.exports = router;
