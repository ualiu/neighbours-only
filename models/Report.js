const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    neighborhoodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Neighborhood',
      required: true,
    },
    reason: {
      type: String,
      enum: [
        'promotional',
        'hate_speech',
        'harassment',
        'spam',
        'inappropriate',
        'other',
      ],
      required: true,
    },
    details: {
      type: String,
    },
    aiReanalysis: {
      decision: String,
      reason: String,
      confidence: Number,
      checkedAt: Date,
      actionTaken: String,
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'action_taken', 'dismissed'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
reportSchema.index({ postId: 1, reportedBy: 1 }, { unique: true }); // Prevent duplicate reports
reportSchema.index({ postId: 1, status: 1 });
reportSchema.index({ neighborhoodId: 1, createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);
