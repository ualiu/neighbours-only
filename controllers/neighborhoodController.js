const Post = require('../models/Post');
const User = require('../models/User');
const Neighborhood = require('../models/Neighborhood');
const Comment = require('../models/Comment');

// @desc    Show neighborhood feed
// @route   GET /neighborhood
exports.showFeed = async (req, res) => {
  try {
    const neighborhood = await Neighborhood.findById(req.user.neighborhoodId);

    if (!neighborhood) {
      req.flash('error', 'Neighborhood not found');
      return res.redirect('/');
    }

    // Get all visible posts from this neighborhood with user details
    const posts = await Post.find({
      neighborhoodId: req.user.neighborhoodId,
      isVisible: true, // Only show approved posts
    })
      .populate('userId', 'displayName avatar')
      .sort({ createdAt: -1 });

    // Filter out posts where the user has been deleted
    const validPosts = posts.filter(post => post.userId !== null);

    // Get comments for each post
    const postsWithComments = await Promise.all(
      validPosts.map(async (post) => {
        const comments = await Comment.find({ postId: post._id })
          .populate('userId', 'displayName avatar')
          .sort({ createdAt: 1 })
          .limit(3); // Show latest 3 comments initially

        // Filter out comments where user has been deleted
        const validComments = comments.filter(comment => comment.userId !== null);

        return {
          ...post.toObject(),
          comments: validComments,
        };
      })
    );

    res.render('neighborhood', {
      user: req.user,
      neighborhood,
      posts: postsWithComments,
    });
  } catch (error) {
    console.error('Error loading neighborhood feed:', error);
    req.flash('error', 'Unable to load feed');
    res.redirect('/');
  }
};

// @desc    Show neighborhood neighbours
// @route   GET /neighborhood/members
exports.showNeighbours = async (req, res) => {
  try {
    const neighborhood = await Neighborhood.findById(req.user.neighborhoodId);

    if (!neighborhood) {
      req.flash('error', 'Neighborhood not found');
      return res.redirect('/');
    }

    // Get ALL neighbours in the neighborhood
    const allNeighbours = await User.find({
      neighborhoodId: req.user.neighborhoodId,
      hasCompletedProfile: true
    })
      .select('displayName avatar createdAt address settings lastActive')
      .sort({ lastActive: -1 });

    // Determine who is online (active in last 5 minutes with showOnlineStatus enabled)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const onlineCount = allNeighbours.filter(neighbour =>
      neighbour.lastActive >= fiveMinutesAgo &&
      neighbour.settings?.showOnlineStatus === true
    ).length;

    res.render('members', {
      user: req.user,
      neighborhood,
      neighbours: allNeighbours,
      onlineCount: onlineCount,
      totalMembers: allNeighbours.length,
      fiveMinutesAgo: fiveMinutesAgo.getTime() // Pass to view for online check
    });
  } catch (error) {
    console.error('Error loading neighbours:', error);
    req.flash('error', 'Unable to load neighbours');
    res.redirect('/neighborhood');
  }
};

// @desc    Search posts in neighborhood
// @route   GET /neighborhood/search
exports.searchPosts = async (req, res) => {
  try {
    const query = req.query.q || '';
    const neighborhood = await Neighborhood.findById(req.user.neighborhoodId);

    if (!neighborhood) {
      req.flash('error', 'Neighborhood not found');
      return res.redirect('/');
    }

    let posts = [];

    if (query.trim().length > 0) {
      // Search posts by text content
      posts = await Post.find({
        neighborhoodId: req.user.neighborhoodId,
        isVisible: true, // Only show visible posts
        text: { $regex: query, $options: 'i' } // Case-insensitive search
      })
        .populate('userId', 'displayName avatar')
        .sort({ createdAt: -1 });

      // Filter out posts where the user has been deleted
      const validPosts = posts.filter(post => post.userId !== null);

      // Get comments for each post
      const postsWithComments = await Promise.all(
        validPosts.map(async (post) => {
          const comments = await Comment.find({ postId: post._id })
            .populate('userId', 'displayName avatar')
            .sort({ createdAt: 1 })
            .limit(3);

          // Filter out comments where user has been deleted
          const validComments = comments.filter(comment => comment.userId !== null);

          return {
            ...post.toObject(),
            comments: validComments,
          };
        })
      );

      posts = postsWithComments;
    }

    res.render('search-results', {
      user: req.user,
      neighborhood,
      posts,
      query,
    });
  } catch (error) {
    console.error('Error searching posts:', error);
    req.flash('error', 'Unable to search posts');
    res.redirect('/neighborhood');
  }
};
