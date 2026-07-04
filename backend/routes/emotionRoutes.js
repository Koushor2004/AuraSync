const express = require('express');
const { logEmotion, getHistory, getStats } = require('../controllers/emotionController');
const { protect } = require('../middleware/auth');
const { emotionValidation } = require('../middleware/validators');

const router = express.Router();

router.use(protect);
router.post('/', emotionValidation, logEmotion);
router.get('/history', getHistory);
router.get('/stats', getStats);

module.exports = router;
