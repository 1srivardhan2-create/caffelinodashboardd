import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { api } from '../../services/api';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface Cafe {
  id: string;
  ownerId?: string;
  name: string;
  address?: string;
  location?: string;
  openingTime?: string;
  closingTime?: string;
  category?: string;
  costPerPerson?: string;
  managerName?: string;
  managerPhone?: string;
  email?: string;
  managerPhoto?: string;
  galleryImages?: string[];
  status: 'pending_verification' | 'approved' | 'rejected' | boolean | string;
  profilePicture?: string;
}

interface AuthContextType {
  user: User | null;
  cafe: Cafe | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (accessToken: string) => Promise<boolean>;
  signup: (name: string, email: string, phone: string, password: string) => Promise<void>;
  verifyOTP: (code: string) => Promise<void>;
  logout: () => void;
  registerCafe: (formData: FormData) => Promise<void>;
  updateCafe: (cafeData: Partial<Cafe>) => void;
  isAuthenticated: boolean;
  isVerified: boolean;
  pendingVerification: string | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [cafe, setCafe] = useState<Cafe | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [pendingVerification, setPendingVerification] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Check login status on mount
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await api.get('/api/cafe/status');
        if (res && res.hasCafe) {
          setCafe({
            id: res.id,
            name: res.name,
            status: (res.status === true || res.status === 'true' || res.status === 'approved') ? 'approved' : 'pending_verification',
            address: res.address,
            location: res.location,
            category: res.category,
            costPerPerson: res.costPerPerson,
            managerName: res.managerName,
            managerPhone: res.managerPhone,
            email: res.email,
            galleryImages: res.galleryImages,
            profilePicture: res.profilePicture,
            openingTime: res.openingTime,
            closingTime: res.closingTime
          });
          // Also set a minimal user to show as authenticated
          setUser({
            id: 'current-user',
            name: 'Cafe Owner',
            email: '',
            phone: ''
          });
          setIsVerified(true);
        } else if (res && !res.hasCafe && res.status !== 401) {
          // Valid session, but no cafe yet. You can handle this if you have a user endpoint.
        }
      } catch (err) {
        console.error("Session check failed", err);
      } finally {
        setLoading(false);
      }
    };
    checkStatus();
  }, []);

  const signup = async (name: string, email: string, phone: string, password: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    setPendingVerification(JSON.stringify({ name, email, phone, password }));
    setIsVerified(false);
  };

  const verifyOTP = async (code: string) => {
    if (code.length === 6 && pendingVerification) {
      const userData = JSON.parse(pendingVerification);
      const newUser: User = { id: 'user-' + Date.now(), ...userData };
      setUser(newUser);
      setIsVerified(true);
      setPendingVerification(null);
    }
  };

  const login = async (email: string, password: string) => {
    // Basic mock for generic login
    const mockUser: User = { id: 'user-' + Date.now(), name: 'John Doe', email: email || 'owner@caffelino.com', phone: '+91 9876543210' };
    setUser(mockUser);
    setIsVerified(true);
  };

  const loginWithGoogle = async (accessToken: string) => {
    try {
      const response = await api.post('/api/cafe/google-login', { accessToken });
      if (response.user) {
        setUser({ id: response.user.googleId || 'user-1', name: response.user.name, email: response.user.email, phone: '' });
        setIsVerified(true);
      }
      
      if (response.cafe && response.cafe.hasCafe) {
        setCafe({
          id: response.cafe.id,
          name: response.cafe.name,
          status: (response.cafe.status === true || response.cafe.status === 'true' || response.cafe.status === 'approved') ? 'approved' : 'pending_verification',
          address: response.cafe.address,
          location: response.cafe.location,
          category: response.cafe.category,
          costPerPerson: response.cafe.costPerPerson,
          managerName: response.cafe.managerName,
          managerPhone: response.cafe.managerPhone,
          email: response.cafe.email,
          galleryImages: response.cafe.galleryImages,
          profilePicture: response.cafe.profilePicture,
          openingTime: response.cafe.openingTime,
          closingTime: response.cafe.closingTime
        });
      }
      
      return response.cafe?.hasCafe || false;
    } catch (error: any) {
      console.error("Google login error", error);
      throw error;
    }
  };

  const registerCafe = async (formData: FormData) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const response = await api.postForm('/api/cafe/register', formData);
      if (response.cafe) {
        setCafe({
          id: response.cafe.id,
          name: response.cafe.name,
          status: response.cafe.status === true ? 'approved' : 'pending_verification',
          address: response.cafe.address,
          location: response.cafe.location,
          category: response.cafe.category,
          costPerPerson: response.cafe.costPerPerson,
          managerName: response.cafe.managerName,
          managerPhone: response.cafe.managerPhone,
          email: response.cafe.email,
          galleryImages: response.cafe.galleryImages,
          profilePicture: response.cafe.profilePicture,
          openingTime: response.cafe.openingTime,
          closingTime: response.cafe.closingTime
        });
      } else {
        // Fallback if backend doesn't return full object immediately
        setCafe({
          id: 'temp-id',
          name: formData.get('Name') as string || 'Cafe',
          status: 'pending_verification'
        });
      }
    } catch (error: any) {
      console.error("Registration failed", error);
      throw error;
    }
  };

  const updateCafe = (cafeData: Partial<Cafe>) => {
    if (cafe) {
      setCafe({ ...cafe, ...cafeData });
    }
  };

  const logout = () => {
    // You should also call backend /api/cafe/logout later to clear cookies if implemented
    setUser(null);
    setCafe(null);
    setIsVerified(false);
    setPendingVerification(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        cafe,
        login,
        loginWithGoogle,
        signup,
        verifyOTP,
        logout,
        registerCafe,
        updateCafe,
        isAuthenticated: !!user,
        isVerified,
        pendingVerification,
        loading
      }}
    >
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