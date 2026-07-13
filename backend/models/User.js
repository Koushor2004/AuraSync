const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 60,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false,
    },
    avatarColor: {
      type: String,
      default: '#6C63FF',
    },
    theme: {
      type: String,
      enum: ['dark', 'light'],
      default: 'dark',
    },
    spotify: {
      connected: { type: Boolean, default: false },
      spotifyId: { type: String, default: null },
      displayName: { type: String, default: null },
      accessToken: { type: String, default: null, select: false },
      refreshToken: { type: String, default: null, select: false },
      tokenExpiresAt: { type: Date, default: null },
    },
    currentEmotion: {
      type: String,
      default: 'neutral',
    },
    currentAura: {
      type: String,
      default: '#94A3B8',
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    avatarColor: this.avatarColor,
    theme: this.theme,
    currentEmotion: this.currentEmotion,
    currentAura: this.currentAura,
    spotify: {
      connected: this.spotify?.connected || false,
      displayName: this.spotify?.displayName || null,
    },
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);
