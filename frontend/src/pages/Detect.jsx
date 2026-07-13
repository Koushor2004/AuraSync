import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { EMOTIONS, FACE_API_TO_EMOTION, MANUAL_EMOTIONS } from '../utils/emotions.js';
import PageHeader from '../components/PageHeader.jsx';
import AuraRing from '../components/AuraRing.jsx';
import PlaylistCard from '../components/PlaylistCard.jsx';
import './Detect.css';

const MODEL_URL = '/models'; // face-api.js weights served from /public/models

export default function Detect() {
  const { updateUser } = useAuth();
  const [tab, setTab] = useState('camera');

  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [modelError, setModelError] = useState('');
  const [permission, setPermission] = useState('idle'); // idle | requesting | granted | denied
  const [detecting, setDetecting] = useState(false);
  const [liveResult, setLiveResult] = useState(null); // { emotion, confidence }

  const [selectedManual, setSelectedManual] = useState(null);
  const [saving, setSaving] = useState(false);
  const [resultPlaylist, setResultPlaylist] = useState(null);
  const [error, setError] = useState('');

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCamera = async () => {
    setError('');
    setPermission('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 480, height: 360 } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setPermission('granted');
      setDetecting(true);
      intervalRef.current = setInterval(runDetection, 700);
    } catch (err) {
      setPermission('denied');
    }
  };

  const stopCamera = () => {
    clearInterval(intervalRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setDetecting(false);
  };

  const runDetection = async () => {
    if (!videoRef.current || videoRef.current.readyState < 2) return;
    const detection = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceExpressions();

    if (!detection) {
      setLiveResult(null);
      return;
    }
    const expressions = detection.expressions;
    const [topKey, topScore] = Object.entries(expressions).sort((a, b) => b[1] - a[1])[0];
    const emotion = FACE_API_TO_EMOTION[topKey] || 'neutral';
    setLiveResult({ emotion, confidence: Math.round(topScore * 100) });
  };

  const confirmCameraMood = async () => {
    if (!liveResult) return;
    await submitMood(liveResult.emotion, 'camera', liveResult.confidence);
  };

  const submitMood = async (emotion, source, confidence = 100) => {
    setSaving(true);
    setError('');
    setResultPlaylist(null);
    try {
      const logRes = await api.post('/emotion/log', { emotion, source, confidence });
      updateUser({ currentEmotion: emotion, currentAura: logRes.data.aura });

      const recRes = await api.get(`/spotify/recommendations?emotion=${emotion}`);
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

  const meta = liveResult ? EMOTIONS[liveResult.emotion] : null;

  return (
    <div className="page">
      <PageHeader
        eyebrow="Detect mood"
        title="What's your aura right now?"
        subtitle="Use your camera for an instant read, or pick your mood manually."
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
        <div>
          {tab === 'camera' ? (
            <div className="camera-frame">
              <video ref={videoRef} autoPlay muted playsInline />

              {permission !== 'granted' && (
                <div className="camera-frame__overlay">
                  {modelError ? (
                    <p style={{ color: 'var(--e-angry)' }}>{modelError}</p>
                  ) : !modelsLoaded ? (
                    <>
                      <AuraRing color="var(--brand)" size={54} confidence={60} spinning />
                      <p style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>Loading detection models…</p>
                    </>
                  ) : permission === 'denied' ? (
                    <>
                      <p style={{ fontWeight: 600 }}>Camera access denied</p>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                        Enable camera permission in your browser settings, or switch to manual selection.
                      </p>
                      <button className="btn btn-secondary btn-sm" onClick={startCamera}>Try again</button>
                    </>
                  ) : (
                    <>
                      <p style={{ fontWeight: 600 }}>Camera is off</p>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 260 }}>
                        We only process a lightweight frame in-browser — nothing is uploaded or stored.
                      </p>
                      <button className="btn btn-primary btn-sm" onClick={startCamera}>Enable camera</button>
                    </>
                  )}
                </div>
              )}

              {permission === 'granted' && liveResult && (
                <div className="camera-frame__badge">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 22 }}>{meta.emoji}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{meta.label}</div>
                      <div style={{ fontSize: 11.5, color: '#B8BCC8', fontFamily: 'var(--font-mono)' }}>
                        {liveResult.confidence}% confidence
                      </div>
                    </div>
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={confirmCameraMood} disabled={saving}>
                    {saving ? 'Saving…' : 'Use this mood'}
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
                    style={{ '--c': m.color }}
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

          {permission === 'granted' && tab === 'camera' && (
            <button className="btn btn-ghost btn-sm" style={{ marginTop: 14 }} onClick={stopCamera}>
              Turn off camera
            </button>
          )}
        </div>

        <div>
          <div className="card-title">Your recommended mix</div>
          {saving ? (
            <div className="skeleton" style={{ height: 220 }} />
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
