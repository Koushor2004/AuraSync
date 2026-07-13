const axios = require('axios');
const { MOOD_TO_SPOTIFY_PARAMS } = require('../config/emotions');

const SPOTIFY_ACCOUNTS_URL = 'https://accounts.spotify.com';
const SPOTIFY_API_URL = 'https://api.spotify.com/v1';

const basicAuthHeader = () => {
  const creds = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString('base64');
  return `Basic ${creds}`;
};

// Exchanges the OAuth authorization code for access/refresh tokens
async function exchangeCodeForToken(code) {
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
  });
  const { data } = await axios.post(`${SPOTIFY_ACCOUNTS_URL}/api/token`, params, {
    headers: {
      Authorization: basicAuthHeader(),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  return data; // { access_token, refresh_token, expires_in, ... }
}

async function refreshAccessToken(refreshToken) {
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });
  const { data } = await axios.post(`${SPOTIFY_ACCOUNTS_URL}/api/token`, params, {
    headers: {
      Authorization: basicAuthHeader(),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  return data; // { access_token, expires_in, ... }
}

async function getSpotifyProfile(accessToken) {
  const { data } = await axios.get(`${SPOTIFY_API_URL}/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data;
}

// Uses the recommendations endpoint seeded with mood-mapped audio features
async function getRecommendationsForMood(accessToken, emotion, limit = 12) {
  const params = MOOD_TO_SPOTIFY_PARAMS[emotion] || MOOD_TO_SPOTIFY_PARAMS.neutral;
  const { data } = await axios.get(`${SPOTIFY_API_URL}/recommendations`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    params: { limit, ...params },
  });
  return data.tracks.map(mapTrack);
}

async function searchTracks(accessToken, query, limit = 15) {
  const { data } = await axios.get(`${SPOTIFY_API_URL}/search`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    params: { q: query, type: 'track', limit },
  });
  return data.tracks.items.map(mapTrack);
}

async function createPlaylist(accessToken, spotifyUserId, name, description) {
  const { data } = await axios.post(
    `${SPOTIFY_API_URL}/users/${spotifyUserId}/playlists`,
    { name, description, public: false },
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  return data;
}

async function addTracksToPlaylist(accessToken, playlistId, uris) {
  const { data } = await axios.post(
    `${SPOTIFY_API_URL}/playlists/${playlistId}/tracks`,
    { uris },
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  return data;
}

function mapTrack(t) {
  return {
    spotifyId: t.id,
    name: t.name,
    artists: (t.artists || []).map((a) => a.name).join(', '),
    albumArt: t.album?.images?.[0]?.url || null,
    previewUrl: t.preview_url,
    externalUrl: t.external_urls?.spotify,
  };
}

module.exports = {
  exchangeCodeForToken,
  refreshAccessToken,
  getSpotifyProfile,
  getRecommendationsForMood,
  searchTracks,
  createPlaylist,
  addTracksToPlaylist,
};
