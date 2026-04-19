import AsyncStorage from '@react-native-async-storage/async-storage';

// Fallback in-memory storage for Expo Go
const memoryStorage = {};

const storage = {
  async getItem(key) {
    try {
      return await AsyncStorage.getItem(key);
    } catch (e) {
      console.warn(`AsyncStorage.getItem failed for ${key}, using memory fallback:`, e.message);
      return memoryStorage[key] || null;
    }
  },

  async setItem(key, value) {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      console.warn(`AsyncStorage.setItem failed for ${key}, using memory fallback:`, e.message);
      memoryStorage[key] = value;
    }
  },

  async removeItem(key) {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.warn(`AsyncStorage.removeItem failed for ${key}, using memory fallback:`, e.message);
      delete memoryStorage[key];
    }
  },

  async clear() {
    try {
      await AsyncStorage.clear();
    } catch (e) {
      console.warn('AsyncStorage.clear failed, clearing memory fallback:', e.message);
      Object.keys(memoryStorage).forEach(key => delete memoryStorage[key]);
    }
  },
};

export default storage;
