import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useInsightsAuth } from '@/hooks/useInsightsAuth';

const DarkModeManager = () => {
  const location = useLocation();
  const { user: authUser, loading: authLoading } = useAuth();
  const { user: insightsUser, loading: insightsLoading } = useInsightsAuth();

  useEffect(() => {
    const manageDarkMode = () => {
      const path = location.pathname;
      
      console.log('🌙 DarkModeManager - Path:', path);
      console.log('🌙 DarkModeManager - Auth states:', {
        authUser: authUser?.email,
        authLoading
      });
      
      // Remove dark class first to ensure clean state
      document.documentElement.classList.remove('dark');
      
      // Apply dark mode only for login pages when user is not authenticated
      if (path === '/login' && !authUser && !authLoading) {
        console.log('🌙 Applying dark mode for /login');
        document.documentElement.classList.add('dark');
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(manageDarkMode, 0);
    
    return () => {
      clearTimeout(timer);
      // Always clean up dark mode when location changes
      document.documentElement.classList.remove('dark');
    };
  }, [location.pathname, authUser, authLoading]);

  return null;
};

export default DarkModeManager;