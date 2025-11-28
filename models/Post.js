const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    neighborhoodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Neighborhood',
      required: true,
    },
    text: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    imageUrl: {
      type: String,
    },
    imagePublicId: {
      type: String,
    },
    commentCount: {
      type: Number,
      default: 0,
    },
    moderation: {
      status: {
        type: String,
        enum: ['pending', 'approved', 'flagged', 'rejected', 'needs_revision'],
        default: 'pending',
      },
      checkedAt: Date,
      aiDecision: String,
      aiReason: String,
      aiConfidence: Number,
      categories: [String],
      lane: String,
    },
    isVisible: {
      type: Boolean,
      default: false,
    },
    needsRevision: {
      type: Boolean,
      default: false,
    },
    revisionSuggestion: String,
    reportCount: {
      type: Number,
      default: 0,
    },
    businessDetection: {
      isOutsideBusiness: Boolean,
      isNeighborMicroEntrepreneur: Boolean,
      postFrequency: Number,
      hasCommercialLinks: Boolean,
      promotionalScore: Number,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Post', postSchema);
