import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import DocumentationLoginPage from '@/components/ui/animated-sign-in-documentation';

const DocumentationAuthForm = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Redirect to documentation if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('User is authenticated, redirecting to documentation');
      navigate('/documentation', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return <DocumentationLoginPage />;
};

export default DocumentationAuthForm;