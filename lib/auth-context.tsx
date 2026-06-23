import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authFetch, setUnauthorizedHandler } from '@/lib/api-client';
import { RAILWAY_ENDPOINTS } from '@/constants/railway-api';
import {
  getToken,
  setToken,
  removeToken,
  getStoredUser,
  setStoredUser,
  clearStoredUser,
} from '@/lib/auth-storage';
import { User } from '@/types/api';

export type AuthStatus = 'loading' | 'authed' | 'guest';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  status: AuthStatus;
  signIn: (token: string, user: User) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

function resolveSettingUser(raw: unknown): User | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const obj = raw as { data?: unknown; user?: unknown };
  const candidate = (obj.data ?? obj.user ?? raw) as User;
  return candidate && typeof candidate.email === 'string' ? candidate : null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  useEffect(() => {
    let active = true;

    (async () => {
      const storedToken = await getToken();
      const storedUser = await getStoredUser();

      if (!active) {
        return;
      }

      setTokenState(storedToken);
      setUser(storedUser);
      setStatus(storedToken ? 'authed' : 'guest');
    })();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    // On any 401, drop the session and return to login (no refresh endpoint exists).
    setUnauthorizedHandler(() => {
      void clearStoredUser();
      setTokenState(null);
      setUser(null);
      setStatus('guest');
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  const signIn = async (nextToken: string, nextUser: User): Promise<void> => {
    await setToken(nextToken);
    await setStoredUser(nextUser);
    setTokenState(nextToken);
    setUser(nextUser);
    setStatus('authed');
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const resp = await authFetch<unknown>(RAILWAY_ENDPOINTS.setting, { method: 'GET' });
      const fresh = resolveSettingUser(resp);
      if (fresh) {
        await setStoredUser(fresh);
        setUser(fresh);
      }
    } catch {
      void 0;
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await authFetch(RAILWAY_ENDPOINTS.logout, { method: 'POST' });
    } catch {
      // Best-effort logout; ignore network/auth failures.
    }
    await removeToken();
    await clearStoredUser();
    setTokenState(null);
    setUser(null);
    setStatus('guest');
  };

  return (
    <AuthContext.Provider value={{ user, token, status, signIn, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
