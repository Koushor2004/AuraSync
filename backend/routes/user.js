const express = require('express');
const asyncHandler = require('express-async-handler');
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// @route  PATCH /api/user/theme
router.patch(
  '/theme',
  protect,
  [body('theme').isIn(['dark', 'light']).withMessage('Theme must be dark or light')],
  validate,
  asyncHandler(async (req, res) => {
    req.user.theme = req.body.theme;
    await req.user.save({ validateBeforeSave: false });
    res.json({ success: true, theme: req.user.theme });
  })
);

// @route  PATCH /api/user/profile
router.patch(
  '/profile',
  protect,
  [body('name').optional().trim().isLength({ min: 2, max: 60 })],
  validate,
  asyncHandler(async (req, res) => {
    if (req.body.name) req.user.name = req.body.name;
    await req.user.save({ validateBeforeSave: false });
    res.json({ success: true, user: req.user.toSafeObject() });
  })
);

module.exports = router;
