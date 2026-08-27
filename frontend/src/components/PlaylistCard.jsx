import React from 'react';
import { EMOTIONS } from '../utils/emotions.js';
import { usePlayer } from '../context/PlayerContext.jsx';

export default function PlaylistCard({ playlist, onSave, saving }) {
  const meta = EMOTIONS[playlist.emotion] || EMOTIONS.neutral;
  const { currentTrack, isPlaying, playTrack } = usePlayer();

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
        {(playlist.tracks || []).map((t, i) => {
          const isCurrent = currentTrack?.spotifyId === t.spotifyId;
          const showPlaying = isCurrent && isPlaying;

          return (
            <button
              key={t.spotifyId || i}
              onClick={() => t.previewUrl && playTrack(t)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '7px 8px',
                borderRadius: 8,
                transition: 'background 160ms ease',
                width: '100%',
                border: 'none',
                background: isCurrent ? 'var(--surface-alt)' : 'transparent',
                textAlign: 'left',
                cursor: t.previewUrl ? 'pointer' : 'not-allowed',
                opacity: t.previewUrl ? 1 : 0.65,
              }}
              onMouseEnter={(e) => {
                if (!isCurrent && t.previewUrl) e.currentTarget.style.background = 'var(--surface-alt)';
              }}
              onMouseLeave={(e) => {
                if (!isCurrent && t.previewUrl) e.currentTarget.style.background = 'transparent';
              }}
              title={!t.previewUrl ? "Preview unavailable" : showPlaying ? "Pause preview" : "Play preview"}
            >
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 12.5,
                color: isCurrent ? 'var(--brand-light)' : 'var(--text-faint)',
                minWidth: 20,
                textAlign: 'right',
                marginRight: 4
              }}>
                {i + 1}
              </span>

              <div style={{ position: 'relative', width: 34, height: 34, flexShrink: 0 }}>
                {t.albumArt ? (
                  <img src={t.albumArt} alt="" width={34} height={34} style={{ borderRadius: 6, objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: 34, height: 34, borderRadius: 6, background: 'var(--surface-alt)' }} />
                )}
                {isCurrent && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(15, 17, 23, 0.6)',
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--brand-light)'
                  }}>
                    {showPlaying ? <IconPauseMini /> : <IconPlayMini />}
                  </div>
                )}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ 
                  fontSize: 13.5, 
                  fontWeight: 500, 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  whiteSpace: 'nowrap',
                  color: isCurrent ? 'var(--brand-light)' : 'var(--text)'
                }}>
                  {t.name}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {t.artists}
                </div>
              </div>
              
              {t.previewUrl && !isCurrent && (
                <span className="play-icon-hover" style={{ color: 'var(--text-faint)', fontSize: 11, paddingRight: 4 }}>
                  ▶
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function IconPlayMini() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function IconPauseMini() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  );
}
