import { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import WeeklyChart from '../components/Charts/WeeklyChart';
import GenreChart from '../components/Charts/GenreChart';
import { SkeletonCard } from '../components/Skeleton';
import { emotionApi } from '../api/endpoints';
import { EMOTION_EMOJI, AURA_COLORS } from '../context/EmotionContext';

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const reportRef = useRef(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await emotionApi.stats();
      setStats(data);
    } catch {
      toast.error('Could not load analytics');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!stats) return;
    const doc = new jsPDF();
    const margin = 16;
    let y = margin;

    doc.setFontSize(18);
    doc.text('AuraSync — Emotion Report', margin, y);
    y += 10;

    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleString()}`, margin, y);
    y += 10;

    doc.setFontSize(13);
    doc.text(
      `Most common emotion: ${stats.mostCommonEmotion ? stats.mostCommonEmotion : 'N/A'}`,
      margin,
      y
    );
    y += 10;

    doc.setFontSize(13);
    doc.text('Monthly check-ins:', margin, y);
    y += 8;
    doc.setFontSize(10);
    stats.monthly.forEach((day) => {
      doc.text(`${day._id}: ${day.count} check-in(s)`, margin + 4, y);
      y += 6;
      if (y > 270) {
        doc.addPage();
        y = margin;
      }
    });

    y += 6;
    doc.setFontSize(13);
    doc.text('Genre distribution:', margin, y);
    y += 8;
    doc.setFontSize(10);
    stats.genreDistribution.forEach((g) => {
      doc.text(`${g._id}: ${g.count}`, margin + 4, y);
      y += 6;
      if (y > 270) {
        doc.addPage();
        y = margin;
      }
    });

    doc.save('aurasync-emotion-report.pdf');
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <SkeletonCard />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6" ref={reportRef}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Patterns in your mood and listening habits.
          </p>
        </div>
        <button onClick={downloadReport} className="btn-secondary text-sm">
          Download PDF Report
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6 flex items-center gap-4"
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
          style={{
            background: `${AURA_COLORS[stats?.mostCommonEmotion] || AURA_COLORS.neutral}22`,
          }}
        >
          {EMOTION_EMOJI[stats?.mostCommonEmotion] || '🙂'}
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Most common emotion</p>
          <p className="text-xl font-semibold capitalize">{stats?.mostCommonEmotion || 'N/A'}</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="font-semibold mb-4">Weekly emotion frequency</h2>
          <div className="h-64">
            <WeeklyChart data={stats?.weekly || []} />
          </div>
        </div>
        <div className="card p-6">
          <h2 className="font-semibold mb-4">Genre distribution</h2>
          <div className="h-64">
            <GenreChart data={stats?.genreDistribution || []} />
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold mb-4">Monthly mood trend</h2>
        {stats?.monthly?.length ? (
          <div className="flex gap-1 overflow-x-auto pb-2">
            {stats.monthly.map((day) => (
              <div
                key={day._id}
                className="flex flex-col items-center gap-1 min-w-[36px]"
                title={`${day._id}: ${day.count} check-ins`}
              >
                <div
                  className="w-6 rounded-full bg-brand-500/80"
                  style={{ height: `${Math.min(day.count * 14, 80)}px` }}
                />
                <span className="text-[10px] text-gray-400 rotate-0">
                  {day._id.slice(5)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Not enough data yet for a monthly trend.
          </p>
        )}
      </div>
    </div>
  );
}
