import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/insights/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const TaskTrackingAuthForm = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Redirect to task-tracking if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('User is authenticated, redirecting to task-tracking');
      navigate('/task-tracking', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log('Attempting email/password sign in...');
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Email login error:', error);
        throw error;
      }

      console.log('Login successful, redirecting to task-tracking');
      navigate('/task-tracking', { replace: true });
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Đăng nhập thất bại",
        description: error.message || "Email hoặc mật khẩu không chính xác.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleEmailLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-white">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="team@yourcompany.com"
            required
            className="bg-white/5 border-white/15 text-white placeholder:text-white/50"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password" className="text-white">Mật khẩu</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="bg-white/5 border-white/15 text-white placeholder:text-white/50"
          />
        </div>
        
        <Button 
          type="submit"
          disabled={loading}
          className="w-full p-4 bg-white/5 border border-white/15 rounded-lg text-white hover:bg-white/10 hover:border-white/25 transition-all duration-300 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Đang đăng nhập...</span>
            </div>
          ) : (
            <span className="font-medium">Đăng nhập vào Team Tracker</span>
          )}
        </Button>
      </form>
      
      <p className="text-center text-sm text-white/60">
        Sử dụng tài khoản team để truy cập weekly dashboard
      </p>
    </div>
  );
};

export default TaskTrackingAuthForm;