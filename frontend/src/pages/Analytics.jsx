import React, { useEffect, useRef, useState } from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import api from '../utils/api.js';
import { EMOTIONS } from '../utils/emotions.js';
import PageHeader from '../components/PageHeader.jsx';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend);

export default function Analytics() {
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [s, h] = await Promise.all([
          api.get('/analytics/summary'),
          api.get('/emotion/history?limit=100'),
        ]);
        setSummary(s.data);
        setHistory(h.data.logs);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load analytics.');
      }
    })();
  }, []);

  const exportPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('AuraSync — Emotion & Audio Analytics Report', 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(`Generated ${new Date().toLocaleString()}`, 14, 27);

    if (summary?.mostCommonEmotion) {
      doc.setTextColor(30);
      doc.setFontSize(12);
      doc.text(`Most common emotion: ${EMOTIONS[summary.mostCommonEmotion]?.label || summary.mostCommonEmotion}`, 14, 38);
    }

    autoTable(doc, {
      startY: 46,
      head: [['Date', 'Emotion', 'Source', 'Confidence']],
      body: (history || []).map((h) => [
        new Date(h.createdAt).toLocaleString(),
        EMOTIONS[h.emotion]?.label || h.emotion,
        h.source,
        h.source === 'camera' ? `${Math.round(h.confidence)}%` : '—',
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [97, 153, 246] },
    });

    doc.save('aurasync-emotion-report.pdf');
  };

  if (error) {
    return (
      <div className="page">
        <PageHeader eyebrow="TRENDS & ANALYTICS" title="Your mood, mapped" />
        <div className="form-alert">{error}</div>
      </div>
    );
  }

  const weeklyLabels = summary?.weeklyFrequency?.map((w) => EMOTIONS[w._id]?.label || w._id) || [];
  const weeklyData = summary?.weeklyFrequency?.map((w) => w.count) || [];
  const weeklyColors = summary?.weeklyFrequency?.map((w) => resolveVar(EMOTIONS[w._id]?.color)) || [];

  const months = [...new Set((summary?.monthlyTrend || []).map((m) => m._id.month))];
  const emotionsInTrend = [...new Set((summary?.monthlyTrend || []).map((m) => m._id.emotion))];
  const monthlyDatasets = emotionsInTrend.map((emo) => ({
    label: EMOTIONS[emo]?.label || emo,
    data: months.map((month) => {
      const match = summary.monthlyTrend.find((m) => m._id.month === month && m._id.emotion === emo);
      return match ? match.count : 0;
    }),
    borderColor: resolveVar(EMOTIONS[emo]?.color),
    backgroundColor: resolveVar(EMOTIONS[emo]?.color),
    tension: 0.35,
  }));

  const genreLabels = Object.keys(summary?.genreDistribution || {}).map((k) => EMOTIONS[k]?.label || k);
  const genreData = Object.values(summary?.genreDistribution || {});
  const genreColors = Object.keys(summary?.genreDistribution || {}).map((k) => resolveVar(EMOTIONS[k]?.color));

  return (
    <div className="page">
      <PageHeader
        eyebrow="TRENDS & ANALYTICS"
        title="Your mood, mapped"
        subtitle="Frequency, trends, and audio features your aura leans toward."
        actions={
          <button className="btn btn-secondary" onClick={exportPdf} disabled={!history}>
            Download PDF Report
          </button>
        }
      />

      {!summary ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
          <div className="skeleton" style={{ height: 280 }} />
          <div className="skeleton" style={{ height: 280 }} />
          <div className="skeleton" style={{ height: 280 }} />
          <div className="skeleton" style={{ height: 280 }} />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
          <div className="card">
            <span className="card-title">WEEKLY EMOTION FREQUENCY</span>
            {weeklyData.length ? (
              <div style={{ maxWidth: 500, margin: '0 auto', height: 220 }}>
                <Bar
                  data={{
                    labels: weeklyLabels,
                    datasets: [{ label: 'Scans', data: weeklyData, backgroundColor: weeklyColors, borderRadius: 6 }],
                  }}
                  options={chartOptions()}
                  height={220}
                />
              </div>
            ) : (
              <EmptyChart label="No scans in the last 7 days" />
            )}
          </div>

          <div className="card">
            <span className="card-title">DOMINANT EMOTIONAL STATE</span>
            {summary.mostCommonEmotion ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '32px 12px' }}>
                <div style={{ fontSize: 60 }}>{EMOTIONS[summary.mostCommonEmotion]?.emoji}</div>
                <div>
                  <div style={{ fontSize: 26, fontWeight: 400, color: 'var(--color-carbon-vellum)' }}>
                    {EMOTIONS[summary.mostCommonEmotion]?.label}
                  </div>
                  <div style={{ color: 'var(--color-smoke)', fontSize: 14, marginTop: 4 }}>
                    Your most frequently logged mood across sessions
                  </div>
                </div>
              </div>
            ) : (
              <EmptyChart label="Not enough data yet" />
            )}
          </div>

          <div className="card">
            <span className="card-title">MONTHLY MOOD TREND</span>
            <div style={{ maxWidth: 500, margin: '0 auto', height: 220 }}>
              {monthlyDatasets.length ? (
                <Line data={{ labels: months, datasets: monthlyDatasets }} options={chartOptions()} height={220} />
              ) : (
                <EmptyChart label="No history in the last 6 months" />
              )}
            </div>
          </div>

          <div className="card">
            <span className="card-title">GENRE & AUDIO DISTRIBUTION</span>
            {genreData.length ? (
              <div style={{ maxWidth: 500, margin: '0 auto', height: 220 }}>
                <Doughnut
                  data={{ labels: genreLabels, datasets: [{ data: genreData, backgroundColor: genreColors }] }}
                  options={{ ...chartOptions(), plugins: { legend: { position: 'bottom', labels: { color: textColor() } } } }}
                  height={220}
                />
              </div>
            ) : (
              <EmptyChart label="Generate playlists to see genre spread" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyChart({ label }) {
  return (
    <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-smoke)', fontSize: 14 }}>
      {label}
    </div>
  );
}

function resolveVar(v) {
  if (!v) return '#6199f6';
  if (!v.startsWith('var(')) return v;
  const name = v.replace('var(', '').replace(')', '');
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#6199f6';
}

function textColor() {
  return getComputedStyle(document.documentElement).getPropertyValue('--color-smoke').trim() || '#757580';
}

function chartOptions() {
  const grid = getComputedStyle(document.documentElement).getPropertyValue('--color-charcoal').trim() || '#2a2a32';
  const muted = textColor();
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false, labels: { color: muted } } },
    scales: {
      x: { grid: { color: grid }, ticks: { color: muted, font: { size: 11 } } },
      y: { grid: { color: grid }, ticks: { color: muted, font: { size: 11 } }, beginAtZero: true },
    },
  };
}
