# AuraSync — AI Emotion-Based Music Recommendation System

AuraSync detects your facial expression via webcam (or lets you pick a mood manually),
generates a glowing animated "aura" that reflects that emotion, and recommends Spotify
music that matches how you feel.

Stack: **React (Vite) + Tailwind CSS** on the frontend, **Node.js/Express + MongoDB** on
the backend, **face-api.js** for in-browser emotion detection, and the **Spotify Web API**
for real recommendations.

---

## 1. Project Structure

```
aurasync/
├── backend/                  Express API (MVC)
│   ├── config/db.js
│   ├── models/                User.js, EmotionHistory.js
│   ├── middleware/             auth.js, errorHandler.js, rateLimiter.js, validators.js
│   ├── controllers/            authController, userController, emotionController,
│   │                            recommendationController, spotifyController
│   ├── routes/                 authRoutes, userRoutes, emotionRoutes,
│   │                            recommendationRoutes, spotifyRoutes
│   ├── utils/                  generateToken, recommendationEngine, spotifyService
│   └── server.js
└── frontend/                 React app
    ├── src/
    │   ├── api/                axios instance + endpoint helpers
    │   ├── context/             AuthContext, ThemeContext, EmotionContext
    │   ├── components/          Aura, EmotionDetector, MoodSelector, Navbar,
    │   │                        EmotionCard, PlaylistCard, Charts/*, Skeleton,
    │   │                        ErrorBoundary, ProtectedRoute
    │   └── pages/               Login, Register, Dashboard, History, Analytics, Settings
    └── public/models/          face-api.js model weights go here
```

---

## 2. Installation

### Prerequisites
- Node.js 18+
- A MongoDB Atlas cluster (or local MongoDB)
- A Spotify Developer app (for OAuth) — https://developer.spotify.com/dashboard

### Backend

```bash
cd backend
npm install
cp .env.example .env   # then fill in the values (see section 3)
npm run dev            # starts on http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env   # set VITE_API_URL if different from default
npm run dev            # starts on http://localhost:5173
```

### Face detection models (required for camera mode)

