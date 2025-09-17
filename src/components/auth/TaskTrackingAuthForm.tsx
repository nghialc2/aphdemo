import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import LoginPage from '@/components/ui/animated-sign-in';

const TaskTrackingAuthForm = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Redirect to task-tracking if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('User is authenticated, redirecting to task-tracking');
      navigate('/task-tracking', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return <LoginPage />;
};

export default TaskTrackingAuthForm;