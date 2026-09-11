import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import PageHeader from '../components/PageHeader.jsx';

export default function Settings() {
  const { user, logout, refresh } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [notice, setNotice] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const status = params.get('spotify');
    if (status === 'connected') {
      setNotice('Spotify connected successfully.');
      refresh();
    } else if (status === 'error') {
      const customMsg = params.get('message');
      setError(customMsg || 'Spotify connection failed. Please try again.');
    }
  }, []);

  const changeTheme = async (next) => {
    setTheme(next);
    try {
      await api.patch('/user/theme', { theme: next });
    } catch {
      /* non-critical */
    }
  };

  const connectSpotify = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || '/api'}/spotify/login`;
  };

  const disconnectSpotify = async () => {
    await api.post('/spotify/disconnect');
    refresh();
    setNotice('Spotify disconnected.');
  };

  const deleteAccount = async () => {
    setDeleting(true);
    setError('');
    try {
      await api.delete('/auth/account');
      await logout();
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete your account.');
      setDeleting(false);
    }
  };

  return (
    <div className="page" style={{ maxWidth: 720 }}>
      <PageHeader eyebrow="PREFERENCES & INTEGRATIONS" title="Account & preferences" />

      {notice && <div className="form-success">{notice}</div>}
      {error && <div className="form-alert">{error}</div>}

      <div className="card" style={{ marginBottom: 24 }}>
        <span className="card-title">APPEARANCE</span>
        <p style={{ color: 'var(--color-smoke)', fontSize: 14, marginBottom: 16 }}>
          Choose how AuraSync looks on this device.
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            className={`btn ${theme === 'dark' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => changeTheme('dark')}
          >
            🌙 Midnight Projection Suite
          </button>
          <button
            className={`btn ${theme === 'light' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => changeTheme('light')}
          >
            ☀️ Standard Theme
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <span className="card-title">SPOTIFY CONNECTION</span>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span
              className="pill"
              style={{
                color: user?.spotify?.connected ? 'var(--e-disgusted)' : 'var(--color-smoke)',
                borderColor: user?.spotify?.connected ? 'var(--e-disgusted)' : undefined,
              }}
            >
              <span className="pill-dot" style={{ backgroundColor: user?.spotify?.connected ? 'var(--e-disgusted)' : 'var(--color-smoke)' }} />
              {user?.spotify?.connected ? 'CONNECTED' : 'NOT CONNECTED'}
            </span>
            {user?.spotify?.connected && (
              <span style={{ fontSize: 13, color: 'var(--color-smoke)' }}>as {user.spotify.displayName}</span>
            )}
          </div>
          {user?.spotify?.connected ? (
            <button className="btn btn-secondary btn-sm" onClick={disconnectSpotify}>
              Disconnect
            </button>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={connectSpotify}>
              Connect Spotify
            </button>
          )}
        </div>
      </div>

      <div className="card" style={{ borderColor: 'var(--e-angry)' }}>
        <span className="card-title" style={{ color: 'var(--e-angry)' }}>DANGER ZONE</span>
        <p style={{ color: 'var(--color-smoke)', fontSize: 14, marginBottom: 16 }}>
          Deleting your account permanently removes your profile, emotion history, and saved playlists. This cannot
          be undone.
        </p>
        <div className="field" style={{ maxWidth: 320 }}>
          <label>TYPE DELETE TO CONFIRM</label>
          <input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="DELETE" />
        </div>
        <button
          className="btn btn-danger"
          disabled={confirmText !== 'DELETE' || deleting}
          onClick={deleteAccount}
        >
          {deleting ? 'Deleting…' : 'Delete my account'}
        </button>
      </div>
    </div>
  );
}
