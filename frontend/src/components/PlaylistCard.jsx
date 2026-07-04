import { motion } from 'framer-motion';

export default function PlaylistCard({ track }) {
  return (
    <motion.a
      href={track.externalUrl}
      target="_blank"
      rel="noreferrer"
      whileHover={{ y: -4 }}
      className="card overflow-hidden group"
    >
      <div className="aspect-square bg-gray-100 dark:bg-white/5 overflow-hidden">
        {track.albumArt ? (
          <img
            src={track.albumArt}
            alt={track.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl">🎵</div>
        )}
      </div>
      <div className="p-3">
        <p className="font-medium text-sm truncate">{track.name}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{track.artists}</p>
      </div>
    </motion.a>
  );
}
