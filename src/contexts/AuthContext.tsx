import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'student' | 'admin' | 'mess_staff';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  roomNumber?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const MOCK_USERS: Record<string, User & { password: string }> = {
  'student@rvce.edu.in': {
    id: '1',
    email: 'student@rvce.edu.in',
    name: 'Rahul Sharma',
    role: 'student',
    roomNumber: 'A-204',
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

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
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

  const logout = () => {
    setUser(null);
    localStorage.removeItem('smartHostel_user');
    localStorage.removeItem('smartHostel_token');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
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
