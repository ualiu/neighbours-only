const Comment = require('../models/Comment');
const Post = require('../models/Post');

// @desc    Create a comment on a post
// @route   POST /comments/create
exports.createComment = async (req, res) => {
  try {
    const { postId, text } = req.body;

    if (!text || text.trim().length === 0) {
      req.flash('error', 'Comment cannot be empty');
      return res.redirect('/neighborhood');
    }

    if (text.length > 500) {
      req.flash('error', 'Comment must be 500 characters or less');
      return res.redirect('/neighborhood');
    }

    // Verify post exists and belongs to same neighborhood
    const post = await Post.findById(postId);

    if (!post) {
      req.flash('error', 'Post not found');
      return res.redirect('/neighborhood');
    }

    if (post.neighborhoodId.toString() !== req.user.neighborhoodId.toString()) {
      req.flash('error', 'You can only comment on posts in your neighborhood');
      return res.redirect('/neighborhood');
    }

    // Create comment
    await Comment.create({
      postId: postId,
      userId: req.user._id,
      text: text.trim(),
    });

    // Increment comment count on post
    post.commentCount += 1;
    await post.save();

    res.redirect('/neighborhood');
  } catch (error) {
    console.error('Error creating comment:', error);
    req.flash('error', 'Unable to create comment. Please try again.');
    res.redirect('/neighborhood');
  }
};

// @desc    Get comments for a post
// @route   GET /comments/:postId
exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.postId })
      .populate('userId', 'displayName avatar')
      .sort({ createdAt: 1 });

    res.json({ success: true, comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ success: false, message: 'Unable to fetch comments' });
  }
};

// @desc    Delete a comment
// @route   POST /comments/:id/delete
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      req.flash('error', 'Comment not found');
      return res.redirect('/neighborhood');
    }

    // Check if user owns the comment
    if (comment.userId.toString() !== req.user._id.toString()) {
      req.flash('error', 'You can only delete your own comments');
      return res.redirect('/neighborhood');
    }

    // Decrement comment count on post
    const post = await Post.findById(comment.postId);
    if (post) {
      post.commentCount = Math.max(0, post.commentCount - 1);
      await post.save();
    }

    await Comment.findByIdAndDelete(req.params.id);

    req.flash('success', 'Comment deleted successfully');
    res.redirect('/neighborhood');
  } catch (error) {
    console.error('Error deleting comment:', error);
    req.flash('error', 'Unable to delete comment');
    res.redirect('/neighborhood');
  }
};