Download these four files from the [face-api.js weights repo](https://github.com/justadudewhohacks/face-api.js-models)
into `frontend/public/models/`:

- `tiny_face_detector_model-weights_manifest.json`
- `tiny_face_detector_model-shard1`
- `face_expression_model-weights_manifest.json`
- `face_expression_model-shard1`

Manual mood selection works without these files, so the app is still fully usable without them.

---

## 3. Environment Variables

### `backend/.env`

| Variable | Description |
|---|---|
| `PORT` | Port the API listens on (default `5000`) |
| `NODE_ENV` | `development` or `production` |
| `CLIENT_URL` | Frontend origin, used for CORS and the Spotify OAuth redirect |
| `MONGO_URI` | MongoDB Atlas (or local) connection string |
| `JWT_SECRET` | Long random string used to sign auth tokens |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d` |
| `SPOTIFY_CLIENT_ID` | From your Spotify Developer app |
| `SPOTIFY_CLIENT_SECRET` | From your Spotify Developer app |
| `SPOTIFY_REDIRECT_URI` | Must exactly match the redirect URI registered in the Spotify dashboard, e.g. `http://localhost:5000/api/spotify/callback` |
| `RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX` | General API rate limiting |

### `frontend/.env`

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the backend API, e.g. `http://localhost:5000/api` |

---

## 4. API Documentation

Base URL: `/api`

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | `{ name, email, password }` → creates a user, returns `{ token, user }` |
| POST | `/auth/login` | Public | `{ email, password }` → `{ token, user }` |
| POST | `/auth/logout` | Private | Clears auth cookie (client also discards local token) |
| GET | `/auth/me` | Private | Returns the current authenticated user |

### User
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/user/profile` | Private | Get profile |
| PUT | `/user/profile` | Private | `{ name?, theme?, notifications? }` |
| DELETE | `/user/account` | Private | Deletes account + all emotion history |

### Emotions
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/emotions` | Private | `{ emotion, confidence?, source?, playlistName?, playlistUrl? }` — logs a check-in |
| GET | `/emotions/history?page=&limit=` | Private | Paginated emotion history |
| GET | `/emotions/stats` | Private | Weekly frequency, monthly trend, most common emotion, genre distribution |

### Recommendations
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/recommendations?emotion=happy` | Private | Returns aura color/emoji, genre seeds, and live Spotify tracks (if connected) |

### Spotify
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/spotify/connect` | Private | Returns the Spotify OAuth `url` to redirect the user to |
| GET | `/spotify/callback` | Public | OAuth redirect target; stores tokens, redirects to `/settings` |
| GET | `/spotify/playlists` | Private | Returns the connected user's Spotify playlists |
| DELETE | `/spotify/disconnect` | Private | Removes stored Spotify tokens |

All private routes require `Authorization: Bearer <token>`.

---

## 5. Emotion → Aura/Genre Mapping

| Emotion | Aura color | Genres |
|---|---|---|
| Happy | Yellow `#FFD93D` | pop, dance, feel-good |
| Sad | Blue `#4D96FF` | acoustic, piano, chill |
| Angry | Red `#FF4D4D` | rock, metal, hip-hop |
| Fear | Purple `#9B5DE5` | ambient, lo-fi |
| Neutral | White `#E5E7EB` | pop, indie, chill |
| Excited | Orange `#FF8A00` | edm, party, dance |
| Relaxed | Green `#4CD97B` | chill, jazz, lo-fi |
| Surprised | Teal `#00C2A8` | pop, electronic |
| Disgusted | Brown `#8D6E63` | punk, alternative |

This mapping lives in `backend/utils/recommendationEngine.js` (source of truth for the API)
and is mirrored in `frontend/src/context/EmotionContext.jsx` (for instant UI feedback before
the API responds).

---

## 6. Deployment Guide

### Backend → Render
1. Push the `backend/` folder to a Git repo (or the whole monorepo with root directory set to `backend`).
2. Create a new **Web Service** on Render, connect the repo.
3. Build command: `npm install`. Start command: `npm start`.
4. Add all variables from `backend/.env.example` in Render's Environment tab.
5. Set `CLIENT_URL` to your deployed Vercel URL, and `SPOTIFY_REDIRECT_URI` to
   `https://<your-render-app>.onrender.com/api/spotify/callback` (update this in the Spotify
   dashboard too).

### Frontend → Vercel
1. Import the `frontend/` folder as a new Vercel project.
2. Framework preset: Vite.
3. Add `VITE_API_URL=https://<your-render-app>.onrender.com/api` as an environment variable.
4. Deploy.

### Database → MongoDB Atlas
1. Create a free cluster, add a database user, and allow network access from `0.0.0.0/0`
   (or Render's static IPs if you enable them).
2. Copy the connection string into `MONGO_URI`.

### Spotify App Setup
1. Create an app at https://developer.spotify.com/dashboard.
2. Add both your local (`http://localhost:5000/api/spotify/callback`) and production redirect
   URIs under "Redirect URIs".
3. Copy the Client ID/Secret into your backend env vars.

---

## 7. Security Notes

- Passwords are hashed with bcrypt before storage; the hash is never returned by the API.
- JWTs are signed with `JWT_SECRET` and expire after `JWT_EXPIRES_IN`.
- `helmet` sets secure HTTP headers; `express-mongo-sanitize` strips NoSQL-injection payloads.
- `express-rate-limit` throttles both general API traffic and auth endpoints specifically.
- All mutating endpoints validate input with `express-validator`.
- Spotify tokens are stored with `select: false` so they're never returned in normal queries.

## 8. Known Limitations / Next Steps

- Spotify's client-credentials-only recommendation endpoints were deprecated for new apps;
  this project searches by genre keyword as a working substitute — swap in Spotify's
  recommendation/audio-features endpoints if your app has extended access.
- Token refresh for expired Spotify access tokens isn't wired into a scheduled job; the
  `refreshAccessToken` helper in `spotifyService.js` is ready to be called from middleware
  when a request fails with 401 from Spotify.
- Push notifications are represented as a settings toggle only — wire up a real provider
  (e.g. web push) if you need actual delivery.
