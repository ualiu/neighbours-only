const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
    },
    displayName: {
      type: String,
    },
    avatar: {
      type: String,
    },
    address: {
      raw: String,
      formatted: String,
      sublocality: String,
      city: String,
      postalCode: String,
      province: String,
      country: String,
      lat: Number,
      lng: Number,
    },
    neighborhoodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Neighborhood',
    },
    hasCompletedProfile: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
