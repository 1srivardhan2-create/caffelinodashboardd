import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  fullName: string;
  email: string;
  profilePicture: string;
  role: string;
}

interface EventAuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
  loading: boolean;
}

const EventAuthContext = createContext<EventAuthContextType | undefined>(undefined);

export function EventAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('eventUser');
    const storedToken = localStorage.getItem('eventToken');

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  const login = (userData: User, newToken: string) => {
    setUser(userData);
    setToken(newToken);
    localStorage.setItem('eventUser', JSON.stringify(userData));
    localStorage.setItem('eventToken', newToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('eventUser');
    localStorage.removeItem('eventToken');
  };

  return (
    <EventAuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!user && !!token,
      login,
      logout,
      loading
    }}>
      {children}
    </EventAuthContext.Provider>
  );
}

export function useEventAuth() {
  const context = useContext(EventAuthContext);
  if (context === undefined) {
    throw new Error('useEventAuth must be used within an EventAuthProvider');
  }
  return context;
}
