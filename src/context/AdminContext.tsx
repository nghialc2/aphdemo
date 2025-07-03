<<<<<<< HEAD
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface AdminContextType {
  isAdmin: boolean;
  loading: boolean;
  adminModeActive: boolean;
  toggleAdminMode: () => void;
  isInEditMode: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adminModeActive, setAdminModeActive] = useState(() => {
    // Initialize from localStorage
    if (typeof window !== 'undefined') {
      return localStorage.getItem('adminModeActive') === 'true';
    }
    return false;
  });

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user?.email) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // Check if user is the hardcoded admin
      if (user.email === 'nghialc2@fsb.edu.vn' || user.email === 'TungNT247@fsb.edu.vn') {
        setIsAdmin(true);
        
        // Update user role in database if not already set
        try {
          const { error } = await supabase
            .from('users')
            .upsert({
              id: user.id,
              email: user.email,
              role: 'admin'
            });
          
          if (error) {
            console.error('Error updating admin role:', error);
          }
        } catch (error) {
          console.error('Error updating admin role:', error);
        }
        
        setLoading(false);
        return;
      }

      // For other users, check database role
      try {
        const { data, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.error('Error checking admin status:', error);
        }

        setIsAdmin(data?.role === 'admin');
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      }

      setLoading(false);
    };

    checkAdminStatus();
  }, [user]);

  // Reset admin mode when user changes or logs out
  useEffect(() => {
    if (!user || !isAdmin) {
      setAdminModeActive(false);
      localStorage.removeItem('adminModeActive');
    }
  }, [user, isAdmin]);

  const toggleAdminMode = () => {
    if (isAdmin) {
      const newState = !adminModeActive;
      setAdminModeActive(newState);
      // Persist to localStorage
      localStorage.setItem('adminModeActive', newState.toString());
      console.log('Admin mode toggled to:', newState);
    }
  };

  const isInEditMode = isAdmin && adminModeActive;

  return (
    <AdminContext.Provider value={{
      isAdmin,
      loading,
      adminModeActive,
      toggleAdminMode,
      isInEditMode
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
=======

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface AdminContextType {
  isAdmin: boolean;
  loading: boolean;
  adminModeActive: boolean;
  toggleAdminMode: () => void;
  isInEditMode: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Define admin emails
const ADMIN_EMAILS = [
  'nghialc2@fsb.edu.vn',
  'TungNT247@fsb.edu.vn'
];

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adminModeActive, setAdminModeActive] = useState(() => {
    // Initialize from localStorage
    if (typeof window !== 'undefined') {
      return localStorage.getItem('adminModeActive') === 'true';
    }
    return false;
  });

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user?.email) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // Check if user is one of the hardcoded admins
      if (ADMIN_EMAILS.includes(user.email)) {
        setIsAdmin(true);
        
        // Update user role in database if not already set
        try {
          const { error } = await supabase
            .from('users')
            .upsert({
              id: user.id,
              email: user.email,
              role: 'admin'
            });
          
          if (error) {
            console.error('Error updating admin role:', error);
          }
        } catch (error) {
          console.error('Error updating admin role:', error);
        }
        
        setLoading(false);
        return;
      }

      // For other users, check database role
      try {
        const { data, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.error('Error checking admin status:', error);
        }

        setIsAdmin(data?.role === 'admin');
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      }

      setLoading(false);
    };

    checkAdminStatus();
  }, [user]);

  // Reset admin mode when user changes or logs out
  useEffect(() => {
    if (!user || !isAdmin) {
      setAdminModeActive(false);
      localStorage.removeItem('adminModeActive');
    }
  }, [user, isAdmin]);

  const toggleAdminMode = () => {
    if (isAdmin) {
      const newState = !adminModeActive;
      setAdminModeActive(newState);
      // Persist to localStorage
      localStorage.setItem('adminModeActive', newState.toString());
      console.log('Admin mode toggled to:', newState);
    }
  };

  const isInEditMode = isAdmin && adminModeActive;

  return (
    <AdminContext.Provider value={{
      isAdmin,
      loading,
      adminModeActive,
      toggleAdminMode,
      isInEditMode
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
>>>>>>> a25ff3c313c7d0de753e73f21450e7826c4fe02e
