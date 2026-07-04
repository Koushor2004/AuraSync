const mongoose = require('mongoose');

const EMOTIONS = [
  'happy',
  'sad',
  'angry',
  'fear',
  'neutral',
  'surprised',
  'disgusted',
  'excited',
  'relaxed',
];

const emotionHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    emotion: {
      type: String,
      enum: EMOTIONS,
      required: true,
    },
    confidence: {
      type: Number,
      min: 0,
      max: 100,
      default: 100,
    },
    source: {
      type: String,
      enum: ['camera', 'manual'],
      default: 'manual',
    },
    playlistName: { type: String },
    playlistUrl: { type: String },
    genres: [{ type: String }],
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

emotionHistorySchema.statics.EMOTIONS = EMOTIONS;

module.exports = mongoose.model('EmotionHistory', emotionHistorySchema);
