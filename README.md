# AuraSync — AI Emotion-Based Music Recommendation System

A full-stack MERN application that reads your facial expression (or a manual
mood pick) and curates a matching Spotify playlist, with an emotion history,
analytics dashboard, and a light/dark professional UI.

```
aurasync/
├── backend/    Node.js + Express + MongoDB API (JWT auth, Spotify OAuth)
└── frontend/   React (Vite) client — face-api.js, Chart.js, jsPDF
```

## 1. Prerequisites

- Node.js 18+
- MongoDB (local install or a free MongoDB Atlas cluster)
- A Spotify Developer app: https://developer.spotify.com/dashboard
  - Add `http://127.0.0.1:5000/api/spotify/callback` as a Redirect URI

## 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env      # then fill in MONGO_URI, JWT_SECRET, SPOTIFY_* keys
npm run dev                # starts on http://localhost:5000
```

## 3. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env       # VITE_API_URL=http://localhost:5000/api
npm run dev                 # starts on http://localhost:5173
```

The face-api.js model weights are already included in
`frontend/public/models` (tiny face detector + expression model, ~500KB
total) — no extra download needed. If they're ever missing, see
`frontend/public/models/README.md` for how to refetch them.

## 4. How it works

- **Auth** — register/login issue a JWT, stored both as an httpOnly cookie
  and in `localStorage` as a fallback; `middleware/auth.js` protects routes.
- **Emotion detection** — `Detect.jsx` runs face-api.js entirely client-side
  against the webcam feed (no image is ever uploaded); the manual tab posts
  a mood directly.
- **Recommendations** — each mood maps to Spotify audio-feature targets
  (`backend/config/emotions.js`) fed into the `/recommendations` endpoint;
  results are saved as a `Playlist` document tied to the user.
- **Analytics** — MongoDB aggregation pipelines compute weekly frequency,
  a 6-month trend, the all-time most common emotion, and genre spread from
  saved playlists; the page also exports a PDF report via jsPDF.
- **Settings** — theme toggle (persisted per-user), Spotify connect/disconnect,
  and account deletion (cascades to emotion logs and playlists).

## 5. Security notes

- Passwords hashed with bcrypt (12 salt rounds).
- JWT-based auth with httpOnly cookies + `helmet`, `express-mongo-sanitize`,
  and rate limiting on the API.
- All secrets are read from `.env` — never commit real keys.
