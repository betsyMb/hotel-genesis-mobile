import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Role } from '../api/types';
import { api } from '../api/client';
// const BASE_URL = 'http://192.168.0.102:3000';
const BASE_URL = 'http://localhost:3000';

const USER_KEY = 'hotel_app_user';

function decodeJwt(token: string): any {
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

async function getUserData(): Promise<User | null> {
  try {
    const raw = await SecureStore.getItemAsync(USER_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  try {
    const raw = await AsyncStorage.getItem(USER_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return null;
}

async function setUserData(user: User): Promise<void> {
  const raw = JSON.stringify(user);
  try { await SecureStore.setItemAsync(USER_KEY, raw); return; } catch { /* ignore */ }
  try { await AsyncStorage.setItem(USER_KEY, raw); } catch { /* ignore */ }
}

async function removeUserData(): Promise<void> {
  try { await SecureStore.deleteItemAsync(USER_KEY); } catch { /* ignore */ }
  try { await AsyncStorage.removeItem(USER_KEY); } catch { /* ignore */ }
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  hasRole: (...roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    restoreSession();
  }, []);

  async function restoreSession() {
    try {
      const storedToken = await api.getToken();
      if (storedToken) {
        setTokenState(storedToken);

        const storedUser = await getUserData();
        if (storedUser) {
          setUser(storedUser);
          setIsLoading(false);
          return;
        }

        const decoded = decodeJwt(storedToken);
        if (decoded?.sub) {
          const restored: User = {
            id_user: decoded.sub,
            email: decoded.email || '',
            role: decoded.role as Role,
            id_rol: decoded.id_rol,
            full_name: decoded.full_name || '',
          };
          setUser(restored);
          setUserData(restored);
        }
      }
    } catch {
      await api.removeToken().catch(() => {});
      await removeUserData();
    } finally {
      setIsLoading(false);
    }
  }

  async function login(email: string, password: string): Promise<User> {
    setIsLoading(true);
    try {
      const data = await api.postPublic(`${BASE_URL}/auth/login`, { email, password });
      await api.setToken(data.access_token);
      setTokenState(data.access_token);
      setUser(data.user);
      setUserData(data.user);
      return data.user;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  async function logout() {
    await api.removeToken().catch(() => {});
    await removeUserData();
    setTokenState(null);
    setUser(null);
  }

  function hasRole(...roles: Role[]): boolean {
    return user ? roles.includes(user.role) : false;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
