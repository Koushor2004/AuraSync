import { motion } from 'framer-motion';
import { AURA_COLORS } from '../context/EmotionContext';

const MOODS = [
  { key: 'happy', label: 'Happy', emoji: '😊' },
  { key: 'sad', label: 'Sad', emoji: '😢' },
  { key: 'angry', label: 'Angry', emoji: '😠' },
  { key: 'fear', label: 'Fear', emoji: '😨' },
  { key: 'neutral', label: 'Neutral', emoji: '😐' },
  { key: 'excited', label: 'Excited', emoji: '🤩' },
  { key: 'relaxed', label: 'Relaxed', emoji: '😴' },
];

export default function MoodSelector({ selected, onSelect }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {MOODS.map((mood) => {
        const isActive = selected === mood.key;
        return (
          <motion.button
            key={mood.key}
            onClick={() => onSelect(mood.key)}
            whileTap={{ scale: 0.95 }}
            className={`card flex flex-col items-center gap-2 py-4 transition-all ${
              isActive ? 'ring-2' : 'hover:-translate-y-0.5'
            }`}
            style={isActive ? { borderColor: AURA_COLORS[mood.key], ringColor: AURA_COLORS[mood.key] } : {}}
          >
            <span className="text-3xl">{mood.emoji}</span>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{mood.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
