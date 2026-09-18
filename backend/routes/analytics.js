const express = require('express');
const asyncHandler = require('express-async-handler');
const { protect } = require('../middleware/auth');
const EmotionLog = require('../models/EmotionLog');
const Playlist = require('../models/Playlist');

const router = express.Router();

router.get(
  '/summary',
  protect,
  asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const [weekly, monthly, mostCommon, genrePlaylists] = await Promise.all([
      EmotionLog.aggregate([
        { $match: { user: userId, createdAt: { $gte: sevenDaysAgo } } },
        { $group: { _id: '$emotion', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      EmotionLog.aggregate([
        { $match: { user: userId, createdAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: {
              month: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
              emotion: '$emotion',
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.month': 1 } },
      ]),

      EmotionLog.aggregate([
        { $match: { user: userId } },
        { $group: { _id: '$emotion', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 },
      ]),
      Playlist.find({ user: userId }).select('emotion tracks.name'),
    ]);

    const genreDistribution = {};
    genrePlaylists.forEach((p) => {
      genreDistribution[p.emotion] = (genreDistribution[p.emotion] || 0) + p.tracks.length;
    });

    res.json({
      success: true,
      weeklyFrequency: weekly,
      monthlyTrend: monthly,
      mostCommonEmotion: mostCommon[0]?._id || null,
      genreDistribution,
    });
  })
);

module.exports = router;
