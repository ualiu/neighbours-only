const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { ensureProfileComplete } = require('../middleware/auth');

// @route   POST /comments/create
router.post('/create', ensureProfileComplete, commentController.createComment);

// @route   GET /comments/:postId
router.get('/:postId', ensureProfileComplete, commentController.getComments);

// @route   POST /comments/:id/delete
router.post('/:id/delete', ensureProfileComplete, commentController.deleteComment);

module.exports = router;
