import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  withCredentials: true, // send httpOnly refresh token cookie
});

// Request interceptor: attach Bearer token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('chemischill_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: on 401 → try refresh → retry
let refreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      if (refreshing) {
        // Wait for ongoing refresh
        return new Promise((resolve) => {
          refreshQueue.push((token: string) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(api(original));
          });
        });
      }

      refreshing = true;
      try {
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const { access_token } = res.data;
        localStorage.setItem('chemischill_token', access_token);
        refreshQueue.forEach((cb) => cb(access_token));
        refreshQueue = [];
        original.headers.Authorization = `Bearer ${access_token}`;
        return api(original);
      } catch {
        localStorage.removeItem('chemischill_token');
        localStorage.removeItem('chemischill_user');
        window.location.href = '/login';
        return Promise.reject(error);
      } finally {
        refreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
