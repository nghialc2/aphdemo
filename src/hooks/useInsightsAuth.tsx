import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/insights/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface InsightsAuthContextType {
  user: User | null;
  session: Session | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const InsightsAuthContext = createContext<InsightsAuthContextType | undefined>(undefined);

export const InsightsAuthProvider = ({ children }: { children: ReactNode }) => {
  console.log('InsightsAuthProvider initializing');
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener for InsightsLM
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('InsightsLM Auth state change:', event, session);
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
                title: "Access denied",
                description: "Only @fsb.edu.vn emails are allowed to access InsightsLM.",
                variant: "destructive",
              });
            }, 100);
          } else {
            toast({
              title: "Signed in successfully",
              description: `Welcome to InsightsLM, ${email}!`,
            });
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
      const origin = window.location.origin;
      const redirectUrl = `${origin}/documentation`;

      console.log('Signing in with Google to InsightsLM, redirect URL:', redirectUrl);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) {
        console.error('Error signing in:', error);
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast({
        title: "Sign in failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      navigate('/documentation');
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast({
        title: "Sign out error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <InsightsAuthContext.Provider value={{
      user,
      session,
      signInWithGoogle,
      signOut,
      loading,
    }}>
      {children}
    </InsightsAuthContext.Provider>
  );
};

export const useInsightsAuth = () => {
  console.log('useInsightsAuth hook called');
  const context = useContext(InsightsAuthContext);
  if (context === undefined) {
    console.error('InsightsAuthContext is undefined - not wrapped in provider!');
    throw new Error('useInsightsAuth must be used within an InsightsAuthProvider');
  }
  console.log('useInsightsAuth returning context:', context);
  return context;
};