import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as authApi from '@/api/authApi';
import { refreshSession, setAccessToken, setSessionEvents } from '@/api/axios';
import type { Me, Role, Session } from '@/types';

type Status = 'loading' | 'authenticated' | 'anonymous';

interface AuthContextType {
  user: Me | null;
  status: Status;
  login: (email: string, password: string) => Promise<Me>;
  logout: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  /** True if the logged-in user has one of the roles. */
  hasRole: (...roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Me | null>(null);
  const [status, setStatus] = useState<Status>('loading');

  const applySession = useCallback((session: Session) => {
    setAccessToken(session.accessToken);
    setUser(session.user);
    setStatus('authenticated');
  }, []);

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setUser(null);
    setStatus('anonymous');
  }, []);

  useEffect(() => {
    setSessionEvents({
      onSession: session => {
        setUser(session.user);
        setStatus('authenticated');
      },
      onSessionExpired: clearSession,
      onPasswordChangeRequired: () => setUser(u => (u ? { ...u, mustChangePassword: true } : u)),
    });

    // On page load: a valid refresh cookie restores the session without asking for the password.
    let active = true;
    refreshSession().then(session => {
      if (!active) return;
      if (session) applySession(session);
      else clearSession();
    });
    return () => {
      active = false;
    };
  }, [applySession, clearSession]);

  async function login(email: string, password: string) {
    const session = await authApi.login(email, password);
    applySession(session);
    return session.user;
  }

  async function logout() {
    try {
      await authApi.logout();   // revokes the refresh token on the server and clears the cookie
    } finally {
      clearSession();
    }
  }

  async function changePassword(currentPassword: string, newPassword: string) {
    applySession(await authApi.changePassword(currentPassword, newPassword));
  }

  const hasRole = (...roles: Role[]) => !!user && roles.includes(user.role);

  return (
    <AuthContext.Provider value={{ user, status, login, logout, changePassword, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
