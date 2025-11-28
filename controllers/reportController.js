const Post = require('../models/Post');
const Report = require('../models/Report');
const moderationService = require('../services/moderationService');

// @desc    Submit a concern about a post
// @route   POST /api/posts/:postId/concern
const sendConcern = async (req, res) => {
  try {
    const { postId } = req.params;
    const { reason, details } = req.body;

    // Validate input
    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Please select a reason for your concern',
      });
    }

    // Prevent duplicate reports from same user
    const existingReport = await Report.findOne({
      postId,
      reportedBy: req.user._id,
    });

    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: 'You already sent a concern about this post',
      });
    }

    // Create concern/report
    const report = new Report({
      postId,
      reportedBy: req.user._id,
      neighborhoodId: req.user.neighborhoodId,
      reason,
      details: details || '',
    });

    await report.save();

    // Update post report count
    const post = await Post.findById(postId).populate('userId');
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    post.reportCount += 1;

    // CRITICAL: If post gets 3+ reports, trigger AI re-analysis with community feedback
    const REPORT_THRESHOLD =
      parseInt(process.env.MODERATION_REPORT_THRESHOLD) || 3;

    let willReanalyze = false;

    if (post.reportCount >= REPORT_THRESHOLD) {
      console.log(
        `Post ${postId} reached ${post.reportCount} reports. Re-analyzing with AI...`
      );

      willReanalyze = true;

      const allReports = await Report.find({ postId });

      const reanalysis = await moderationService.reanalyzeWithUserFeedback(
        post,
        allReports
      );

      // Update post based on community-informed re-analysis
      post.moderation.status =
        reanalysis.decision === 'allow'
          ? 'approved'
          : reanalysis.decision === 'flag'
          ? 'flagged'
          : 'rejected';
      post.moderation.aiDecision = reanalysis.decision;
      post.moderation.aiReason = reanalysis.reason;
      post.moderation.aiConfidence = reanalysis.confidence;
      post.moderation.lane = reanalysis.lane;
      post.isVisible = reanalysis.decision === 'allow';

      // Store re-analysis results in all reports for this post
      await Report.updateMany(
        { postId },
        {
          $set: {
            aiReanalysis: {
              decision: reanalysis.decision,
              reason: reanalysis.reason,
              confidence: reanalysis.confidence,
              checkedAt: new Date(),
              actionTaken: reanalysis.action_taken,
            },
            status: 'reviewed',
          },
        }
      );

      // Log if post was hidden after re-analysis
      if (!post.isVisible && reanalysis.changed_decision) {
        console.log(
          `Post ${postId} hidden after community feedback (${post.reportCount} reports)`
        );
      }
    }

    await post.save();

    res.json({
      success: true,
      message: `Thank you for your concern. ${
        willReanalyze
          ? "This post has been re-reviewed by our AI system based on community feedback."
          : "We're reviewing this post."
      }`,
      reportCount: post.reportCount,
      willReanalyze,
    });
  } catch (error) {
    console.error('Send concern error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit concern. Please try again.',
    });
  }
};

module.exports = {
  sendConcern,
};
