import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authFetch } from '@/lib/api-client';
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

  const signIn = async (nextToken: string, nextUser: User): Promise<void> => {
    await setToken(nextToken);
    await setStoredUser(nextUser);
    setTokenState(nextToken);
    setUser(nextUser);
    setStatus('authed');
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
    <AuthContext.Provider value={{ user, token, status, signIn, signOut }}>
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
