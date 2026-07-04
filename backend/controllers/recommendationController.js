const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { getRecommendationProfile } = require('../utils/recommendationEngine');
const { searchTracksByGenres } = require('../utils/spotifyService');

// @desc    Get music recommendations for a given emotion
// @route   GET /api/recommendations?emotion=happy
// @access  Private
const getRecommendations = asyncHandler(async (req, res) => {
  const { emotion } = req.query;
  if (!emotion) {
    res.status(400);
    throw new Error('Query param "emotion" is required');
  }

  const profile = getRecommendationProfile(emotion);
  const user = await User.findById(req.user._id).select('+spotify.accessToken');

  // If Spotify is connected, fetch live tracks. Otherwise return the genre profile only
  // so the frontend can still render a meaningful recommendation card.
  if (user?.spotifyConnected && user.spotify?.accessToken) {
    try {
      const tracks = await searchTracksByGenres(user.spotify.accessToken, profile.genres, 12);
      return res.json({
        success: true,
        emotion,
        aura: { color: profile.color, emoji: profile.emoji },
        genres: profile.genres,
        tracks: tracks.map((t) => ({
          id: t.id,
          name: t.name,
          artists: t.artists.map((a) => a.name).join(', '),
          albumArt: t.album?.images?.[0]?.url,
          previewUrl: t.preview_url,
          externalUrl: t.external_urls?.spotify,
        })),
      });
    } catch (err) {
      // Fall through to genre-only response if Spotify call fails (e.g. expired token)
    }
  }

  res.json({
    success: true,
    emotion,
    aura: { color: profile.color, emoji: profile.emoji },
    genres: profile.genres,
    tracks: [],
    note: 'Connect Spotify to get live track recommendations.',
  });
});

module.exports = { getRecommendations };
