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
  return data;
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
  return data;
}

async function getSpotifyProfile(accessToken) {
  const { data } = await axios.get(`${SPOTIFY_API_URL}/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data;
}

async function getRecommendationsForMood(accessToken, emotion, limit = 12, market) {
  const params = { ...MOOD_TO_SPOTIFY_PARAMS[emotion] || MOOD_TO_SPOTIFY_PARAMS.neutral };
  if (market) params.market = market;

  if (market === 'IN') {
    params.seed_genres = 'indian,bollywood';
  } else if (market === 'JP') {
    params.seed_genres = 'j-pop,j-rock';
  } else if (market === 'KR') {
    params.seed_genres = 'k-pop';
  } else if (market === 'ES') {
    params.seed_genres = 'latin,spanish';
  }

  const { data } = await axios.get(`${SPOTIFY_API_URL}/recommendations`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    params: { limit, ...params },
  });
  return data.tracks.map(mapTrack);
}

async function searchTracks(accessToken, query, limit = 10, market) {
  const params = { q: query, type: 'track', limit };
  if (market) params.market = market;

  const { data } = await axios.get(`${SPOTIFY_API_URL}/search`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    params,
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

const FALLBACK_PREVIEWS = [
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
];

function getFallbackPreview(spotifyId) {
  if (!spotifyId) return FALLBACK_PREVIEWS[0];
  let hash = 0;
  for (let i = 0; i < spotifyId.length; i++) {
    hash = spotifyId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % FALLBACK_PREVIEWS.length;
  return FALLBACK_PREVIEWS[index];
}

function mapTrack(t) {
  return {
    spotifyId: t.id,
    name: t.name,
    artists: (t.artists || []).map((a) => a.name).join(', '),
    albumArt: t.album?.images?.[0]?.url || null,
    previewUrl: t.preview_url || getFallbackPreview(t.id),
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
