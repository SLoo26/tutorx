import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api, setToken } from '../api/client';
import { Role, User } from '../api/types';

interface RegisterInput {
  role: 'parent' | 'tutor';
  name: string;
  email: string;
  password: string;
  phone?: string;
  postal_code?: string;
  region?: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (input: RegisterInput) => Promise<User>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadMe() {
    try {
      const res = await api.get<{ user: User }>('/auth/me');
      setUser(res.user);
    } catch {
      setToken(null);
      setUser(null);
    }
  }

  useEffect(() => {
    (async () => {
      await loadMe();
      setLoading(false);
    })();
  }, []);

  async function login(email: string, password: string) {
    const res = await api.post<{ token: string; user: User }>('/auth/login', { email, password });
    setToken(res.token);
    setUser(res.user);
    return res.user;
  }

  async function register(input: RegisterInput) {
    const res = await api.post<{ token: string; user: User }>('/auth/register', input);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  }

  function logout() {
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh: loadMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function homePathForRole(role: Role): string {
  if (role === 'tutor') return '/tutor';
  if (role === 'admin') return '/admin';
  return '/parent';
}
