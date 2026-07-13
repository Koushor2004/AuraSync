const mongoose = require('mongoose');
const { EMOTION_KEYS } = require('../config/emotions');

const emotionLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    emotion: {
      type: String,
      enum: EMOTION_KEYS,
      required: true,
    },
    source: {
      type: String,
      enum: ['camera', 'manual'],
      required: true,
    },
    confidence: {
      // 0-100, only meaningful for camera-sourced detections
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
    playlistGenerated: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

emotionLogSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('EmotionLog', emotionLogSchema);
