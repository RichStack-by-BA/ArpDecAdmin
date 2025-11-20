import axios from 'axios';

import { getToken } from 'src/utils/encrypt-decrypt';
import { API_URL } from 'src/constant';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - only redirect if not already on login page
      if (!window.location.pathname.includes('/sign-in')) {
        localStorage.removeItem('token');
        window.location.href = '/sign-in';
      }
    }
    return Promise.reject(error);
  }
);