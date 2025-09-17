import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import InsightsLoginPage from '@/components/ui/animated-sign-in-insights';

const Auth = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Redirect to documentation if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('User is authenticated, redirecting to documentation');
      navigate('/documentation', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return <InsightsLoginPage />;
};

export default Auth;