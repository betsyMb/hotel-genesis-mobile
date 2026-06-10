import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'hotel_app_token';
let inMemoryToken: string | null = null;

async function getToken(): Promise<string | null> {
  if (inMemoryToken) return inMemoryToken;

  try {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    if (token) {
      inMemoryToken = token;
      return token;
    }
  } catch {
    // SecureStore not available, fall through
  }

  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (token) {
      inMemoryToken = token;
      return token;
    }
  } catch {
    // AsyncStorage not available either
  }

  return null;
}

async function setToken(token: string): Promise<void> {
  inMemoryToken = token;

  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    return;
  } catch {
    // SecureStore not available
  }

  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch {
    // Both failed, token only in memory
  }
}

async function removeToken(): Promise<void> {
  inMemoryToken = null;

  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch {
    // ignore
  }

  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = await getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    await removeToken();
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${response.status}`);
  }

  const text = await response.text();
  if (!text) return null;
  return JSON.parse(text);
}

async function fetchPublic(url: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${response.status}`);
  }

  const text = await response.text();
  if (!text) return null;
  return JSON.parse(text);
}

export const api = {
  get: (url: string) => fetchWithAuth(url, { method: 'GET' }),

  post: (url: string, data: unknown) =>
    fetchWithAuth(url, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  postPublic: (url: string, data: unknown) =>
    fetchPublic(url, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  patch: (url: string, data: unknown) =>
    fetchWithAuth(url, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (url: string) =>
    fetchWithAuth(url, { method: 'DELETE' }),

  getToken,
  setToken,
  removeToken,
};
