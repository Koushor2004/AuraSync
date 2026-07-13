const express = require('express');
const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const Playlist = require('../models/Playlist');
const {
  exchangeCodeForToken,
  refreshAccessToken,
  getSpotifyProfile,
  getRecommendationsForMood,
  searchTracks,
  createPlaylist,
  addTracksToPlaylist,
} = require('../utils/spotifyClient');

const router = express.Router();

const SCOPES = [
  'user-read-email',
  'user-read-private',
  'playlist-read-private',
  'playlist-modify-private',
  'playlist-modify-public',
].join(' ');

// Ensures req.user has a non-expired Spotify access token, refreshing if needed
async function ensureFreshToken(user) {
  const fresh = await User.findById(user._id).select('+spotify.accessToken +spotify.refreshToken');
  if (!fresh.spotify?.connected) {
    const err = new Error('Spotify is not connected for this account');
    err.statusCode = 400;
    throw err;
  }
  const isExpired = !fresh.spotify.tokenExpiresAt || new Date() >= fresh.spotify.tokenExpiresAt;
  if (isExpired) {
    const data = await refreshAccessToken(fresh.spotify.refreshToken);
    fresh.spotify.accessToken = data.access_token;
    fresh.spotify.tokenExpiresAt = new Date(Date.now() + data.expires_in * 1000);
    await fresh.save({ validateBeforeSave: false });
  }
  return fresh;
}

