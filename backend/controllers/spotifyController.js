const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const User = require('../models/User');
const {
  getAuthorizeUrl,
  exchangeCodeForToken,
  getUserPlaylists,
  getSpotifyProfile,
} = require('../utils/spotifyService');

// @desc    Kick off Spotify OAuth - returns the URL the frontend should redirect to
// @route   POST /api/spotify/connect
// @access  Private
const connect = asyncHandler(async (req, res) => {
  const state = crypto.randomBytes(16).toString('hex') + '.' + req.user._id;
  const url = getAuthorizeUrl(state);
  res.json({ success: true, url });
});

// @desc    OAuth callback - Spotify redirects here with a code
// @route   GET /api/spotify/callback
// @access  Public (state param carries the user id)
const callback = asyncHandler(async (req, res) => {
  const { code, state } = req.query;
  if (!code || !state) {
    res.status(400);
    throw new Error('Missing code or state from Spotify callback');
  }

  const userId = state.split('.')[1];
  const tokenData = await exchangeCodeForToken(code);
  const profile = await getSpotifyProfile(tokenData.access_token);

  await User.findByIdAndUpdate(userId, {
    spotifyConnected: true,
    'spotify.accessToken': tokenData.access_token,
    'spotify.refreshToken': tokenData.refresh_token,
    'spotify.expiresAt': new Date(Date.now() + tokenData.expires_in * 1000),
    'spotify.spotifyUserId': profile.id,
  });

  res.redirect(`${process.env.CLIENT_URL}/settings?spotify=connected`);
});

// @desc    Fetch the connected user's Spotify playlists
// @route   GET /api/spotify/playlists
// @access  Private
const playlists = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+spotify.accessToken');
  if (!user.spotifyConnected || !user.spotify?.accessToken) {
    res.status(400);
    throw new Error('Spotify is not connected for this account');
  }

  const items = await getUserPlaylists(user.spotify.accessToken);
  res.json({
    success: true,
    playlists: items.map((p) => ({
      id: p.id,
      name: p.name,
      image: p.images?.[0]?.url,
      tracksTotal: p.tracks?.total,
      externalUrl: p.external_urls?.spotify,
    })),
  });
});

// @desc    Disconnect Spotify
// @route   DELETE /api/spotify/disconnect
// @access  Private
const disconnect = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    spotifyConnected: false,
    $unset: { spotify: 1 },
  });
  res.json({ success: true, message: 'Spotify disconnected' });
});

module.exports = { connect, callback, playlists, disconnect };
