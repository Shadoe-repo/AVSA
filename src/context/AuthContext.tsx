import React, { createContext, useContext, useState } from 'react';
import { HospitalUser } from '../types';

interface AuthContextType {
  currentUser: HospitalUser | null;
  isAuthenticated: boolean;
  activeRole: 'PARAMEDIC' | 'HOSPITAL' | 'TRAFFIC' | 'ANALYTICS';
  setActiveRole: (role: 'PARAMEDIC' | 'HOSPITAL' | 'TRAFFIC' | 'ANALYTICS') => void;
  loginWithGoogle: (hospitalId?: string) => Promise<void>;
  logout: () => void;
}

const DEFAULT_DOCTOR: HospitalUser = {
  userId: 'usr_doc_991',
  email: 'dr.chatterjee@apollo-er.med',
  name: 'Dr. Debanjan Chatterjee, MD',
  hospitalId: 'HOSP-021',
  role: 'ER_CHIEF',
  avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=200&q=80'
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<HospitalUser | null>(DEFAULT_DOCTOR);
  const [activeRole, setActiveRole] = useState<'PARAMEDIC' | 'HOSPITAL' | 'TRAFFIC' | 'ANALYTICS'>('PARAMEDIC');

  const loginWithGoogle = async (hospitalId = 'HOSP-021') => {
    // Simulates instant secure Google OAuth mapping to authorized hospital profile
    setCurrentUser({
      ...DEFAULT_DOCTOR,
      hospitalId
    });
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: Boolean(currentUser),
        activeRole,
        setActiveRole,
        loginWithGoogle,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
