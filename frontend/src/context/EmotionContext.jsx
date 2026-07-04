import { createContext, useContext, useState } from 'react';

export const AURA_COLORS = {
  happy: '#FFD93D',
  sad: '#4D96FF',
  angry: '#FF4D4D',
  neutral: '#E5E7EB',
  fear: '#9B5DE5',
  excited: '#FF8A00',
  relaxed: '#4CD97B',
  surprised: '#00C2A8',
  disgusted: '#8D6E63',
};

export const EMOTION_EMOJI = {
  happy: '😊',
  sad: '😢',
  angry: '😠',
  neutral: '😐',
  fear: '😨',
  excited: '🤩',
  relaxed: '😴',
  surprised: '😲',
  disgusted: '🤢',
};

const EmotionContext = createContext(null);

export function EmotionProvider({ children }) {
  const [currentEmotion, setCurrentEmotion] = useState('neutral');
  const [confidence, setConfidence] = useState(0);
  const [source, setSource] = useState('manual');

  const setEmotion = (emotion, conf = 100, src = 'manual') => {
    setCurrentEmotion(emotion);
    setConfidence(conf);
    setSource(src);
  };

  const auraColor = AURA_COLORS[currentEmotion] || AURA_COLORS.neutral;
  const emoji = EMOTION_EMOJI[currentEmotion] || EMOTION_EMOJI.neutral;

  return (
    <EmotionContext.Provider
      value={{ currentEmotion, confidence, source, setEmotion, auraColor, emoji }}
    >
      {children}
    </EmotionContext.Provider>
  );
}

export const useEmotion = () => {
  const ctx = useContext(EmotionContext);
  if (!ctx) throw new Error('useEmotion must be used within EmotionProvider');
  return ctx;
};
