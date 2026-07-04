const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const EmotionHistory = require('../models/EmotionHistory');

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user.toSafeObject() });
});

// @desc    Update user profile (name, preferences)
// @route   PUT /api/user/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const { name, theme, notifications } = req.body;

  if (name) req.user.name = name;
  if (theme) req.user.preferences.theme = theme;
  if (typeof notifications === 'boolean') req.user.preferences.notifications = notifications;

  await req.user.save();

  res.json({ success: true, user: req.user.toSafeObject() });
});

// @desc    Delete account and all associated data
// @route   DELETE /api/user/account
// @access  Private
const deleteAccount = asyncHandler(async (req, res) => {
  await EmotionHistory.deleteMany({ userId: req.user._id });
  await User.findByIdAndDelete(req.user._id);
  res.json({ success: true, message: 'Account and associated data deleted' });
});

module.exports = { getProfile, updateProfile, deleteAccount };
