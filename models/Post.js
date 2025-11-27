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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Post', postSchema);
