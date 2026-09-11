import React from 'react';
import { EMOTIONS } from '../utils/emotions.js';
import { usePlayer } from '../context/PlayerContext.jsx';

export default function PlaylistCard({ playlist, onSave, saving }) {
  const meta = EMOTIONS[playlist.emotion] || EMOTIONS.neutral;
  const { currentTrack, isPlaying, playTrack } = usePlayer();

  return (
    <div className="card card--interactive">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 24 }}>{meta.emoji}</span>
          <div>
            <div style={{ fontWeight: 500, fontSize: 16, color: 'var(--color-carbon-vellum)' }}>{playlist.name}</div>
            <div style={{ fontSize: 12, color: 'var(--color-smoke)', marginTop: 2 }}>
              {playlist.tracks?.length || 0} tracks · <span style={{ color: 'var(--color-iris-glow)' }}>{meta.label}</span>
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
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
                gap: 12,
                padding: '8px 10px',
                borderRadius: 'var(--radius-cards)',
                transition: 'background 160ms ease, border-color 160ms ease',
                width: '100%',
                border: isCurrent ? '1px solid var(--color-twilight)' : '1px solid transparent',
                background: isCurrent ? 'var(--color-void)' : 'transparent',
                textAlign: 'left',
                cursor: t.previewUrl ? 'pointer' : 'not-allowed',
                opacity: t.previewUrl ? 1 : 0.6,
              }}
              onMouseEnter={(e) => {
                if (!isCurrent && t.previewUrl) e.currentTarget.style.background = 'var(--color-void)';
              }}
              onMouseLeave={(e) => {
                if (!isCurrent && t.previewUrl) e.currentTarget.style.background = 'transparent';
              }}
              title={!t.previewUrl ? "Preview unavailable" : showPlaying ? "Pause preview" : "Play preview"}
            >
              <span style={{
                fontFamily: 'var(--font-neuemachinainktrap)',
                fontSize: 11,
                color: isCurrent ? 'var(--color-iris-glow)' : 'var(--color-smoke)',
                minWidth: 20,
                textAlign: 'right',
                marginRight: 2
              }}>
                {String(i + 1).padStart(2, '0')}
              </span>

              <div style={{ position: 'relative', width: 36, height: 36, flexShrink: 0 }}>
                {t.albumArt ? (
                  <img src={t.albumArt} alt="" width={36} height={36} style={{ borderRadius: 6, objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: 36, height: 36, borderRadius: 6, background: 'var(--color-void)' }} />
                )}
                {isCurrent && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(4, 4, 7, 0.75)',
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-iris-glow)'
                  }}>
                    {showPlaying ? <IconPauseMini /> : <IconPlayMini />}
                  </div>
                )}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ 
                  fontSize: 14, 
                  fontWeight: 400, 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  whiteSpace: 'nowrap',
                  color: isCurrent ? 'var(--color-iris-glow)' : 'var(--color-carbon-vellum)'
                }}>
                  {t.name}
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-smoke)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {t.artists}
                </div>
              </div>
              
              {t.previewUrl && !isCurrent && (
                <span className="play-icon-hover" style={{ color: 'var(--color-iris-glow)', fontSize: 11, paddingRight: 4 }}>
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
