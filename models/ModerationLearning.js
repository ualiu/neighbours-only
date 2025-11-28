const mongoose = require('mongoose');

const moderationLearningSchema = new mongoose.Schema(
  {
    postText: {
      type: String,
      required: true,
    },
    originalDecision: {
      type: String,
      enum: ['allow', 'flag', 'block'],
      required: true,
    },
    originalLane: {
      type: String,
      enum: ['green', 'yellow', 'red', 'unknown'],
      default: 'unknown',
    },
    newDecision: {
      type: String,
      enum: ['allow', 'flag', 'block'],
    },
    newLane: {
      type: String,
      enum: ['green', 'yellow', 'red', 'unknown'],
    },
    learningNote: {
      type: String,
    },
    reportCount: {
      type: Number,
      default: 0,
    },
    reportCategories: [String],
    wasDecisionChanged: {
      type: Boolean,
      default: false,
    },
    userContext: {
      postFrequency: Number,
      accountAge: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Index for analytics queries
moderationLearningSchema.index({ wasDecisionChanged: 1, createdAt: -1 });
moderationLearningSchema.index({ originalDecision: 1, newDecision: 1 });

module.exports = mongoose.model('ModerationLearning', moderationLearningSchema);
