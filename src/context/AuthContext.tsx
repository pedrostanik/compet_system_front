import { createContext, useContext, useState } from 'react';
import { login as loginApi } from '@/api/authApi';

interface AuthContextType {
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('token')
  );

  function logout() {
    setToken(null);
    localStorage.removeItem('token');
  }

  async function login(username: string, password: string) {
    const t = await loginApi(username, password);
    setToken(t);
    localStorage.setItem('token', t);
  }

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}