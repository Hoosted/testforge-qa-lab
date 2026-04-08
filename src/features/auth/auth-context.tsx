import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { apiRequest, ApiError } from '@/lib/api';
import type { AuthLoginRequest, AuthLoginResponse, AuthSession } from '@/types/playground';

const STORAGE_KEY = 'testforge.session';

interface AuthContextValue {
  session: AuthSession | null;
  isAuthenticated: boolean;
  canWrite: boolean;
  login: (payload: AuthLoginRequest) => Promise<void>;
  logout: () => void;
  expireSession: () => void;
  lastError: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return;
    }

    try {
      setSession(JSON.parse(stored) as AuthSession);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (session) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      return;
    }

    window.localStorage.removeItem(STORAGE_KEY);
  }, [session]);

  const login = useCallback(async (payload: AuthLoginRequest) => {
    try {
      const response = await apiRequest<AuthLoginResponse>('/api/auth/login', {
        method: 'POST',
        json: payload,
      });
      setSession({
        token: response.token,
        role: response.role,
        name: response.name,
        email: response.email,
      });
      setLastError(null);
    } catch (error) {
      setSession(null);
      if (error instanceof ApiError) {
        setLastError(error.message);
        return;
      }
      setLastError('Nao foi possivel iniciar a sessao do sandbox.');
    }
  }, []);

  const logout = useCallback(() => {
    setSession(null);
    setLastError(null);
  }, []);

  const expireSession = useCallback(() => {
    setSession(null);
    setLastError('Sessao limpa localmente para reproduzir expiracao.');
  }, []);

  const clearError = useCallback(() => {
    setLastError(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isAuthenticated: Boolean(session),
      canWrite: session?.role === 'ADMIN',
      login,
      logout,
      expireSession,
      lastError,
      clearError,
    }),
    [clearError, expireSession, lastError, login, logout, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
