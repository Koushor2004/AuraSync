import React from 'react';
import { Link } from 'react-router-dom';
import AuraRing from '../components/AuraRing.jsx';
import './Landing.css';

const EMOTION_STRIP = [
  { emoji: '😄', color: 'var(--e-happy)', label: 'Happy' },
  { emoji: '😌', color: 'var(--e-relaxed)', label: 'Relaxed' },
  { emoji: '😲', color: 'var(--e-surprised)', label: 'Surprised' },
  { emoji: '😔', color: 'var(--e-sad)', label: 'Sad' },
  { emoji: '🤩', color: 'var(--e-excited)', label: 'Excited' },
  { emoji: '😠', color: 'var(--e-angry)', label: 'Angry' },
];

export default function Landing() {
  return (
    <div className="landing">
      <header className="landing__nav">
        <div className="landing__brand">
          <span className="sidebar__logo-dot" style={{ boxShadow: '0 0 14px var(--brand)' }} />
          AuraSync
        </div>
        <div className="landing__nav-actions">
          <Link to="/login" className="btn btn-ghost btn-sm">Log in</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Get started</Link>
        </div>
      </header>

      <section className="landing__hero">
        <div className="landing__hero-copy">
          <span className="pill" style={{ marginBottom: 18 }}>
            <span className="pill-dot" style={{ color: 'var(--e-relaxed)' }} />
            Face-aware, not face-stored
          </span>
          <h1>
            Your face has a<br />
            <span className="landing__gradient-text">soundtrack.</span>
          </h1>
          <p>
            AuraSync reads your expression for a single instant, matches it to one of nine moods,
            and hands you a Spotify playlist built for exactly how you feel right now — no scrolling required.
          </p>
          <div className="landing__hero-actions">
            <Link to="/register" className="btn btn-primary">Detect my mood</Link>
            <Link to="/login" className="btn btn-secondary">I have an account</Link>
          </div>
          <p className="landing__hero-note">Prefer not to use your camera? Pick your mood manually in two taps.</p>
        </div>

        <div className="landing__hero-visual">
          <AuraRing color="var(--brand)" size={260} confidence={82} spinning>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 40 }}>😌</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                82% confident
              </div>
            </div>
          </AuraRing>
        </div>
      </section>

      <section className="landing__strip">
        {EMOTION_STRIP.map((e) => (
          <div key={e.label} className="landing__strip-item" style={{ '--c': e.color }}>
            <span>{e.emoji}</span>
            <span>{e.label}</span>
          </div>
        ))}
      </section>

      <section className="landing__features">
        <FeatureCard
          eyebrow="01 · Capture"
          title="One glance, read instantly"
          body="face-api.js runs entirely in your browser, reading expression from a single lightweight image — nothing is uploaded or stored."
        />
        <FeatureCard
          eyebrow="02 · Match"
          title="Nine moods, real audio features"
          body="Each emotion maps to tuned valence, energy and tempo targets, so Spotify's recommendation engine returns tracks that actually fit."
        />
        <FeatureCard
          eyebrow="03 · Track"
          title="Watch your aura shift over time"
          body="A running emotion history and weekly / monthly trend charts show how your mood moves — and which genres follow it."
        />
      </section>

      <footer className="landing__footer">
        <span>© {new Date().getFullYear()} AuraSync</span>
        <span>Built with the MERN stack · Music via Spotify</span>
      </footer>
    </div>
  );
}

function FeatureCard({ eyebrow, title, body }) {
  return (
    <div className="card card--interactive landing__feature">
      <div className="card-title">{eyebrow}</div>
      <h3 style={{ fontSize: 18, marginBottom: 10 }}>{title}</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.6 }}>{body}</p>
    </div>
  );
}
