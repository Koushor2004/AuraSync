const express = require('express');
const asyncHandler = require('express-async-handler');
const { body } = require('express-validator');
const User = require('../models/User');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { generateToken, sendTokenCookie } = require('../utils/generateToken');

const router = express.Router();

router.post('/register',
  [
    body('name').trim().isLength({ min: 2, max: 60 }).withMessage('Name must be 2-60 characters'),
    body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/\d/)
      .withMessage('Password must contain a number'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      res.status(409);
      throw new Error('An account with this email already exists');
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);
    sendTokenCookie(res, token);

    res.status(201).json({ success: true, token, user: user.toSafeObject() });
  })
);


router.post('/login',
  [
    body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    user.lastActiveAt = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);
    sendTokenCookie(res, token);

    res.json({ success: true, token, user: user.toSafeObject() });
  })
);


router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out' });
});

router.get('/me',
  protect,
  asyncHandler(async (req, res) => {
    res.json({ success: true, user: req.user.toSafeObject() });
  })
);

router.delete('/account',
  protect,
  asyncHandler(async (req, res) => {
    const EmotionLog = require('../models/EmotionLog');
    const Playlist = require('../models/Playlist');
    await Promise.all([
      EmotionLog.deleteMany({ user: req.user._id }),
      Playlist.deleteMany({ user: req.user._id }),
      req.user.deleteOne(),
    ]);
    res.clearCookie('token');
    res.json({ success: true, message: 'Account and all associated data deleted' });
  })
);

module.exports = router;
