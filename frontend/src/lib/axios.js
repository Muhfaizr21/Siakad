import axios from 'axios';
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';

import { API_BASE_URL } from '../services/api';

// Create an instance of axios
const api = axios.create({
  baseURL: API_BASE_URL,
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

    // 401 Unauthorized -> Refresh Token Logic (except for auth requests)
    const reqUrl = originalRequest.url || '';
    const isAuthRequest = reqUrl.includes('/auth/login') || reqUrl.includes('/auth/select-role') || reqUrl.includes('/auth/refresh') || reqUrl.includes('/auth/logout');
    if (status === 401 && !originalRequest._retry && !isAuthRequest) {
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
        // Use the api instance (not global axios) to avoid double /api/ prefix
        const { data } = await api.post(
          '/auth/refresh',
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

    // 403 Forbidden -> Redirect to 403 (but not for auth requests)
    if (status === 403 && !isAuthRequest) {
      window.location.href = '/403';
    }

    // 500, 502, 503 Server Errors -> Redirect to 500 (but not for auth requests)
    if (status >= 500 && !isAuthRequest) {
      window.location.href = '/500';
    }

    return Promise.reject(error);
  }
);

export default api;
