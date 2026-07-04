import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import EmotionCard from '../components/EmotionCard';
import { SkeletonCard } from '../components/Skeleton';
import { emotionApi } from '../api/endpoints';

export default function History() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load(1);
  }, []);

  const load = async (page) => {
    setLoading(true);
    try {
      const { data } = await emotionApi.history(page, 10);
      setItems(data.items);
      setPagination(data.pagination);
    } catch {
      toast.error('Could not load history');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Emotion History</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Every mood check-in, camera or manual, lives here.
        </p>
      </div>

      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
        ) : items.length ? (
          items.map((item) => (
            <EmotionCard
              key={item._id}
              emotion={item.emotion}
              confidence={item.confidence}
              timestamp={item.timestamp}
              playlistName={item.playlistName}
            />
          ))
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-10">
            No entries yet. Log a mood from your dashboard to get started.
          </p>
        )}
      </div>

      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          {Array.from({ length: pagination.pages }).map((_, i) => (
            <button
              key={i}
              onClick={() => load(i + 1)}
              className={`w-9 h-9 rounded-lg text-sm font-medium ${
                pagination.page === i + 1
                  ? 'bg-brand-600 text-white'
                  : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
