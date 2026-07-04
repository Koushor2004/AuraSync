import { motion } from 'framer-motion';

/**
 * Animated glowing aura ring. Wrap the webcam feed or an avatar with this
 * to visualize the currently detected/selected emotion.
 */
export default function Aura({ color = '#7c5cff', size = 320, children }) {
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* Outer soft glow */}
      <motion.div
        className="absolute inset-0 rounded-full blur-2xl"
        style={{ background: color, opacity: 0.5 }}
        animate={{ scale: [1, 1.12, 1], opacity: [0.35, 0.6, 0.35] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Rotating gradient ring */}
      <motion.div
        className="absolute inset-2 rounded-full"
        style={{
          background: `conic-gradient(from 0deg, ${color}00, ${color}, ${color}00 60%)`,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
      />
      {/* Inner card holding the actual content (webcam / avatar) */}
      <div
        className="absolute rounded-full bg-white dark:bg-surface-dark overflow-hidden flex items-center justify-center"
        style={{ inset: 14, border: `2px solid ${color}55` }}
      >
        {children}
      </div>
    </div>
  );
}
