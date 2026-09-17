
import happySvg from '../assets/happy.svg';
import sadSvg from '../assets/sad.svg';
import angrySvg from '../assets/angry.svg';
import fearfulSvg from '../assets/fearful.svg';
import neutralSvg from '../assets/neutral.svg';
import surprisedSvg from '../assets/surprised.svg';
import disgustedSvg from '../assets/disgusted.svg';
import excitedSvg from '../assets/excited.svg';
import relaxedSvg from '../assets/relaxed.svg';

export const EMOTIONS = {
  happy: { icon: happySvg, label: 'Happy', color: 'var(--e-happy)' },
  sad: { icon: sadSvg, label: 'Sad', color: 'var(--e-sad)' },
  angry: { icon: angrySvg, label: 'Angry', color: 'var(--e-angry)' },
  fearful: { icon: fearfulSvg, label: 'Fear', color: 'var(--e-fearful)' },
  neutral: { icon: neutralSvg, label: 'Neutral', color: 'var(--e-neutral)' },
  surprised: { icon: surprisedSvg, label: 'Surprised', color: 'var(--e-surprised)' },
  disgusted: { icon: disgustedSvg, label: 'Disgusted', color: 'var(--e-disgusted)' },
  excited: { icon: excitedSvg, label: 'Excited', color: 'var(--e-excited)' },
  relaxed: { icon: relaxedSvg, label: 'Relaxed', color: 'var(--e-relaxed)' },
};


export const FACE_API_TO_EMOTION = {
  happy: 'happy',
  sad: 'sad',
  angry: 'angry',
  fearful: 'fearful',
  neutral: 'neutral',
  surprised: 'surprised',
  disgusted: 'disgusted',
};

export const MANUAL_EMOTIONS = ['happy', 'sad', 'angry', 'fearful', 'neutral', 'excited', 'relaxed'];

export function resolvedColor(varString) {
  if (typeof window === 'undefined') return '#94A3B8';
  const name = varString.replace('var(', '').replace(')', '');
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#94A3B8';
}
