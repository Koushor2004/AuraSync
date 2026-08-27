import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { usePlayer } from '../context/PlayerContext.jsx';
import './AppLayout.css';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: IconGrid },
  { to: '/detect', label: 'Detect Mood', icon: IconCamera },
  { to: '/analytics', label: 'Analytics', icon: IconChart },
  { to: '/settings', label: 'Settings', icon: IconGear },
];

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const {
    currentTrack,
    isPlaying,
    progress,
    currentTime,
    duration,
    playTrack,
    pauseTrack,
    seek
  } = usePlayer();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const formatTime = (secs) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar__brand">
          <span className="sidebar__logo-dot" />
          <span>AuraSync</span>
        </div>

        <nav className="sidebar__nav">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `sidebar__link${isActive ? ' sidebar__link--active' : ''}`}
            >
              <Icon />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__footer">
          <button className="sidebar__theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <IconSun /> : <IconMoon />}
            <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
          </button>

          <div className="sidebar__user">
            <div
              className="sidebar__avatar"
              style={{ background: user?.currentAura || 'var(--brand)' }}
            >
              {user?.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="sidebar__user-meta">
              <strong>{user?.name}</strong>
              <span>{user?.email}</span>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm btn-block" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </aside>

      <div className="main-area">
        {children}

        {currentTrack && (
          <div className="audio-player-bar">
            <div className="audio-player-bar__info">
              {currentTrack.albumArt ? (
                <img src={currentTrack.albumArt} alt="" className="audio-player-bar__art" />
              ) : (
                <div className="audio-player-bar__art-placeholder" />
              )}
              <div className="audio-player-bar__meta">
                <span className="audio-player-bar__name">{currentTrack.name}</span>
                <span className="audio-player-bar__artist">{currentTrack.artists}</span>
              </div>
            </div>

            <div className="audio-player-bar__controls">
              <button className="audio-player-bar__btn" onClick={() => playTrack(currentTrack)}>
                {isPlaying ? <IconPauseBar /> : <IconPlayBar />}
              </button>

              <div className="audio-player-bar__progress-container">
                <span className="audio-player-bar__time">{formatTime(currentTime)}</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={(e) => seek(Number(e.target.value))}
                  className="audio-player-bar__slider"
                />
                <span className="audio-player-bar__time">{formatTime(duration)}</span>
              </div>
            </div>

            <button className="audio-player-bar__close" onClick={pauseTrack}>
              <IconCloseBar />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function IconGrid() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <rect x="13" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <rect x="3" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <rect x="13" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}
function IconCamera() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="12" cy="14" r="3.4" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}
function IconChart() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M4 20V10M12 20V4M20 20v-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function IconGear() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M19 12a7 7 0 00-.14-1.4l2-1.56-2-3.46-2.36.86a7.1 7.1 0 00-2.42-1.4L13.6 3H10.4l-.48 2.04a7.1 7.1 0 00-2.42 1.4l-2.36-.86-2 3.46 2 1.56A7 7 0 005 12c0 .48.05.94.14 1.4l-2 1.56 2 3.46 2.36-.86c.72.6 1.54 1.08 2.42 1.4L10.4 21h3.2l.48-2.04c.88-.32 1.7-.8 2.42-1.4l2.36.86 2-3.46-2-1.56c.09-.46.14-.92.14-1.4z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}
function IconSun() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 2v2.4M12 19.6V22M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2 12h2.4M19.6 12H22M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function IconMoon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M20 14.5A8.5 8.5 0 019.5 4a8.5 8.5 0 1010.5 10.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function IconPlayBar() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function IconPauseBar() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  );
}

function IconCloseBar() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}


