import api from './axios';

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

export const userApi = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
  deleteAccount: () => api.delete('/user/account'),
};

export const emotionApi = {
  log: (data) => api.post('/emotions', data),
  history: (page = 1, limit = 20) => api.get(`/emotions/history?page=${page}&limit=${limit}`),
  stats: () => api.get('/emotions/stats'),
};

export const recommendationApi = {
  get: (emotion) => api.get(`/recommendations?emotion=${emotion}`),
};

export const spotifyApi = {
  connect: () => api.post('/spotify/connect'),
  playlists: () => api.get('/spotify/playlists'),
  disconnect: () => api.delete('/spotify/disconnect'),
};
