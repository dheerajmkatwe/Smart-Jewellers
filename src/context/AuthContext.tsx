import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '../types';

interface AuthContextType {
  user: any;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (identifier: string, pass: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(() => {
    const saved = localStorage.getItem('sj_auth_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('sj_auth_profile');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  const checkSession = async () => {

    try {
      const res = await fetch('/api/auth/me', {
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setProfile(data.user);
        
        // Pass shops globally to TenantContext or localstorage logic
        localStorage.setItem('sj_shops_sync', JSON.stringify(data.shops));
      } else {
        throw new Error('Session invalid');
      }
    } catch {
      setUser(null);
      setProfile(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    checkSession();
  }, []);

  const signIn = async (identifier: string, pass: string): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password: pass })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        // Backend now native-sets HTTP-Only Session Cookie
        setUser(data.user);
        setProfile(data.user);
        localStorage.setItem('sj_auth_user', JSON.stringify(data.user));
        localStorage.setItem('sj_auth_profile', JSON.stringify(data.user));
        setLoading(false);
        return true;
      }
      setLoading(false);
      return false;
    } catch (e) {
      setLoading(false);
      return false;
    }
  };

  const signOut = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (e) {
      console.error('Logout revocation failed:', e);
    }
    
    // Clear local state
    setUser(null);
    setProfile(null);
    localStorage.removeItem('sj_auth_user');
    localStorage.removeItem('sj_auth_profile');
    localStorage.removeItem('sj_active_shop');
    localStorage.removeItem('sj_shops_sync');
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signOut, checkSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
