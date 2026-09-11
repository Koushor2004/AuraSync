import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { EMOTIONS, FACE_API_TO_EMOTION, MANUAL_EMOTIONS } from '../utils/emotions.js';
import PageHeader from '../components/PageHeader.jsx';
import AuraRing from '../components/AuraRing.jsx';
import PlaylistCard from '../components/PlaylistCard.jsx';
import './Detect.css';

const MODEL_URL = '/models';

export default function Detect() {
  const { updateUser } = useAuth();
  const [tab, setTab] = useState('camera');

  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [modelError, setModelError] = useState('');
  const [permission, setPermission] = useState('idle');
  const [detecting, setDetecting] = useState(false);
  const [liveResult, setLiveResult] = useState(null);

  const [captured, setCaptured] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const [selectedManual, setSelectedManual] = useState(null);
  const [saving, setSaving] = useState(false);
  const [resultPlaylist, setResultPlaylist] = useState(null);
  const [error, setError] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ]);
        if (!cancelled) setModelsLoaded(true);
      } catch (err) {
        if (!cancelled) setModelError('Could not load the detection models. Check that /models is deployed.');
      }
    })();
    return () => {
      cancelled = true;
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setError('');
    setPermission('requesting');
    setCaptured(false);
    setLiveResult(null);
    setResultPlaylist(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 480, height: 360 } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setPermission('granted');
      setDetecting(true);
    } catch (err) {
      setPermission('denied');
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setDetecting(false);
  };

  const captureAndDetect = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setError('');
    setAnalyzing(true);
    setCaptured(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 480;
    canvas.height = video.videoHeight || 360;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    stopCamera();

    try {
      const detection = await faceapi
        .detectSingleFace(canvas, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

      if (!detection) {
        setLiveResult(null);
        setError('No face detected. Please adjust your lighting and angle, then try again.');
        setAnalyzing(false);
        return;
      }

      const expressions = detection.expressions;
      const [topKey, topScore] = Object.entries(expressions).sort((a, b) => b[1] - a[1])[0];
      const emotion = FACE_API_TO_EMOTION[topKey] || 'neutral';
      const confidence = Math.round(topScore * 100);

      setLiveResult({ emotion, confidence });
      setAnalyzing(false);

      await submitMood(emotion, 'camera', confidence);
    } catch (err) {
      console.error(err);
      setError('An error occurred during face detection.');
      setAnalyzing(false);
    }
  };

  const resetCamera = async () => {
    setCaptured(false);
    setLiveResult(null);
    setResultPlaylist(null);
    setError('');
    await startCamera();
  };

  const submitMood = async (emotion, source, confidence = 100, lang = selectedLanguage) => {
    setSaving(true);
    setError('');
    setResultPlaylist(null);
    try {
      const logRes = await api.post('/emotion/log', { emotion, source, confidence });
      updateUser({ currentEmotion: emotion, currentAura: logRes.data.aura });

      const recRes = await api.get(`/spotify/recommendations`, {
        params: { emotion, language: lang || undefined }
      });
      setResultPlaylist(recRes.data.playlist);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Mood saved, but we could not fetch Spotify recommendations. Connect Spotify in Settings.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLanguageChange = async (lang) => {
    setSelectedLanguage(lang);
    const currentEmotion = resultPlaylist?.emotion || selectedManual || liveResult?.emotion;
    if (!currentEmotion) return;

    setSaving(true);
    setError('');
    try {
      const recRes = await api.get('/spotify/recommendations', {
        params: { emotion: currentEmotion, language: lang || undefined }
      });
      setResultPlaylist(recRes.data.playlist);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Could not fetch Spotify recommendations for this language. Connect Spotify in Settings.'
      );
    } finally {
      setSaving(false);
    }
  };

  const meta = liveResult ? EMOTIONS[liveResult.emotion] : null;

  return (
    <div className="page">
      <PageHeader
        eyebrow="EXPRESSION CAPTURE"
        title="What's your aura right now?"
        subtitle="Use your camera for an instant local read, or pick your mood manually."
      />

      <div className="detect-tabs">
        <button
          className={`detect-tab${tab === 'camera' ? ' detect-tab--active' : ''}`}
          onClick={() => setTab('camera')}
        >
          Camera detection
        </button>
        <button
          className={`detect-tab${tab === 'manual' ? ' detect-tab--active' : ''}`}
          onClick={() => setTab('manual')}
        >
          Manual selection
        </button>
      </div>

      {error && <div className="form-alert">{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'start' }}>
        <div>
          {tab === 'camera' ? (
            <div className="camera-frame">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                style={{ display: captured ? 'none' : 'block' }}
              />
              <canvas
                ref={canvasRef}
                style={{
                  display: captured ? 'block' : 'none',
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: 'scaleX(-1)'
                }}
              />

              {permission !== 'granted' && (
                <div className="camera-frame__overlay">
                  {modelError ? (
                    <p style={{ color: 'var(--e-angry)' }}>{modelError}</p>
                  ) : !modelsLoaded ? (
                    <>
                      <AuraRing color="var(--color-iris-glow)" size={54} confidence={60} spinning />
                      <p style={{ fontSize: 13, color: 'var(--color-smoke)' }}>Loading detection models…</p>
                    </>
                  ) : permission === 'denied' ? (
                    <>
                      <p style={{ fontWeight: 500 }}>Camera access denied</p>
                      <p style={{ fontSize: 13, color: 'var(--color-smoke)' }}>
                        Enable camera permission in your browser settings, or switch to manual selection.
                      </p>
                      <button className="btn btn-secondary btn-sm" onClick={startCamera}>Try again</button>
                    </>
                  ) : (
                    <>
                      <p style={{ fontWeight: 500 }}>Camera is off</p>
                      <p style={{ fontSize: 13, color: 'var(--color-smoke)', maxWidth: 280 }}>
                        We process a single frame locally in-browser — nothing is ever uploaded.
                      </p>
                      <button className="btn btn-primary btn-sm" onClick={startCamera}>Enable Camera</button>
                    </>
                  )}
                </div>
              )}

              {permission === 'granted' && !captured && (
                <div className="camera-frame__badge" style={{ justifyContent: 'center' }}>
                  <button className="btn btn-primary btn-sm" onClick={captureAndDetect}>
                    📸 Capture Image
                  </button>
                </div>
              )}

              {permission === 'granted' && captured && analyzing && (
                <div className="camera-frame__overlay">
                  <AuraRing color="var(--color-iris-glow)" size={54} confidence={60} spinning />
                  <p style={{ fontSize: 13, color: 'var(--color-smoke)' }}>Analyzing photo…</p>
                </div>
              )}

              {permission === 'granted' && captured && !analyzing && liveResult && (
                <div className="camera-frame__badge">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 24 }}>{meta?.emoji}</span>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 14, color: 'var(--color-carbon-vellum)' }}>{meta?.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-iris-glow)', fontFamily: 'var(--font-neuemachinainktrap)' }}>
                        {liveResult.confidence}% CONFIDENCE
                      </div>
                    </div>
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={resetCamera}>
                    🔄 Capture Again
                  </button>
                </div>
              )}

              {permission === 'granted' && captured && !analyzing && !liveResult && error && (
                <div className="camera-frame__overlay">
                  <p style={{ color: 'var(--e-angry)', fontWeight: 500 }}>Detection Failed</p>
                  <p style={{ fontSize: 13, color: 'var(--color-smoke)', textAlign: 'center', maxWidth: 280 }}>
                    We couldn't detect a face in the captured frame.
                  </p>
                  <button className="btn btn-primary btn-sm" onClick={resetCamera} style={{ marginTop: 8 }}>
                    🔄 Try Again
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="mood-grid">
              {MANUAL_EMOTIONS.map((key) => {
                const m = EMOTIONS[key];
                return (
                  <button
                    key={key}
                    className={`mood-btn${selectedManual === key ? ' mood-btn--active' : ''}`}
                    onClick={() => {
                      setSelectedManual(key);
                      submitMood(key, 'manual');
                    }}
                  >
                    <span className="mood-btn__emoji">{m.emoji}</span>
                    <span className="mood-btn__label">{m.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {permission === 'granted' && tab === 'camera' && !captured && (
            <button className="btn btn-ghost btn-sm" style={{ marginTop: 16 }} onClick={stopCamera}>
              Turn off camera
            </button>
          )}
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span className="card-title" style={{ marginBottom: 0 }}>RECOMMENDED MIX</span>
            {resultPlaylist && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--color-smoke)', fontFamily: 'var(--font-neuemachinainktrap)' }}>LANG:</span>
                <select
                  value={selectedLanguage}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  style={{
                    backgroundColor: 'var(--surface-nav-veil)',
                    border: '1px solid var(--color-twilight)',
                    borderRadius: 'var(--radius-cards)',
                    padding: '4px 10px',
                    fontSize: 12,
                    color: 'var(--color-carbon-vellum)',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  <option value="">All</option>
                  <option value="english">English</option>
                  <option value="hindi">Hindi</option>
                  <option value="spanish">Spanish</option>
                  <option value="japanese">Japanese</option>
                  <option value="korean">Korean</option>
                  <option value="french">French</option>
                </select>
              </div>
            )}
          </div>
          {saving ? (
            <div className="skeleton" style={{ height: 260 }} />
          ) : resultPlaylist ? (
            <PlaylistCard playlist={resultPlaylist} />
          ) : (
            <div className="card empty-state">
              <h3>Waiting on a mood</h3>
              <p>Detect or select an emotion to generate a playlist matched to it.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
