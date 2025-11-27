const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { ensureProfileComplete } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// @route   GET /posts/new
router.get('/new', ensureProfileComplete, postController.showCreateForm);

// @route   POST /posts/create
router.post(
  '/create',
  ensureProfileComplete,
  upload.single('image'),
  postController.createPost
);

// @route   DELETE /posts/:id
router.post('/:id/delete', ensureProfileComplete, postController.deletePost);

module.exports = router;
