import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import type {
  AuthMessageResponse,
  AuthSessionResponse,
  AuthUser,
  LoginRequest,
} from '@testforge/shared-types';
import { apiRequest, ApiClientError } from '@/lib/api';

interface AuthContextValue {
  user: AuthUser | null;
  accessToken: string | null;
  isBootstrapping: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<string | null>;
  fetchWithAuth: <TResponse>(path: string, options?: RequestInit) => Promise<TResponse>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const applySession = useCallback((payload: AuthSessionResponse) => {
    setUser(payload.user);
    setAccessToken(payload.accessToken);
  }, []);

  const clearSession = useCallback(() => {
    setUser(null);
    setAccessToken(null);
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const payload = await apiRequest<AuthSessionResponse>('/auth/refresh', {
        method: 'POST',
      });

      applySession(payload);
      return payload.accessToken;
    } catch {
      clearSession();
      return null;
    }
  }, [applySession, clearSession]);

  const login = useCallback(
    async (payload: LoginRequest) => {
      const session = await apiRequest<AuthSessionResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      applySession(session);
    },
    [applySession],
  );

  const logout = useCallback(async () => {
    try {
      await apiRequest<AuthMessageResponse>('/auth/logout', {
        method: 'POST',
      });
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const fetchWithAuth = useCallback(
    async <TResponse,>(path: string, options: RequestInit = {}) => {
      try {
        return await apiRequest<TResponse>(path, {
          ...options,
          accessToken,
        });
      } catch (error) {
        if (!(error instanceof ApiClientError) || error.statusCode !== 401) {
          throw error;
        }

        const refreshedAccessToken = await refreshSession();

        if (!refreshedAccessToken) {
          throw error;
        }

        return apiRequest<TResponse>(path, {
          ...options,
          accessToken: refreshedAccessToken,
        });
      }
    },
    [accessToken, refreshSession],
  );

  useEffect(() => {
    void refreshSession().finally(() => {
      setIsBootstrapping(false);
    });
  }, [refreshSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      isBootstrapping,
      isAuthenticated: Boolean(user && accessToken),
      login,
      logout,
      refreshSession,
      fetchWithAuth,
    }),
    [accessToken, fetchWithAuth, isBootstrapping, login, logout, refreshSession, user],
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
