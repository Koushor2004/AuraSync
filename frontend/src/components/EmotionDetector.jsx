import { useEffect, useRef, useState, useCallback } from 'react';
import * as faceapi from 'face-api.js';
import toast from 'react-hot-toast';
import Aura from './Aura';
import { AURA_COLORS, EMOTION_EMOJI } from '../context/EmotionContext';

const MODEL_URL = '/models'; // place face-api.js weight files in frontend/public/models

// face-api.js returns these 7 expression labels; we pass them straight through.
const SUPPORTED = ['happy', 'sad', 'angry', 'fearful', 'neutral', 'surprised', 'disgusted'];
const LABEL_MAP = { fearful: 'fear' }; // normalize to our schema's "fear"

export default function EmotionDetector({ onDetect }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);

  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [permission, setPermission] = useState('idle'); // idle | granted | denied
  const [detecting, setDetecting] = useState(false);
  const [current, setCurrent] = useState({ emotion: 'neutral', confidence: 0 });

  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
      } catch (err) {
        toast.error('Could not load face detection models. Check /public/models.');
      }
    };
    loadModels();

    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 480, height: 480 } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setPermission('granted');
      setDetecting(true);
    } catch (err) {
      setPermission('denied');
      toast.error('Camera permission denied. You can switch to manual mood selection.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setDetecting(false);
  };

  const runDetectionLoop = useCallback(() => {
    intervalRef.current = setInterval(async () => {
      if (!videoRef.current || videoRef.current.readyState !== 4) return;

      const result = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

      if (result?.expressions) {
        const sorted = Object.entries(result.expressions).sort((a, b) => b[1] - a[1]);
        const [rawLabel, score] = sorted[0];
        if (SUPPORTED.includes(rawLabel)) {
          const emotion = LABEL_MAP[rawLabel] || rawLabel;
          const confidence = Math.round(score * 100);
          setCurrent({ emotion, confidence });
          onDetect?.({ emotion, confidence, source: 'camera' });
        }
      }
    }, 1500);
  }, [onDetect]);

  useEffect(() => {
    if (detecting && modelsLoaded) {
      runDetectionLoop();
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [detecting, modelsLoaded, runDetectionLoop]);

  const auraColor = AURA_COLORS[current.emotion] || AURA_COLORS.neutral;

  return (
    <div className="flex flex-col items-center gap-5">
      <Aura color={auraColor} size={280}>
        {permission === 'granted' ? (
          <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
        ) : (
          <div className="text-5xl">{EMOTION_EMOJI[current.emotion] || '🙂'}</div>
        )}
      </Aura>

      {!modelsLoaded && (
        <p className="text-xs text-gray-400">Loading detection models…</p>
      )}

      {permission !== 'granted' ? (
        <button className="btn-primary" onClick={startCamera} disabled={!modelsLoaded}>
          Enable Camera
        </button>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <div className="text-sm font-medium">
            Detected: <span className="capitalize">{current.emotion}</span> ({current.confidence}%)
          </div>
          <button className="btn-secondary" onClick={stopCamera}>
            Stop Camera
          </button>
        </div>
      )}
    </div>
  );
}
