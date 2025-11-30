const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      sparse: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    displayName: {
      type: String,
    },
    avatar: {
      type: String,
      default: 'https://ui-avatars.com/api/?name=User&background=0d6efd&color=fff&size=200',
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
    hasCreatedFirstPost: {
      type: Boolean,
      default: false,
    },
    settings: {
      showAddress: {
        type: Boolean,
        default: true,
      },
      showOnlineStatus: {
        type: Boolean,
        default: true,
      },
      emailOnComment: {
        type: Boolean,
        default: true,
      },
      emailOnNewPost: {
        type: Boolean,
        default: true,
      },
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) {
    return false;
  }
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
