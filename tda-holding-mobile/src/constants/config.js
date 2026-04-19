import { Platform } from 'react-native';

// Android emulator: 10.0.2.2, iOS simulator/Web: localhost
// Physical device: use your machine's local IP (e.g. 192.168.x.x)
export const API_BASE_URL = Platform.select({
  android: 'http://10.0.2.2:8000/api',
  ios: 'http://192.168.100.16:8000/api',
  web: 'http://127.0.0.1:8000/api',
  default: 'http://127.0.0.1:8000/api',
});

export const STORAGE_KEYS = {
  AUTH_TOKEN: '@tda_auth_token',
  USER_DATA: '@tda_user_data',
};

export const BOOKING_STATUS = {
  pending: { label: 'En attente', color: '#F59E0B' },
  confirmed: { label: 'Confirmée', color: '#3B82F6' },
  in_progress: { label: 'En cours', color: '#8B5CF6' },
  completed: { label: 'Terminée', color: '#16A34A' },
  cancelled: { label: 'Annulée', color: '#DC2626' },
  rejected: { label: 'Rejetée', color: '#EA580C' },
};

export const TRANSACTION_STATUS = {
  pending: { label: 'En attente', color: '#F59E0B' },
  confirmed: { label: 'Confirmée', color: '#3B82F6' },
  completed: { label: 'Terminée', color: '#16A34A' },
};

export const PROPERTY_TYPES = [
  { value: 'villa', label: 'Villa' },
  { value: 'apartment', label: 'Appartement' },
  { value: 'house', label: 'Maison' },
  { value: 'duplex', label: 'Duplex' },
  { value: 'studio', label: 'Studio' },
  { value: 'land', label: 'Terrain' },
  { value: 'commercial', label: 'Commercial' },
];
