const mongoose = require('mongoose');

const neighborhoodSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    province: {
      type: String,
    },
    country: {
      type: String,
    },
    centroid: {
      lat: Number,
      lng: Number,
    },
    memberCount: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Neighborhood', neighborhoodSchema);
