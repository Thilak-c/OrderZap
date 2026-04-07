import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../api/client';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Restaurant {
  short_id: string;
  name: string;
  logo?: string;
  phone?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  restaurant: Restaurant | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('oz_auth_token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        const { staff, restaurant } = response.data.data;
        setUser(staff);
        setRestaurant(restaurant);
        setIsAuthenticated(true);
      } catch (err) {
        console.error('Failed to restore session:', err);
        localStorage.removeItem('oz_auth_token');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, staff, restaurant } = response.data.data;
      
      localStorage.setItem('oz_auth_token', token);
      setUser(staff);
      setRestaurant(restaurant);
      setIsAuthenticated(true);
    } catch (err: any) {
      const message = err.response?.data?.error || err.response?.data?.message || 'Login failed';
      throw new Error(message);
    }
  };

  const logout = () => {
    localStorage.removeItem('oz_auth_token');
    setUser(null);
    setRestaurant(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, restaurant, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
