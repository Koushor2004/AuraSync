const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// Reads JWT from httpOnly cookie first, falls back to Authorization header
const protect = asyncHandler(async (req, res, next) => {
  let token = null;

  if (req.cookies?.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized. Please log in.');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      res.status(401);
      throw new Error('User no longer exists.');
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(401);
    throw new Error('Session invalid or expired. Please log in again.');
  }
});

module.exports = { protect };
