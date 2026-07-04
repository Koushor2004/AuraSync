// Maps a detected/selected emotion to Spotify search seed genres and a display aura color.
const EMOTION_MAP = {
  happy: { genres: ['pop', 'dance', 'feel-good'], color: '#FFD93D', emoji: '😊' },
  sad: { genres: ['acoustic', 'piano', 'chill'], color: '#4D96FF', emoji: '😢' },
  angry: { genres: ['rock', 'metal', 'hip-hop'], color: '#FF4D4D', emoji: '😠' },
  fear: { genres: ['ambient', 'lo-fi'], color: '#9B5DE5', emoji: '😨' },
  neutral: { genres: ['pop', 'indie', 'chill'], color: '#E5E7EB', emoji: '😐' },
  surprised: { genres: ['pop', 'electronic'], color: '#00C2A8', emoji: '😲' },
  disgusted: { genres: ['punk', 'alternative'], color: '#8D6E63', emoji: '🤢' },
  excited: { genres: ['edm', 'party', 'dance'], color: '#FF8A00', emoji: '🤩' },
  relaxed: { genres: ['chill', 'jazz', 'lo-fi'], color: '#4CD97B', emoji: '😴' },
};

function getRecommendationProfile(emotion) {
  const key = String(emotion || '').toLowerCase();
  return EMOTION_MAP[key] || EMOTION_MAP.neutral;
}

module.exports = { EMOTION_MAP, getRecommendationProfile };
