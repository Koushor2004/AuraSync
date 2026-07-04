const axios = require('axios');
const qs = require('querystring');

const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

function getAuthorizeUrl(state) {
  const params = qs.stringify({
    response_type: 'code',
    client_id: process.env.SPOTIFY_CLIENT_ID,
    scope: [
      'user-read-private',
      'user-read-email',
      'playlist-read-private',
      'playlist-modify-public',
      'playlist-modify-private',
      'user-top-read',
    ].join(' '),
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
    state,
  });
  return `${SPOTIFY_AUTH_URL}?${params}`;
}

async function exchangeCodeForToken(code) {
  const res = await axios.post(
    SPOTIFY_TOKEN_URL,
    qs.stringify({
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization:
          'Basic ' +
          Buffer.from(
            `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
          ).toString('base64'),
      },
    }
  );
  return res.data; // { access_token, refresh_token, expires_in, token_type }
}

async function refreshAccessToken(refreshToken) {
  const res = await axios.post(
    SPOTIFY_TOKEN_URL,
    qs.stringify({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization:
          'Basic ' +
          Buffer.from(
            `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
          ).toString('base64'),
      },
    }
  );
  return res.data;
}

async function searchTracksByGenres(accessToken, genres = [], limit = 12) {
  const query = genres.map((g) => `genre:"${g}"`).join(' OR ') || 'genre:"pop"';
  const res = await axios.get(`${SPOTIFY_API_BASE}/search`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    params: { q: query, type: 'track', limit },
  });
  return res.data.tracks.items;
}

async function getUserPlaylists(accessToken) {
  const res = await axios.get(`${SPOTIFY_API_BASE}/me/playlists`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    params: { limit: 20 },
  });
  return res.data.items;
}

async function getSpotifyProfile(accessToken) {
  const res = await axios.get(`${SPOTIFY_API_BASE}/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.data;
}

module.exports = {
  getAuthorizeUrl,
  exchangeCodeForToken,
  refreshAccessToken,
  searchTracksByGenres,
  getUserPlaylists,
  getSpotifyProfile,
};
