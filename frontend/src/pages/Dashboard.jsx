import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useEmotion, AURA_COLORS, EMOTION_EMOJI } from '../context/EmotionContext';
import EmotionDetector from '../components/EmotionDetector';
import MoodSelector from '../components/MoodSelector';
import EmotionCard from '../components/EmotionCard';
import PlaylistCard from '../components/PlaylistCard';
import { SkeletonGrid } from '../components/Skeleton';
import { emotionApi, recommendationApi } from '../api/endpoints';

export default function Dashboard() {
  const { user } = useAuth();
  const { currentEmotion, confidence, setEmotion, auraColor } = useEmotion();
  const [mode, setMode] = useState('camera'); // 'camera' | 'manual'
  const [recent, setRecent] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [loadingTracks, setLoadingTracks] = useState(false);

  useEffect(() => {
    loadRecent();
  }, []);

  const loadRecent = async () => {
    try {
      const { data } = await emotionApi.history(1, 5);
      setRecent(data.items);
    } catch {
      // non-blocking
    }
  };

  const handleCommit = async (emotion, conf, source) => {
    setEmotion(emotion, conf, source);
    setLoadingTracks(true);
    try {
      const [recRes] = await Promise.all([
        recommendationApi.get(emotion),
        emotionApi.log({ emotion, confidence: conf, source }),
      ]);
      setTracks(recRes.data.tracks || []);
      loadRecent();
      toast.success(`Mood logged: ${emotion}`);
    } catch (err) {
      toast.error('Could not fetch recommendations');
    } finally {
      setLoadingTracks(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="animate-fadeUp">
        <h1 className="text-2xl font-bold">
          Welcome back, {user?.name?.split(' ')[0]} <span>{EMOTION_EMOJI[currentEmotion]}</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Let AuraSync read your mood and curate music that fits it.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Detection panel */}
        <div className="lg:col-span-1 card p-6 flex flex-col items-center gap-6">
          <div className="flex gap-2 self-stretch">
            <button
              onClick={() => setMode('camera')}
              className={`flex-1 text-sm py-2 rounded-lg font-medium ${
                mode === 'camera'
                  ? 'bg-brand-600 text-white'
                  : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300'
              }`}
            >
              Camera
            </button>
            <button
              onClick={() => setMode('manual')}
              className={`flex-1 text-sm py-2 rounded-lg font-medium ${
                mode === 'manual'
                  ? 'bg-brand-600 text-white'
                  : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300'
              }`}
            >
              Manual
            </button>
          </div>

          <AnimatePresence mode="wait">
            {mode === 'camera' ? (
              <motion.div
                key="camera"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full flex flex-col items-center gap-4"
              >
                <EmotionDetector
                  onDetect={({ emotion, confidence: c, source }) => handleCommit(emotion, c, source)}
                />
              </motion.div>
            ) : (
              <motion.div
                key="manual"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full space-y-4"
              >
                <MoodSelector
                  selected={currentEmotion}
                  onSelect={(mood) => handleCommit(mood, 100, 'manual')}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Recommendations panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Recommended for you</h2>
              <span
                className="text-xs font-medium px-3 py-1 rounded-full capitalize"
                style={{ background: `${auraColor}22`, color: auraColor }}
              >
                {currentEmotion} · {Math.round(confidence)}%
              </span>
            </div>

            {loadingTracks ? (
              <SkeletonGrid count={6} />
            ) : tracks.length ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {tracks.map((t) => (
                  <PlaylistCard key={t.id} track={t} />
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 dark:text-gray-400 py-10 text-center">
                Connect Spotify in Settings, or pick a mood to see genre suggestions.
              </div>
            )}
          </div>

          <div className="card p-6">
            <h2 className="font-semibold mb-4">Recent check-ins</h2>
            <div className="space-y-3">
              {recent.length ? (
                recent.map((item) => (
                  <EmotionCard
                    key={item._id}
                    emotion={item.emotion}
                    confidence={item.confidence}
                    timestamp={item.timestamp}
                    playlistName={item.playlistName}
                  />
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No check-ins yet — your mood history will show up here.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
