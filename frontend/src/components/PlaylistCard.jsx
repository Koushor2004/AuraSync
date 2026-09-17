import React from 'react';
import { EMOTIONS } from '../utils/emotions.js';
import { usePlayer } from '../context/PlayerContext.jsx';
import EmotionIcon from '../assets/EmotionIcon.jsx';

export default function PlaylistCard({ playlist, onSave, saving, maxHeight = 390 }) {
  const meta = EMOTIONS[playlist.emotion] || EMOTIONS.neutral;
  const { currentTrack, isPlaying, playTrack } = usePlayer();

  return (
    <div className="card card--interactive">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <EmotionIcon emotion={playlist.emotion} size={24} />
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

      <div
        className="playlist-card__tracks"
        style={{
          maxHeight: maxHeight,
        }}
      >
        {(playlist.tracks || []).map((t, i) => {
          const isCurrent = currentTrack?.spotifyId === t.spotifyId;
          const showPlaying = isCurrent && isPlaying;
          const spotifyUrl = t.externalUrl || (t.spotifyId ? `https://open.spotify.com/track/${t.spotifyId}` : null);

          return (
            <div
              key={t.spotifyId || i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 10px',
                borderRadius: 'var(--radius-cards)',
                transition: 'background 160ms ease, border-color 160ms ease',
                width: '100%',
                border: isCurrent ? '1px solid var(--color-twilight)' : '1px solid transparent',
                background: isCurrent ? 'var(--color-void)' : 'transparent',
              }}
            >
              <button
                onClick={() => playTrack(t)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  flex: 1,
                  minWidth: 0,
                  border: 'none',
                  background: 'transparent',
                  textAlign: 'left',
                  cursor: 'pointer',
                  padding: 0,
                  color: 'inherit',
                }}
                title={showPlaying ? "Pause preview" : t.previewUrl ? "Play preview audio" : "Select track"}
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
              </button>

              {spotifyUrl && (
                <a
                  href={spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '6px',
                    borderRadius: '50%',
                    color: '#1DB954',
                    transition: 'transform 160ms ease, background 160ms ease',
                    flexShrink: 0,
                  }}
                  title="Open full track in Spotify"
                  onClick={(e) => e.stopPropagation()}
                >
                  <IconSpotify />
                </a>
              )}
            </div>
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

function IconSpotify() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.02 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.48-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.281 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.72 1.62.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
    </svg>
  );
}
