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
        eyebrow="Dashboard"
        title={`${greeting}, ${user?.name?.split(' ')[0] || 'there'}`}
        subtitle="Here's what your aura has looked like lately."
        actions={
          <Link to="/detect" className="btn btn-primary">
            Detect mood
          </Link>
        }
      />

      {error && <div className="form-alert">{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20, marginBottom: 20 }}>
        {/* Current aura card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 16 }}>
          <div className="card-title" style={{ alignSelf: 'flex-start' }}>Current aura</div>
          <AuraRing color={meta.color} size={132} confidence={92}>
            <div>
              <div style={{ fontSize: 40 }}>{meta.emoji}</div>
            </div>
          </AuraRing>
          <div>
            <h3 style={{ fontSize: 20 }}>{meta.label}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 13.5, marginTop: 4 }}>
              Last updated {user?.lastActiveAt ? timeAgo(user.lastActiveAt) : 'just now'}
            </p>
          </div>
          <Link to="/detect" className="btn btn-secondary btn-sm btn-block">
            Re-scan my mood
          </Link>
        </div>

        {/* Stats + history */}
        <div className="card">
          <div className="card-title">Recent emotion history</div>
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
                      padding: '10px 8px',
                      borderRadius: 8,
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 18 }}>{m.emoji}</span>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: 14 }}>{m.label}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>
                          {log.source === 'camera' ? 'Camera detected' : 'Manually selected'}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      {log.source === 'camera' && (
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: m.color }}>
                          {Math.round(log.confidence)}%
                        </div>
                      )}
                      <div style={{ fontSize: 11.5, color: 'var(--text-faint)' }}>{timeAgo(log.createdAt)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="card-title" style={{ marginTop: 8 }}>Recently recommended playlists</div>
      {!playlists ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <div className="skeleton" style={{ height: 180 }} />
          <div className="skeleton" style={{ height: 180 }} />
          <div className="skeleton" style={{ height: 180 }} />
        </div>
      ) : playlists.length === 0 ? (
        <div className="card empty-state">
          <h3>No playlists yet</h3>
          <p>Detect your mood to generate your first AI-curated playlist.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="skeleton" style={{ height: 46 }} />
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
