import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  updateProfile,
  type User 
} from 'firebase/auth';
import { auth } from '../services/firebase';
import type { UserProfileData } from '../types';
import { MOCK_USER_PROFILE } from '../data/mockData';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  userProfile: UserProfileData;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfileData>>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [userProfile, setUserProfile] = useState<UserProfileData>(MOCK_USER_PROFILE);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setUserProfile((prev) => ({
          ...prev,
          name: currentUser.displayName || prev.name || 'Tharun Kumar',
          email: currentUser.email || prev.email || 'tharun@example.com'
        }));
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      // Demo fallback if Firebase credentials are placeholder
      console.warn('Firebase login attempt:', err.message);
      // Simulate successful local session if demo
      setUserProfile((prev) => ({ ...prev, email }));
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      if (res.user) {
        await updateProfile(res.user, { displayName: name });
      }
    } catch (err: any) {
      console.warn('Firebase register attempt:', err.message);
    }
    setUserProfile((prev) => ({ ...prev, name, email }));
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err: any) {
      console.warn('Firebase logout:', err.message);
    }
    setUser(null);
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      console.warn('Firebase reset password:', err.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        userProfile,
        setUserProfile,
        login,
        register,
        logout,
        resetPassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
