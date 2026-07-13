// Mirrors backend/config/emotions.js so the UI can render instantly
// without waiting on a network round trip.
export const EMOTIONS = {
  happy: { emoji: '😄', color: 'var(--e-happy)', label: 'Happy' },
  sad: { emoji: '😔', color: 'var(--e-sad)', label: 'Sad' },
  angry: { emoji: '😠', color: 'var(--e-angry)', label: 'Angry' },
  fearful: { emoji: '😨', color: 'var(--e-fearful)', label: 'Fear' },
  neutral: { emoji: '😐', color: 'var(--e-neutral)', label: 'Neutral' },
  surprised: { emoji: '😲', color: 'var(--e-surprised)', label: 'Surprised' },
  disgusted: { emoji: '🤢', color: 'var(--e-disgusted)', label: 'Disgusted' },
  excited: { emoji: '🤩', color: 'var(--e-excited)', label: 'Excited' },
  relaxed: { emoji: '😌', color: 'var(--e-relaxed)', label: 'Relaxed' },
};

// face-api.js expression labels -> our canon keys
export const FACE_API_TO_EMOTION = {
  happy: 'happy',
  sad: 'sad',
  angry: 'angry',
  fearful: 'fearful',
  neutral: 'neutral',
  surprised: 'surprised',
  disgusted: 'disgusted',
};

// Emotions available for manual selection (camera can only detect the 7 above)
export const MANUAL_EMOTIONS = ['happy', 'sad', 'angry', 'fearful', 'neutral', 'excited', 'relaxed'];

export function resolvedColor(varString) {
  if (typeof window === 'undefined') return '#94A3B8';
  const name = varString.replace('var(', '').replace(')', '');
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#94A3B8';
}
