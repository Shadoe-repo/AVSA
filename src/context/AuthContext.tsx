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

const DEFAULT_OPERATOR: HospitalUser = {
  userId: 'demo_ops_lead',
  email: 'ops.lead@asva-demo.local',
  name: 'Operations Lead',
  hospitalId: 'HOSP-021',
  role: 'ER_CHIEF'
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<HospitalUser | null>(DEFAULT_OPERATOR);
  const [activeRole, setActiveRole] = useState<'PARAMEDIC' | 'HOSPITAL' | 'TRAFFIC' | 'ANALYTICS'>('PARAMEDIC');

  const loginWithGoogle = async (hospitalId = 'HOSP-021') => {
    // Demo secure-session mapping for the selected hospital command centre.
    setCurrentUser({
      ...DEFAULT_OPERATOR,
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
