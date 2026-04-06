import axios from 'axios';
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';

// Create an instance of axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  withCredentials: true, // required for refresh token cookie
  timeout: 10000, // 10 seconds timeout
});

// Request Interceptor: add the access token to headers
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: handle 401 and refresh token logic
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle Network Errors & Timeouts
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        toast.error('Permintaan terlalu lama. Coba lagi.', { id: 'api-timeout' });
      } else {
        toast.error('Gagal terhubung ke server. Periksa koneksi internetmu.', { id: 'api-network-error' });
      }
      return Promise.reject(error);
    }

    const { status } = error.response;

    // 401 Unauthorized -> Refresh Token Logic
    if (status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = data.data.access_token;
        useAuthStore.getState().setAccessToken(newAccessToken);

        processQueue(null, newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        useAuthStore.getState().logout();
        window.location.href = '/login'; // Redirect to login
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    // 403 Forbidden -> Redirect to 403
    if (status === 403) {
      window.location.href = '/403';
    }

    // 500, 502, 503 Server Errors -> Redirect to 500
    if (status >= 500) {
      window.location.href = '/500';
    }

    return Promise.reject(error);
  }
);

export default api;
