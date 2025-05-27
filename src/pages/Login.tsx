
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import LoginPage from '@/components/ui/gaming-login';

const Login = () => {
  const { user, signInWithGoogle, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Add dark class to html element
    document.documentElement.classList.add('dark');
    
    // Redirect to home if already logged in
    if (user) {
      navigate('/');
    }

    // Cleanup function to remove dark class when component unmounts
    return () => {
      document.documentElement.classList.remove('dark');
    };
  }, [user, navigate]);

  const handleLogin = (email: string, password: string, remember: boolean) => {
    console.log('Login attempt:', { email, password, remember });
    // You can add regular email/password login here if needed
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fpt-orange mx-auto"></div>
          <p className="mt-2 text-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center px-4 py-12">
      {/* FSB Logo - Top Left */}
      <div className="absolute top-6 left-6 z-30">
        <img 
          src="/lovable-uploads/d0043d77-a2db-44b0-b64d-aa59b3ada6a7.png" 
          alt="FPT School of Business & Technology" 
          className="h-16 w-auto"
        />
      </div>

      <LoginPage.VideoBackground videoUrl="/FPT_Tower.mp4" />

      <div className="relative z-20 w-full max-w-md animate-fadeIn">
        <LoginPage.LoginForm 
          onSubmit={handleLogin}
          onGoogleLogin={signInWithGoogle}
        />
      </div>

      <footer className="absolute bottom-4 left-0 right-0 text-center text-white/60 text-sm z-20">
        © 2025 FPT School of Business & Technology. All rights reserved.
      </footer>
    </div>
  );
};

export default Login;