// @route  GET /api/spotify/login  -> redirects to Spotify consent screen
router.get('/login', protect, (req, res) => {
  const state = crypto.randomBytes(16).toString('hex');
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.SPOTIFY_CLIENT_ID,
    scope: SCOPES,
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
    state: `${state}.${req.user._id}`,
  });
  res.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`);
});

// @route  GET /api/spotify/callback  -> Spotify redirects here with ?code
router.get(
  '/callback',
  asyncHandler(async (req, res) => {
    const { code, state, error } = req.query;
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    if (error || !code || !state) {
      const errorMsg = error || 'Missing code or state';
      return res.redirect(`${clientUrl}/settings?spotify=error&message=${encodeURIComponent(errorMsg)}`);
    }

    try {
      const userId = state.split('.')[1];
      const data = await exchangeCodeForToken(code);
      const profile = await getSpotifyProfile(data.access_token);

      await User.findByIdAndUpdate(userId, {
        spotify: {
          connected: true,
          spotifyId: profile.id,
          displayName: profile.display_name,
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          tokenExpiresAt: new Date(Date.now() + data.expires_in * 1000),
        },
      });

      res.redirect(`${clientUrl}/settings?spotify=connected`);
    } catch (err) {
      console.error('Spotify Callback Error:', err.response?.data || err.message);
      const customMessage = err.response?.data?.error_description || err.response?.data?.message || err.message;
      res.redirect(`${clientUrl}/settings?spotify=error&message=${encodeURIComponent(customMessage)}`);
    }
  })
);

// @route  POST /api/spotify/disconnect
router.post(
  '/disconnect',
  protect,
  asyncHandler(async (req, res) => {
    req.user.spotify = { connected: false };
    await req.user.save({ validateBeforeSave: false });
    res.json({ success: true, message: 'Spotify disconnected' });
  })
);

const MOCK_TRACKS = {
  happy: [
    { spotifyId: 'mock_1', name: 'Walking on Sunshine', artists: 'Katrina and the Waves', albumArt: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300', externalUrl: 'https://open.spotify.com' },
    { spotifyId: 'mock_2', name: 'Happy', artists: 'Pharrell Williams', albumArt: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300', externalUrl: 'https://open.spotify.com' },
    { spotifyId: 'mock_3', name: 'Good Vibrations', artists: 'The Beach Boys', albumArt: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=300', externalUrl: 'https://open.spotify.com' },
    { spotifyId: 'mock_4', name: 'Don\'t Stop Me Now', artists: 'Queen', albumArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300', externalUrl: 'https://open.spotify.com' },
  ],
  sad: [
    { spotifyId: 'mock_5', name: 'Yesterday', artists: 'The Beatles', albumArt: 'https://images.unsplash.com/photo-1446057032654-9d8885db76c6?w=300', externalUrl: 'https://open.spotify.com' },
    { spotifyId: 'mock_6', name: 'Someone Like You', artists: 'Adele', albumArt: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=300', externalUrl: 'https://open.spotify.com' },
    { spotifyId: 'mock_7', name: 'Fix You', artists: 'Coldplay', albumArt: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300', externalUrl: 'https://open.spotify.com' },
    { spotifyId: 'mock_8', name: 'Skinny Love', artists: 'Bon Iver', albumArt: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=300', externalUrl: 'https://open.spotify.com' },
  ],
  angry: [
    { spotifyId: 'mock_9', name: 'Killing In The Name', artists: 'Rage Against The Machine', albumArt: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=300', externalUrl: 'https://open.spotify.com' },
    { spotifyId: 'mock_10', name: 'Break Stuff', artists: 'Limp Bizkit', albumArt: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300', externalUrl: 'https://open.spotify.com' },
    { spotifyId: 'mock_11', name: 'Chop Suey!', artists: 'System Of A Down', albumArt: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300', externalUrl: 'https://open.spotify.com' },
  ],
  fearful: [
    { spotifyId: 'mock_12', name: 'Intro', artists: 'The xx', albumArt: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=300', externalUrl: 'https://open.spotify.com' },
    { spotifyId: 'mock_13', name: 'Clair de Lune', artists: 'Claude Debussy', albumArt: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300', externalUrl: 'https://open.spotify.com' },
    { spotifyId: 'mock_14', name: 'Tubular Bells', artists: 'Mike Oldfield', albumArt: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=300', externalUrl: 'https://open.spotify.com' },
  ],
  neutral: [
    { spotifyId: 'mock_15', name: 'Weightless', artists: 'Marconi Union', albumArt: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300', externalUrl: 'https://open.spotify.com' },
    { spotifyId: 'mock_16', name: 'Re: Stacks', artists: 'Bon Iver', albumArt: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=300', externalUrl: 'https://open.spotify.com' },
    { spotifyId: 'mock_17', name: 'Ocean Eyes', artists: 'Billie Eilish', albumArt: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300', externalUrl: 'https://open.spotify.com' },
  ],
  surprised: [
    { spotifyId: 'mock_18', name: 'Around the World', artists: 'Daft Punk', albumArt: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300', externalUrl: 'https://open.spotify.com' },
    { spotifyId: 'mock_19', name: 'Starboy', artists: 'The Weeknd', albumArt: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300', externalUrl: 'https://open.spotify.com' },
    { spotifyId: 'mock_20', name: 'Lights', artists: 'Ellie Goulding', albumArt: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=300', externalUrl: 'https://open.spotify.com' },
  ],
  disgusted: [
    { spotifyId: 'mock_21', name: 'Anarchy in the U.K.', artists: 'Sex Pistols', albumArt: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300', externalUrl: 'https://open.spotify.com' },
    { spotifyId: 'mock_22', name: 'Basket Case', artists: 'Green Day', albumArt: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300', externalUrl: 'https://open.spotify.com' },
    { spotifyId: 'mock_23', name: 'Smells Like Teen Spirit', artists: 'Nirvana', albumArt: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=300', externalUrl: 'https://open.spotify.com' },
  ],
  excited: [
    { spotifyId: 'mock_24', name: 'Levels', artists: 'Avicii', albumArt: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300', externalUrl: 'https://open.spotify.com' },
    { spotifyId: 'mock_25', name: 'Titanium', artists: 'David Guetta ft. Sia', albumArt: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300', externalUrl: 'https://open.spotify.com' },
    { spotifyId: 'mock_26', name: 'Wake Me Up', artists: 'Avicii', albumArt: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=300', externalUrl: 'https://open.spotify.com' },
  ],
  relaxed: [
    { spotifyId: 'mock_27', name: 'Strawberry Fields Forever', artists: 'The Beatles', albumArt: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=300', externalUrl: 'https://open.spotify.com' },
    { spotifyId: 'mock_28', name: 'Teardrop', artists: 'Massive Attack', albumArt: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300', externalUrl: 'https://open.spotify.com' },
    { spotifyId: 'mock_29', name: 'Sunset Lover', artists: 'Petit Biscuit', albumArt: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300', externalUrl: 'https://open.spotify.com' },
  ]
};

function getMockTracks(emotion) {
  return MOCK_TRACKS[emotion] || MOCK_TRACKS.neutral;
}

// @route  GET /api/spotify/recommendations?emotion=happy
router.get(
  '/recommendations',
  protect,
  asyncHandler(async (req, res) => {
    const { emotion = 'neutral' } = req.query;
    let tracks = [];
    let usedFallback = false;

    try {
      if (!req.user.spotify?.connected) {
        throw new Error('Spotify not connected');
      }
      const user = await ensureFreshToken(req.user);
      tracks = await getRecommendationsForMood(user.spotify.accessToken, emotion);
    } catch (err) {
      console.warn(`[Spotify] Falling back to local recommendations for emotion "${emotion}":`, err.message);
      usedFallback = true;
      tracks = getMockTracks(emotion);
    }

    const playlist = await Playlist.create({
      user: req.user._id,
      emotion,
      name: `${emotion[0].toUpperCase()}${emotion.slice(1)} Mix · ${new Date().toLocaleDateString()}`,
      tracks,
    });

    res.json({ success: true, playlist, isDemo: usedFallback });
  })
);

// @route  GET /api/spotify/search?q=...
router.get(
  '/search',
  protect,
  asyncHandler(async (req, res) => {
    const { q } = req.query;
    if (!q) {
      res.status(400);
      throw new Error('Query parameter "q" is required');
    }
    const user = await ensureFreshToken(req.user);
    const tracks = await searchTracks(user.spotify.accessToken, q);
    res.json({ success: true, tracks });
  })
);

// @route  GET /api/spotify/playlists  -> user's saved AuraSync playlists
router.get(
  '/playlists',
  protect,
  asyncHandler(async (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const playlists = await Playlist.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit);
    res.json({ success: true, playlists });
  })
);

// @route  POST /api/spotify/playlists/:id/save  -> push to user's real Spotify account
router.post(
  '/playlists/:id/save',
  protect,
  asyncHandler(async (req, res) => {
    const playlist = await Playlist.findOne({ _id: req.params.id, user: req.user._id });
    if (!playlist) {
      res.status(404);
      throw new Error('Playlist not found');
    }
    const user = await ensureFreshToken(req.user);
    const created = await createPlaylist(
      user.spotify.accessToken,
      user.spotify.spotifyId,
      playlist.name,
      `Generated by AuraSync for mood: ${playlist.emotion}`
    );
    const uris = playlist.tracks.filter((t) => t.spotifyId).map((t) => `spotify:track:${t.spotifyId}`);
    if (uris.length) {
      await addTracksToPlaylist(user.spotify.accessToken, created.id, uris);
    }

    playlist.savedToSpotify = true;
    playlist.spotifyPlaylistId = created.id;
    await playlist.save();

    res.json({ success: true, playlist });
  })
);

module.exports = router;
