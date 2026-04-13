import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../../services/auth';
import { usersService } from '../../services/users';
import { adaptUser } from '../../lib/adapters';

interface User {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  birthYear?: string;
  school?: string;
  phone?: string;
  role: 'USER' | 'ADMIN';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // On mount: validate token by fetching fresh user data
  useEffect(() => {
    const token = localStorage.getItem('chemischill_token');
    if (!token) return;

    usersService.getMe()
      .then((res) => {
        const adapted = adaptUser(res.data) as User;
        setUser(adapted);
        localStorage.setItem('chemischill_user', JSON.stringify(adapted));
      })
      .catch(() => {
        localStorage.removeItem('chemischill_token');
        localStorage.removeItem('chemischill_user');
        setUser(null);
      });
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authService.login(email, password);
    const { access_token, user: apiUser } = res.data;
    localStorage.setItem('chemischill_token', access_token);
    const adapted = adaptUser(apiUser) as User;
    setUser(adapted);
    localStorage.setItem('chemischill_user', JSON.stringify(adapted));
  };

  const register = async (username: string, email: string, password: string) => {
    const res = await authService.register(username, email, password);
    const { access_token, user: apiUser } = res.data;
    localStorage.setItem('chemischill_token', access_token);
    const adapted = adaptUser(apiUser) as User;
    setUser(adapted);
    localStorage.setItem('chemischill_user', JSON.stringify(adapted));
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // ignore errors on logout
    }
    localStorage.removeItem('chemischill_token');
    localStorage.removeItem('chemischill_user');
    setUser(null);
  };

  const updateProfile = (data: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
    localStorage.setItem('chemischill_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        updateProfile,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
