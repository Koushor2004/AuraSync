const { body, validationResult } = require('express-validator');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array(),
    });
  }
  next();
};

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  handleValidation,
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidation,
];

const emotionValidation = [
  body('emotion')
    .isIn([
      'happy',
      'sad',
      'angry',
      'fear',
      'neutral',
      'surprised',
      'disgusted',
      'excited',
      'relaxed',
    ])
    .withMessage('Invalid emotion value'),
  body('confidence').optional().isFloat({ min: 0, max: 100 }),
  body('source').optional().isIn(['camera', 'manual']),
  handleValidation,
];

module.exports = { registerValidation, loginValidation, emotionValidation, handleValidation };
