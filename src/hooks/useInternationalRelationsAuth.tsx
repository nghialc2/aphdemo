import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';

interface InternationalRelationsAuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const InternationalRelationsAuthContext = createContext<InternationalRelationsAuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  signOut: async () => {},
});

export const InternationalRelationsAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Store session indicator for international-relations
          localStorage.setItem('internationalRelationsAuth', 'true');
          setUser(session.user);
        } else {
          localStorage.removeItem('internationalRelationsAuth');
          setUser(null);
          
          // Only redirect if we're on an international-relations protected route
          if (location.pathname === '/international-relations') {
            navigate('/international-relations/login', { replace: true });
          }
        }
      } catch (error) {
        console.error('Error checking international relations auth:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        localStorage.setItem('internationalRelationsAuth', 'true');
        setUser(session.user);
        
        // Redirect to international-relations dashboard after login
        if (location.pathname === '/international-relations/login') {
          navigate('/international-relations', { replace: true });
        }
      } else {
        localStorage.removeItem('internationalRelationsAuth');
        setUser(null);
        
        // Redirect to login if on protected route
        if (location.pathname === '/international-relations') {
          navigate('/international-relations/login', { replace: true });
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, location]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('internationalRelationsAuth');
      setUser(null);
      navigate('/international-relations/login', { replace: true });
    } catch (error) {
      console.error('Error signing out from international relations:', error);
    }
  };

  return (
    <InternationalRelationsAuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated: !!user, 
        isLoading,
        signOut
      }}
    >
      {children}
    </InternationalRelationsAuthContext.Provider>
  );
};

export const useInternationalRelationsAuth = () => {
  const context = useContext(InternationalRelationsAuthContext);
  if (!context) {
    throw new Error('useInternationalRelationsAuth must be used within an InternationalRelationsAuthProvider');
  }
  return context;
};