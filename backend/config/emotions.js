// Central source of truth for emotion metadata, reused across models/routes.
// Kept on the backend so the frontend can fetch it via /api/emotion/meta
// and both sides always agree on the canon.

const EMOTIONS = {
  happy:      { emoji: '😄', color: '#F5C242', label: 'Happy' },
  sad:        { emoji: '😔', color: '#4A90D9', label: 'Sad' },
  angry:      { emoji: '😠', color: '#E5484D', label: 'Angry' },
  fearful:    { emoji: '😨', color: '#8B5CF6', label: 'Fear' },
  neutral:    { emoji: '😐', color: '#94A3B8', label: 'Neutral' },
  surprised:  { emoji: '😲', color: '#F97316', label: 'Surprised' },
  disgusted:  { emoji: '🤢', color: '#22C55E', label: 'Disgusted' },
  excited:    { emoji: '🤩', color: '#EC4899', label: 'Excited' },
  relaxed:    { emoji: '😌', color: '#2DD4BF', label: 'Relaxed' },
};

// Maps a detected/selected emotion to Spotify recommendation seed parameters.
const MOOD_TO_SPOTIFY_PARAMS = {
  happy:     { seed_genres: 'pop,dance',        target_valence: 0.85, target_energy: 0.7,  target_tempo: 120 },
  sad:       { seed_genres: 'acoustic,piano',    target_valence: 0.2,  target_energy: 0.25, target_tempo: 75 },
  angry:     { seed_genres: 'metal,rock',        target_valence: 0.3,  target_energy: 0.9,  target_tempo: 140 },
  fearful:   { seed_genres: 'ambient,classical',  target_valence: 0.25, target_energy: 0.3,  target_tempo: 80 },
  neutral:   { seed_genres: 'chill,indie',       target_valence: 0.5,  target_energy: 0.5,  target_tempo: 100 },
  surprised: { seed_genres: 'electronic,pop',    target_valence: 0.7,  target_energy: 0.8,  target_tempo: 128 },
  disgusted: { seed_genres: 'punk,alt-rock',     target_valence: 0.3,  target_energy: 0.6,  target_tempo: 110 },
  excited:   { seed_genres: 'edm,dance-pop',     target_valence: 0.9,  target_energy: 0.95, target_tempo: 132 },
  relaxed:   { seed_genres: 'chill,lo-fi',       target_valence: 0.6,  target_energy: 0.3,  target_tempo: 85 },
};

const EMOTION_KEYS = Object.keys(EMOTIONS);

module.exports = { EMOTIONS, MOOD_TO_SPOTIFY_PARAMS, EMOTION_KEYS };
