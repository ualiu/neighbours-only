const express = require('express');
const router = express.Router();
const neighborhoodController = require('../controllers/neighborhoodController');
const { ensureProfileComplete } = require('../middleware/auth');

// @route   GET /neighborhood
router.get('/', ensureProfileComplete, neighborhoodController.showFeed);

// @route   GET /neighborhood/members
router.get('/members', ensureProfileComplete, neighborhoodController.showNeighbours);

// @route   GET /neighborhood/search
router.get('/search', ensureProfileComplete, neighborhoodController.searchPosts);

module.exports = router;
