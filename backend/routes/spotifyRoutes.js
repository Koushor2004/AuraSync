const express = require('express');
const { connect, callback, playlists, disconnect } = require('../controllers/spotifyController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/connect', protect, connect);
router.get('/callback', callback);
router.get('/playlists', protect, playlists);
router.delete('/disconnect', protect, disconnect);

module.exports = router;
