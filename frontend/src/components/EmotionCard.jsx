import { motion } from 'framer-motion';
import { AURA_COLORS, EMOTION_EMOJI } from '../context/EmotionContext';

export default function EmotionCard({ emotion, confidence, timestamp, playlistName }) {
  const color = AURA_COLORS[emotion] || AURA_COLORS.neutral;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-4 flex items-center gap-4"
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0"
        style={{ background: `${color}22`, border: `1px solid ${color}55` }}
      >
        {EMOTION_EMOJI[emotion] || '🙂'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium capitalize">{emotion}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {playlistName || 'No playlist recorded'}
        </p>
      </div>
      <div className="text-right shrink-0">
        {typeof confidence === 'number' && (
          <p className="text-sm font-semibold">{Math.round(confidence)}%</p>
        )}
        {timestamp && (
          <p className="text-[11px] text-gray-400">
            {new Date(timestamp).toLocaleString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        )}
      </div>
    </motion.div>
  );
}
