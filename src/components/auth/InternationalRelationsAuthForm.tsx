import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useInternationalRelationsAuth } from '@/hooks/useInternationalRelationsAuth';
import LoginPage from '@/components/ui/animated-sign-in';

const InternationalRelationsAuthForm = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAuthenticated } = useInternationalRelationsAuth();

  // Redirect to international-relations if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('User is authenticated, redirecting to international-relations');
      navigate('/international-relations', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (email: string, password: string, rememberMe: boolean) => {
    setLoading(true);
    setError(null);
    
    try {
      // Validate that email is rdho@fsb.edu.vn for R&D Hub access
      if (email !== 'rdho@fsb.edu.vn') {
        throw new Error('Please use R&D Hub credentials (rdho@fsb.edu.vn) to access International Relations.');
      }

      console.log('Attempting email/password sign in for International Relations...');
      
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error('Email login error:', signInError);
        throw signInError;
      }

      console.log('Login successful, redirecting to international-relations');
      toast({
        title: "Login Successful",
        description: "Welcome to International Relations R&D Hub!",
      });
      navigate('/international-relations', { replace: true });
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.message || "Email or password is incorrect.";
      setError(errorMessage);
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginPage
      title="International Relations"
      subtitle="R&D Hub - Access International Relations Dashboard"
      onLogin={handleLogin}
      isLoading={loading}
      error={error}
    />
  );
};

export default InternationalRelationsAuthForm;