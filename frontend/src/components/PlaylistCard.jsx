import React from 'react';
import { EMOTIONS } from '../utils/emotions.js';

export default function PlaylistCard({ playlist, onSave, saving }) {
  const meta = EMOTIONS[playlist.emotion] || EMOTIONS.neutral;

  return (
    <div className="card card--interactive">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>{meta.emoji}</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{playlist.name}</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
              {playlist.tracks?.length || 0} tracks · {meta.label} mood
            </div>
          </div>
        </div>
        {onSave && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => onSave(playlist)}
            disabled={playlist.savedToSpotify || saving}
          >
            {playlist.savedToSpotify ? 'Saved ✓' : saving ? 'Saving…' : 'Save to Spotify'}
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {(playlist.tracks || []).slice(0, 5).map((t, i) => (
          <a
            key={t.spotifyId || i}
            href={t.externalUrl || '#'}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '7px 8px',
              borderRadius: 8,
              transition: 'background 160ms ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-alt)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            {t.albumArt ? (
              <img src={t.albumArt} alt="" width={34} height={34} style={{ borderRadius: 6, objectFit: 'cover' }} />
            ) : (
              <div style={{ width: 34, height: 34, borderRadius: 6, background: 'var(--surface-alt)' }} />
            )}
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {t.name}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {t.artists}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
