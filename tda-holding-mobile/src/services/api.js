import axios from 'axios';
import storage from '../utils/storage';
import { API_BASE_URL, STORAGE_KEYS } from '../constants/config';

// Global auth event — AuthContext subscribes to this
let onUnauthorizedCallback = null;
export function setOnUnauthorized(cb) {
  onUnauthorizedCallback = cb;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15000,
});

// Interceptor: attach token
api.interceptors.request.use(async (config) => {
  const token = await storage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: handle 401 — clear auth and notify context
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await storage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      await storage.removeItem(STORAGE_KEYS.USER_DATA);
      onUnauthorizedCallback?.();
    }
    return Promise.reject(error);
  }
);

// --- Auth ---
export const authAPI = {
  login: (login, password) => api.post('/auth/login', { login, password }),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  profile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/password', data),
};

// --- Vehicles ---
export const vehiclesAPI = {
  list: (params = {}) => api.get('/vehicles', { params }),
  detail: (id) => api.get(`/vehicles/${id}`),
};

// --- Properties ---
export const propertiesAPI = {
  list: (params = {}) => api.get('/properties', { params }),
  detail: (id) => api.get(`/properties/${id}`),
};

// --- Drivers ---
export const driversAPI = {
  list: (params = {}) => api.get('/drivers', { params }),
  detail: (id) => api.get(`/drivers/${id}`),
};

// --- Categories ---
export const categoriesAPI = {
  list: (params = {}) => api.get('/categories', { params }),
};

// --- Bookings ---
export const bookingsAPI = {
  list: (params = {}) => api.get('/bookings', { params }),
  detail: (id) => api.get(`/bookings/${id}`),
  create: (data) => api.post('/bookings', data),
  cancel: (id, reason) => api.post(`/bookings/${id}/cancel`, { reason }),
};

// --- Transactions ---
export const transactionsAPI = {
  list: (params = {}) => api.get('/transactions', { params }),
};

// --- Notifications ---
export const notificationsAPI = {
  list: () => api.get('/notifications'),
  markAsRead: (id) => api.post(`/notifications/${id}/read`),
  markAllAsRead: () => api.post('/notifications/read-all'),
};

// --- Favorites ---
export const favoritesAPI = {
  list: () => api.get('/favorites'),
  toggle: (data) => api.post('/favorites/toggle', data),
  check: (type, id) => api.get('/favorites', { params: { check: `${type}:${id}` } }),
};

// --- Appointments ---
export const appointmentsAPI = {
  list: (params = {}) => api.get('/appointments', { params }),
  detail: (id) => api.get(`/appointments/${id}`),
  create: (data) => api.post('/appointments', data),
  cancel: (id) => api.post(`/appointments/${id}/cancel`),
};

export default api;
