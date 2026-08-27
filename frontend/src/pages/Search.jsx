import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { usePlayer } from '../context/PlayerContext.jsx';
import PageHeader from '../components/PageHeader.jsx';

export default function Search() {
  const { user } = useAuth();
  const { currentTrack, isPlaying, playTrack } = usePlayer();

  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState('');
  const [loading, setLoading] = useState(false);
  const [tracks, setTracks] = useState([]);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setHasSearched(true);
    try {
      const { data } = await api.get('/spotify/search', {
        params: { q: query, language: language || undefined },
      });
      setTracks(data.tracks || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Search failed. Please check your Spotify connection.');
      setTracks([]);
    } finally {
      setLoading(false);
    }
  };

  const isSpotifyConnected = user?.spotify?.connected;

  return (
    <div className="page" style={{ maxWidth: 840 }}>
      <PageHeader
        eyebrow="Search"
        title="Find your soundtrack"
        subtitle="Search tracks directly on Spotify and play previews in-app."
      />

      {error && <div className="form-alert">{error}</div>}

      {!isSpotifyConnected ? (
        <div className="card empty-state" style={{ padding: '60px 24px' }}>
          <div style={{ fontSize: 44, marginBottom: 14 }}>🔑</div>
          <h3>Spotify connection required</h3>
          <p style={{ marginBottom: 20 }}>
            You need to link your Spotify account in order to search the full Spotify catalog.
          </p>
          <Link to="/settings" className="btn btn-primary">
            Go to Settings
          </Link>
        </div>
      ) : (
        <>
          <div className="card" style={{ marginBottom: 20 }}>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div className="field" style={{ flex: 1, minWidth: 260, marginBottom: 0 }}>
                <label>Song, Artist or Album name</label>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="What do you want to listen to?"
                  disabled={loading}
                />
              </div>

              <div className="field" style={{ width: 180, marginBottom: 0 }}>
                <label>Language Filter</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  disabled={loading}
                >
                  <option value="">All Languages</option>
                  <option value="english">English</option>
                  <option value="hindi">Hindi / Indian</option>
                  <option value="spanish">Spanish</option>
                  <option value="japanese">Japanese</option>
                  <option value="korean">Korean</option>
                  <option value="french">French</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading || !query.trim()} style={{ height: 45 }}>
                {loading ? 'Searching…' : 'Search'}
              </button>
            </form>
          </div>

          {loading ? (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="skeleton" style={{ height: 50 }} />
              ))}
            </div>
          ) : tracks.length > 0 ? (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div className="card-title" style={{ marginBottom: 12 }}>Search results</div>
              
              {tracks.map((t, i) => {
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
                      padding: '10px 12px',
                      borderRadius: 10,
                      transition: 'background 160ms ease',
                      width: '100%',
                      border: 'none',
                      background: isCurrent ? 'var(--surface-alt)' : 'transparent',
                      textAlign: 'left',
                      cursor: t.previewUrl ? 'pointer' : 'not-allowed',
                      opacity: t.previewUrl ? 1 : 0.6,
                    }}
                    onMouseEnter={(e) => {
                      if (!isCurrent && t.previewUrl) e.currentTarget.style.background = 'var(--surface-hover)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isCurrent && t.previewUrl) e.currentTarget.style.background = 'transparent';
                    }}
                    title={!t.previewUrl ? "Preview unavailable" : showPlaying ? "Pause preview" : "Play preview"}
                  >
                    {/* Indexing */}
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 13,
                      color: isCurrent ? 'var(--brand-light)' : 'var(--text-faint)',
                      minWidth: 24,
                      textAlign: 'right'
                    }}>
                      {i + 1}
                    </span>

                    {/* Album Art / Play Overlay */}
                    <div style={{ position: 'relative', width: 38, height: 38, flexShrink: 0 }}>
                      {t.albumArt ? (
                        <img src={t.albumArt} alt="" width={38} height={38} style={{ borderRadius: 6, objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: 38, height: 38, borderRadius: 6, background: 'var(--surface-alt)' }} />
                      )}
                      {isCurrent && (
                        <div style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'rgba(15, 17, 23, 0.65)',
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

                    {/* Meta info */}
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{
                        fontSize: 14,
                        fontWeight: 600,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        color: isCurrent ? 'var(--brand-light)' : 'var(--text)'
                      }}>
                        {t.name}
                      </div>
                      <div style={{ fontSize: 12.5, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 1 }}>
                        {t.artists}
                      </div>
                    </div>

                    {/* Preview action indicator */}
                    {t.previewUrl && !isCurrent && (
                      <span style={{ color: 'var(--text-faint)', fontSize: 11, paddingRight: 6 }}>
                        ▶ Preview
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : hasSearched ? (
            <div className="card empty-state">
              <h3>No results found</h3>
              <p>Try searching with another keyword or adjust your language filter.</p>
            </div>
          ) : (
            <div className="card empty-state">
              <h3>Type a query to search</h3>
              <p>We'll query Spotify's catalog and allow playing preview snippets right here.</p>
            </div>
          )}
        </>
      )}
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
