import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
});

// Fall back to a stored bearer token if cookies aren't available (e.g. some
// mobile webviews strip third-party cookies).
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('aurasync_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
