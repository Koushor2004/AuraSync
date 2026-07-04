const asyncHandler = require('express-async-handler');
const EmotionHistory = require('../models/EmotionHistory');
const { getRecommendationProfile } = require('../utils/recommendationEngine');

// @desc    Log a detected/selected emotion
// @route   POST /api/emotions
// @access  Private
const logEmotion = asyncHandler(async (req, res) => {
  const { emotion, confidence, source, playlistName, playlistUrl } = req.body;
  const profile = getRecommendationProfile(emotion);

  const entry = await EmotionHistory.create({
    userId: req.user._id,
    emotion,
    confidence: confidence ?? 100,
    source: source || 'manual',
    playlistName,
    playlistUrl,
    genres: profile.genres,
  });

  res.status(201).json({ success: true, entry, aura: { color: profile.color, emoji: profile.emoji } });
});

// @desc    Get paginated emotion history for the user
// @route   GET /api/emotions/history
// @access  Private
const getHistory = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    EmotionHistory.find({ userId: req.user._id })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit),
    EmotionHistory.countDocuments({ userId: req.user._id }),
  ]);

  res.json({
    success: true,
    items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// @desc    Get aggregate stats for analytics dashboard
// @route   GET /api/emotions/stats
// @access  Private
const getStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [weekly, monthly, mostCommon, genreDistribution] = await Promise.all([
    EmotionHistory.aggregate([
      { $match: { userId, timestamp: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dayOfWeek: '$timestamp' },
          count: { $sum: 1 },
        },
      },
    ]),
    EmotionHistory.aggregate([
      { $match: { userId, timestamp: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          count: { $sum: 1 },
          emotions: { $push: '$emotion' },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    EmotionHistory.aggregate([
      { $match: { userId } },
      { $group: { _id: '$emotion', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]),
    EmotionHistory.aggregate([
      { $match: { userId } },
      { $unwind: { path: '$genres', preserveNullAndEmptyArrays: false } },
      { $group: { _id: '$genres', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
  ]);

  res.json({
    success: true,
    weekly,
    monthly,
    mostCommonEmotion: mostCommon[0]?._id || null,
    genreDistribution,
  });
});

module.exports = { logEmotion, getHistory, getStats };
