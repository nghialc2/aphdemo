import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Check domain restriction when user signs in
        if (event === 'SIGNED_IN' && session?.user?.email) {
          const email = session.user.email;
          if (!email.endsWith('@fsb.edu.vn')) {
            console.log('Domain not allowed:', email);
            // Sign out user if domain is not allowed
            setTimeout(() => {
              signOut();
              toast({
                title: "Truy cập bị từ chối",
                description: "Chỉ các email @fsb.edu.vn mới được phép truy cập ứng dụng này.",
                variant: "destructive",
              });
            }, 100);
          } else {
            toast({
              title: "Đăng nhập thành công",
              description: `Chào mừng ${email}!`,
            });
            
            // Handle redirect after successful login
            // Check if there's a redirect parameter in the current URL
            const currentUrl = new URL(window.location.href);
            const redirectTo = currentUrl.searchParams.get('redirect');
            
            if (redirectTo === 'aph-lab') {
              console.log('Redirecting to APH lab');
              navigate('/aph-lab');
            }
          }
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  const signInWithGoogle = async () => {
    try {
      // Check if we're on a login page with redirect parameter
      const currentUrl = new URL(window.location.href);
      const redirectTo = currentUrl.searchParams.get('redirect');
      
      // Ensure we always use the current origin (localhost in development)
      const origin = window.location.origin;
      let redirectUrl = origin;
      
      if (redirectTo === 'aph-lab') {
        redirectUrl = `${origin}/login?redirect=aph-lab`;
      }

      console.log('Signing in with Google, redirect URL:', redirectUrl);
      console.log('Current origin:', origin);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        }
      });

      if (error) {
        console.error('Google sign in error:', error);
        toast({
          title: "Lỗi đăng nhập",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Sign in error:', error);
      toast({
        title: "Lỗi đăng nhập",
        description: "Có lỗi xảy ra khi đăng nhập với Google",
        variant: "destructive",
      });
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
      } else {
        toast({
          title: "Đăng xuất thành công",
          description: "Bạn đã đăng xuất khỏi ứng dụng.",
        });
        
        // Check current route and redirect if needed
        if (window.location.pathname === '/aph-lab') {
          navigate('/explore');
        }
      }
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      signInWithGoogle,
      signOut,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
