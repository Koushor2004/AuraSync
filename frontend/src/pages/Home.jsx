import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { EMOTIONS, MANUAL_EMOTIONS } from '../utils/emotions.js';
import AuraRing from '../components/AuraRing.jsx';
import PageHeader from '../components/PageHeader.jsx';
import EmotionIcon from '../assets/EmotionIcon.jsx';
import './Home.css';

export default function Home() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loadingMood, setLoadingMood] = useState(false);
  const [error, setError] = useState('');

  const meta = EMOTIONS[user?.currentEmotion] || EMOTIONS.neutral;
  const firstName = user?.name?.split(' ')[0] || 'Listener';

  const triggerQuickMood = async (emotionKey) => {
    setLoadingMood(true);
    try {
      const logRes = await api.post('/emotion/log', { emotion: emotionKey, source: 'manual', confidence: 100 });
      updateUser({ currentEmotion: emotionKey, currentAura: logRes.data.aura });
      navigate('/detect');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update mood.');
    } finally {
      setLoadingMood(false);
    }
  };

  return (
    <div className="page">
      <PageHeader
        eyebrow="MIDNIGHT PROJECTION ROOM"
        title={`Welcome home, ${firstName}`}
        subtitle="Your personalized aura soundstage and instant emotion soundscapes."
      />

      {error && <div className="form-alert">{error}</div>}

      {/* Hero Welcome Card */}
      <div className="home-hero-card">
        <div className="home-hero-copy">
          <span className="eyebrow-label">CURRENT AURA STATE</span>
          <h1>{meta.label} Resonance</h1>
          <p>
            Your current emotional state is set to <strong>{meta.label}</strong>. Spotify audio parameters (valence, energy, tempo) are calibrated to deliver tracks that resonate with your frequency.
          </p>
          <div className="home-hero-actions">
            <Link to="/detect" className="btn btn-primary">
              Start Camera Detection
            </Link>
            <Link to="/analytics" className="btn btn-secondary">
              View Aura Trends
            </Link>
          </div>
        </div>

        <div className="home-aura-visual">
          <AuraRing color="var(--color-iris-glow)" size={160} confidence={94}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: 4 }}>
                <EmotionIcon emotion={user?.currentEmotion || 'neutral'} size={44} />
              </div>
              <div style={{ fontFamily: 'var(--font-neuemachinainktrap)', fontSize: 11, color: 'var(--color-iris-glow)', letterSpacing: '0.06em' }}>
                {meta.label.toUpperCase()}
              </div>
            </div>
          </AuraRing>
          <span style={{ fontSize: 12, color: 'var(--color-smoke)', marginTop: 16, fontFamily: 'var(--font-neuemachinainktrap)' }}>
            ACTIVE PROJECTION SCORE
          </span>
        </div>
      </div>

      {/* Stats Cards Ticker */}
      <div className="home-stats-grid">
        <div className="home-stat-card">
          <span className="home-stat-card__lbl">Spotify Integration</span>
          <span className="home-stat-card__val" style={{ fontSize: 20 }}>
            {user?.spotify?.connected ? `Connected (${user.spotify.displayName})` : 'Not Connected'}
          </span>
        </div>
        <div className="home-stat-card">
          <span className="home-stat-card__lbl">Current Aura</span>
          <span className="home-stat-card__val" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <EmotionIcon emotion={user?.currentEmotion || 'neutral'} size={20} />
            <span>{meta.label}</span>
          </span>
        </div>
        <div className="home-stat-card">
          <span className="home-stat-card__lbl">Privacy Level</span>
          <span className="home-stat-card__val" style={{ fontSize: 20, color: 'var(--color-iris-glow)' }}>
            100% Local In-Browser
          </span>
        </div>
      </div>

      {/* Quick Mood Launcher */}
      <div className="home-section-title">
        <span className="eyebrow-label" style={{ marginBottom: 0 }}>ONE-TAP MOOD SELECTION</span>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/detect')}>Full Detection Suite →</button>
      </div>

      <div className="home-quick-moods">
        {MANUAL_EMOTIONS.slice(0, 7).map((key) => {
          const m = EMOTIONS[key];
          return (
            <button
              key={key}
              className="home-quick-mood-btn"
              onClick={() => triggerQuickMood(key)}
              disabled={loadingMood}
            >
              <EmotionIcon emotion={key} size={22} />
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
