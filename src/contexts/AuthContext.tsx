import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, LoginResponse } from '@/services/api';

export type UserRole = 'student' | 'admin' | 'mess_staff';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  roomNumber?: string;
  studentId?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  useMockAuth: boolean;
  setUseMockAuth: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo (fallback when backend is unavailable)
const MOCK_USERS: Record<string, User & { password: string }> = {
  'student@rvce.edu.in': {
    id: '1',
    email: 'student@rvce.edu.in',
    name: 'Rahul Sharma',
    role: 'student',
    roomNumber: 'A-204',
    studentId: '1RV21CS001',
    password: 'password123',
  },
  'admin@rvce.edu.in': {
    id: '2',
    email: 'admin@rvce.edu.in',
    name: 'Dr. Priya Rao',
    role: 'admin',
    password: 'password123',
  },
  'mess@rvce.edu.in': {
    id: '3',
    email: 'mess@rvce.edu.in',
    name: 'Suresh Kumar',
    role: 'mess_staff',
    password: 'password123',
  },
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [useMockAuth, setUseMockAuth] = useState(false); // Use real backend API

  useEffect(() => {
    // Check for stored auth token on mount
    const storedUser = localStorage.getItem('smartHostel_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('smartHostel_user');
      }
    }
    setIsLoading(false);
  }, []);

  const loginWithBackend = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response: LoginResponse = await authApi.login(email, password);
      
      const userData: User = {
        id: response.studentId || response.email,
        email: response.email,
        name: response.name,
        role: response.role as UserRole,
        roomNumber: response.roomNumber,
        studentId: response.studentId,
      };
      
      setUser(userData);
      localStorage.setItem('smartHostel_user', JSON.stringify(userData));
      localStorage.setItem('smartHostel_token', response.token);
      
      return { success: true };
    } catch (error: any) {
      console.error('Backend login failed:', error);
      return { success: false, error: error.message || 'Login failed. Please try again.' };
    }
  };

  const loginWithMock = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const mockUser = MOCK_USERS[email.toLowerCase()];
    
    if (!mockUser) {
      return { success: false, error: 'User not found. Please check your email.' };
    }

    if (mockUser.password !== password) {
      return { success: false, error: 'Invalid password. Please try again.' };
    }

    const { password: _, ...userWithoutPassword } = mockUser;
    setUser(userWithoutPassword);
    localStorage.setItem('smartHostel_user', JSON.stringify(userWithoutPassword));
    localStorage.setItem('smartHostel_token', 'mock_jwt_token_' + Date.now());

    return { success: true };
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (useMockAuth) {
      return loginWithMock(email, password);
    }
    
    // Try backend first, fallback to mock if backend is unavailable
    try {
      const result = await loginWithBackend(email, password);
      return result;
    } catch (error) {
      console.warn('Backend unavailable, falling back to mock auth');
      return loginWithMock(email, password);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('smartHostel_user');
    localStorage.removeItem('smartHostel_token');
    
    // Try to call backend logout (fire and forget)
    if (!useMockAuth) {
      authApi.logout().catch(() => {});
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, useMockAuth, setUseMockAuth }}>
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
