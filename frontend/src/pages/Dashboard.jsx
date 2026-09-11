import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { EMOTIONS } from '../utils/emotions.js';
import AuraRing from '../components/AuraRing.jsx';
import PageHeader from '../components/PageHeader.jsx';
import PlaylistCard from '../components/PlaylistCard.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const [history, setHistory] = useState(null);
  const [playlists, setPlaylists] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [h, p] = await Promise.all([
          api.get('/emotion/history?limit=8'),
          api.get('/spotify/playlists?limit=3'),
        ]);
        setHistory(h.data.logs);
        setPlaylists(p.data.playlists);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load your dashboard data.');
      }
    })();
  }, []);

  const meta = EMOTIONS[user?.currentEmotion] || EMOTIONS.neutral;
  const greeting = getGreeting();

  return (
    <div className="page">
      <PageHeader
        eyebrow="OVERVIEW"
        title={`${greeting}, ${user?.name?.split(' ')[0] || 'there'}`}
        subtitle="Here's what your aura has looked like in recent sessions."
        actions={
          <Link to="/detect" className="btn btn-primary">
            Detect Mood
          </Link>
        }
      />

      {error && <div className="form-alert">{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 32, marginBottom: 40 }}>
        {/* Current aura card */}
        <div className="card product-mockup-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 20, padding: 32 }}>
          <span className="eyebrow-label" style={{ alignSelf: 'flex-start' }}>CURRENT AURA</span>
          <AuraRing color="var(--color-iris-glow)" size={144} confidence={92}>
            <div>
              <div style={{ fontSize: 44 }}>{meta.emoji}</div>
            </div>
          </AuraRing>
          <div>
            <h3 style={{ fontSize: 22, fontWeight: 400, color: 'var(--color-carbon-vellum)' }}>{meta.label}</h3>
            <p style={{ color: 'var(--color-smoke)', fontSize: 13, marginTop: 4 }}>
              Last updated {user?.lastActiveAt ? timeAgo(user.lastActiveAt) : 'just now'}
            </p>
          </div>
          <Link to="/detect" className="btn btn-secondary btn-sm btn-block">
            Re-scan My Mood
          </Link>
        </div>

        {/* Stats + history */}
        <div className="card">
          <span className="card-title">RECENT EMOTION HISTORY</span>
          {!history ? (
            <SkeletonRows />
          ) : history.length === 0 ? (
            <div className="empty-state">
              <h3>No scans yet</h3>
              <p>Run your first detection to start building your history.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {history.map((log) => {
                const m = EMOTIONS[log.emotion] || EMOTIONS.neutral;
                return (
                  <div
                    key={log._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 10px',
                      borderRadius: 'var(--radius-cards)',
                      borderBottom: '1px solid var(--color-charcoal)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 20 }}>{m.emoji}</span>
                      <div>
                        <div style={{ fontWeight: 400, fontSize: 14, color: 'var(--color-carbon-vellum)' }}>{m.label}</div>
                        <div style={{ fontSize: 12, color: 'var(--color-smoke)' }}>
                          {log.source === 'camera' ? 'Camera detected' : 'Manually selected'}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      {log.source === 'camera' && (
                        <div style={{ fontFamily: 'var(--font-neuemachinainktrap)', fontSize: 11, color: 'var(--color-iris-glow)' }}>
                          {Math.round(log.confidence)}% CONFIDENCE
                        </div>
                      )}
                      <div style={{ fontSize: 12, color: 'var(--color-smoke)' }}>{timeAgo(log.createdAt)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <span className="eyebrow-label" style={{ marginBottom: 16 }}>RECENTLY RECOMMENDED MIXES</span>
      {!playlists ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          <div className="skeleton" style={{ height: 200 }} />
          <div className="skeleton" style={{ height: 200 }} />
          <div className="skeleton" style={{ height: 200 }} />
        </div>
      ) : playlists.length === 0 ? (
        <div className="card empty-state">
          <h3>No playlists yet</h3>
          <p>Detect your mood to generate your first AI-curated playlist.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          {playlists.map((p) => (
            <PlaylistCard key={p._id} playlist={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function SkeletonRows() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="skeleton" style={{ height: 50 }} />
      ))}
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
