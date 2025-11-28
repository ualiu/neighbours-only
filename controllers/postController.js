const Post = require('../models/Post');
const Neighborhood = require('../models/Neighborhood');
const { cloudinary } = require('../config/cloudinary');
const moderationService = require('../services/moderationService');

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
  console.log('\n🚀 ===== POST CREATION STARTED =====');
  console.log('Request body:', req.body);
  console.log('User:', req.user?.displayName);

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

    const imageUrl = req.file ? req.file.path : null;

    // ==========================================
    // AI MODERATION DISABLED
    // ==========================================
    // AI screening is turned off - posts publish immediately
    // Moderation code kept intact for future re-enablement
    // Reporting system still active via user reports
    // ==========================================

    // Step 1: DISABLED - Moderate the post with AI
    // const moderation = await moderationService.moderateNewPost(
    //   text.trim(),
    //   imageUrl,
    //   req.user._id
    // );

    // Default moderation result (auto-approve all posts)
    const moderation = {
      status: 'approved',
      decision: 'allow',
      lane: 'green',
      reason: 'Auto-approved (AI moderation disabled)',
      confidence: 100,
      categories: [],
      isVisible: true,
      needsRevision: false,
      revisionSuggestion: null,
      businessDetection: null,
    };

    // Step 2: Create post with moderation result
    const post = new Post({
      userId: req.user._id,
      neighborhoodId: req.user.neighborhoodId,
      text: text.trim(),
      imageUrl,
      imagePublicId: req.file?.filename,
      moderation: {
        status: moderation.status,
        checkedAt: new Date(),
        aiDecision: moderation.decision,
        aiReason: moderation.reason,
        aiConfidence: moderation.confidence,
        categories: moderation.categories,
        lane: moderation.lane,
      },
      isVisible: moderation.isVisible,
      needsRevision: moderation.needsRevision,
      revisionSuggestion: moderation.revisionSuggestion,
      businessDetection: moderation.businessDetection,
    });

    await post.save();

    // Step 3: Handle different moderation lanes (currently always green)

    // 🔴 RED LANE - Blocked (DISABLED)
    // if (moderation.lane === 'red' || moderation.decision === 'block') {
    //   req.flash(
    //     'error',
    //     `Post not allowed: ${moderation.userMessage || moderation.reason}`
    //   );
    //   if (moderation.revisionSuggestion) {
    //     req.flash('info', `Suggestion: ${moderation.revisionSuggestion}`);
    //   }
    //   return res.redirect('/posts/new');
    // }

    // 🟡 YELLOW LANE - Flagged for review (DISABLED)
    // if (moderation.lane === 'yellow' || moderation.decision === 'flag') {
    //   req.flash(
    //     'warning',
    //     'Your post is under review. We\'ll notify you when it\'s approved.'
    //   );
    //   req.flash('info', `Reason: ${moderation.reason}`);
    //   return res.redirect('/neighborhood');
    // }

    // 🟢 GREEN LANE - All posts auto-approved
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
