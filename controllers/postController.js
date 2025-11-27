const Post = require('../models/Post');
const Neighborhood = require('../models/Neighborhood');
const { cloudinary } = require('../config/cloudinary');

// @desc    Show create post form
// @route   GET /posts/new
exports.showCreateForm = async (req, res) => {
  try {
    const neighborhood = await Neighborhood.findById(req.user.neighborhoodId);

    res.render('create-post', {
      user: req.user,
      neighborhood,
    });
  } catch (error) {
    console.error('Error loading create post form:', error);
    req.flash('error', 'Unable to load form');
    res.redirect('/neighborhood');
  }
};

// @desc    Create a new post
// @route   POST /posts/create
exports.createPost = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      req.flash('error', 'Post text is required');
      return res.redirect('/posts/new');
    }

    if (text.length > 2000) {
      req.flash('error', 'Post text must be 2000 characters or less');
      return res.redirect('/posts/new');
    }

    const postData = {
      userId: req.user._id,
      neighborhoodId: req.user.neighborhoodId,
      text: text.trim(),
    };

    // If image was uploaded
    if (req.file) {
      postData.imageUrl = req.file.path;
      postData.imagePublicId = req.file.filename;
    }

    await Post.create(postData);

    req.flash('success', 'Post created successfully!');
    res.redirect('/neighborhood');
  } catch (error) {
    console.error('Error creating post:', error);
    req.flash('error', 'Unable to create post. Please try again.');
    res.redirect('/posts/new');
  }
};

// @desc    Delete a post
// @route   DELETE /posts/:id
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      req.flash('error', 'Post not found');
      return res.redirect('/neighborhood');
    }

    // Check if user owns the post
    if (post.userId.toString() !== req.user._id.toString()) {
      req.flash('error', 'You can only delete your own posts');
      return res.redirect('/neighborhood');
    }

    // Delete image from Cloudinary if exists
    if (post.imagePublicId) {
      await cloudinary.uploader.destroy(post.imagePublicId);
    }

    await Post.findByIdAndDelete(req.params.id);

    req.flash('success', 'Post deleted successfully');
    res.redirect('/neighborhood');
  } catch (error) {
    console.error('Error deleting post:', error);
    req.flash('error', 'Unable to delete post');
    res.redirect('/neighborhood');
  }
};
