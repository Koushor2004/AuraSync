import React from 'react';
import { Link } from 'react-router-dom';
import AuraRing from '../components/AuraRing.jsx';
import EmotionIcon from '../assets/EmotionIcon.jsx';
import './Landing.css';

const EMOTION_STRIP = [
  { key: 'happy', label: 'Happy' },
  { key: 'relaxed', label: 'Relaxed' },
  { key: 'surprised', label: 'Surprised' },
  { key: 'sad', label: 'Sad' },
  { key: 'excited', label: 'Excited' },
  { key: 'angry', label: 'Angry' },
];

export default function Landing() {
  return (
    <div className="landing">
      {/* Nav Veil */}
      <div className="landing__nav-veil">
        <header className="landing__nav">
          <div className="landing__brand">
            <span className="sidebar__logo-dot" />
            <span>AuraSync</span>
          </div>
          <div className="landing__nav-actions">
            <Link to="/login" className="btn btn-ghost">Sign In</Link>
            <Link to="/register" className="btn btn-primary">Start Free Trial</Link>
          </div>
        </header>
      </div>

      {/* Cosmic Hero Section */}
      <div className="landing__hero-wrapper">
        <section className="landing__hero">
          <div className="landing__hero-copy">
            <span className="eyebrow-label">THE AURASYNC PLATFORM</span>
            <h1>One glance, curated music for your exact mood.</h1>
            <p className="subheadline-paragraph">
              AuraSync reads your facial expression locally in browser, maps it to real audio characteristics, and instantly delivers Spotify playlists tuned to how you feel right now.
            </p>
            <div className="landing__hero-actions">
              <Link to="/register" className="btn btn-primary">Start Free Trial</Link>
              <Link to="/login" className="btn btn-secondary">Take a Product Tour</Link>
            </div>
            <p className="landing__hero-note">Prefer not to use your camera? Pick your mood manually in two taps.</p>
          </div>

          <div className="landing__mockup-frame">
            <div className="landing__mockup-header">
              <div className="landing__mockup-dots">
                <span className="landing__mockup-dot" />
                <span className="landing__mockup-dot" />
                <span className="landing__mockup-dot" />
              </div>
              <div className="landing__mockup-title">LIVE AURA READOUT</div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0' }}>
              <AuraRing color="var(--color-iris-glow)" size={240} confidence={88} spinning>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 44, marginBottom: 4 }}>😌</div>
                  <div style={{ fontFamily: 'var(--font-neuemachinainktrap)', fontSize: 12, color: 'var(--color-iris-glow)', letterSpacing: '0.06em' }}>
                    RELAXED · 88%
                  </div>
                </div>
              </AuraRing>

              <div style={{ 
                marginTop: 32, 
                width: '100%', 
                backgroundColor: 'var(--surface-nav-veil)', 
                borderRadius: 'var(--radius-cards)',
                border: '1px solid var(--color-charcoal)',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-iris-glow)' }} />
                  <span style={{ fontSize: 13, color: 'var(--color-carbon-vellum)' }}>Acoustic Chill Out Mix</span>
                </div>
                <span style={{ fontFamily: 'var(--font-neuemachinainktrap)', fontSize: 11, color: 'var(--color-smoke)' }}>SPOTIFY CONNECTED</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Emotion Strip */}
      <div className="landing__strip-wrapper">
        <section className="landing__strip">
          {EMOTION_STRIP.map((e) => (
            <div key={e.label} className="landing__strip-item">
              <EmotionIcon emotion={e.key} size={22} />
              <span>{e.label}</span>
            </div>
          ))}
        </section>
      </div>

      {/* Feature Columns */}
      <div className="landing__features-wrapper">
        <div className="landing__features-header">
          <span className="eyebrow-label">WORKFLOW MANAGEMENT</span>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', letterSpacing: '-1.92px', fontWeight: 400, color: 'var(--color-carbon-vellum)' }}>
            Built for seamless mood-driven listening.
          </h2>
        </div>

        <div className="landing__features-grid">
          <FeatureColumnBlock
            icon={<IconCamera />}
            heading="Zero Cloud Storage"
            body="face-api.js runs 100% locally in your browser. Your camera stream never leaves your device or touches external servers."
          />
          <FeatureColumnBlock
            icon={<IconSliders />}
            heading="Audio Target Matching"
            body="Mapped against valence, energy, and acousticness targets for precision Spotify recommendations that match your aura."
          />
          <FeatureColumnBlock
            icon={<IconChart />}
            heading="Mood Trend Analytics"
            body="Monitor how your emotional state moves over days and weeks with exportable analytics reports and mood history timelines."
          />
          <FeatureColumnBlock
            icon={<IconMusic />}
            heading="Instant Playlists"
            body="Directly stream track previews or save full curated playlists straight into your Spotify library in a single tap."
          />
        </div>
      </div>

      {/* Video Showcase Block */}
      <div className="landing__showcase-wrapper">
        <section className="landing__showcase">
          <span className="eyebrow-label">CINEMATIC EXPERIENCE</span>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', letterSpacing: '-1.92px', fontWeight: 400, color: 'var(--color-carbon-vellum)' }}>
            Music tailored like a projection room score.
          </h2>
          <p style={{ color: 'var(--color-smoke)', fontSize: 16, marginTop: 12, maxWidth: 540, margin: '12px auto 0' }}>
            Transform your session into a focused, immersive audio experience designed around your current frame of mind.
          </p>

          <div className="landing__video-player">
            <div className="landing__play-overlay">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
          <div className="landing__video-caption">
            AURASYNC PROJECTION ROOM · RECTIFIED EMOTION FEED
          </div>
        </section>
      </div>

      {/* Footer Veil */}
      <div className="landing__footer-veil">
        <footer className="landing__footer">
          <span>© {new Date().getFullYear()} AuraSync — Midnight Projection Suite</span>
          <span>Built with React & MERN · Spotify Web API</span>
        </footer>
      </div>
    </div>
  );
}

function FeatureColumnBlock({ icon, heading, body }) {
  return (
    <div className="landing__feature-block">
      <div className="landing__feature-icon">{icon}</div>
      <h3 className="landing__feature-title">{heading}</h3>
      <p className="landing__feature-body">{body}</p>
    </div>
  );
}

function IconCamera() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function IconSliders() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="21" x2="4" y2="14" />
      <line x1="4" y1="10" x2="4" y2="3" />
      <line x1="12" y1="21" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12" y2="3" />
      <line x1="20" y1="21" x2="20" y2="16" />
      <line x1="20" y1="12" x2="20" y2="3" />
      <line x1="1" y1="14" x2="7" y2="14" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="17" y1="16" x2="23" y2="16" />
    </svg>
  );
}

function IconChart() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function IconMusic() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}
