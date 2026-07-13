const express = require('express');
const asyncHandler = require('express-async-handler');
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const EmotionLog = require('../models/EmotionLog');
const { EMOTIONS, EMOTION_KEYS } = require('../config/emotions');

const router = express.Router();

// @route  GET /api/emotion/meta  (public metadata: colors/emoji/labels)
router.get('/meta', (req, res) => {
  res.json({ success: true, emotions: EMOTIONS });
});

// @route  POST /api/emotion/log
router.post(
  '/log',
  protect,
  [
    body('emotion').isIn(EMOTION_KEYS).withMessage('Unknown emotion'),
    body('source').isIn(['camera', 'manual']).withMessage('Source must be camera or manual'),
    body('confidence').optional().isFloat({ min: 0, max: 100 }),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { emotion, source, confidence } = req.body;

    const log = await EmotionLog.create({
      user: req.user._id,
      emotion,
      source,
      confidence: confidence ?? 100,
    });

    req.user.currentEmotion = emotion;
    req.user.currentAura = EMOTIONS[emotion]?.color || '#94A3B8';
    req.user.lastActiveAt = new Date();
    await req.user.save({ validateBeforeSave: false });

    res.status(201).json({ success: true, log, aura: req.user.currentAura });
  })
);

// @route  GET /api/emotion/history?limit=20
router.get(
  '/history',
  protect,
  asyncHandler(async (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 20, 200);
    const logs = await EmotionLog.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit);
    res.json({ success: true, logs });
  })
);

module.exports = router;
