
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { Mail } from 'lucide-react';

const Login = () => {
  const { user, signInWithGoogle, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to home if already logged in
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fpt-orange mx-auto"></div>
          <p className="mt-2 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-fpt-blue">
            Đăng nhập vào APH Demo
          </CardTitle>
          <CardDescription>
            Chỉ dành cho sinh viên và giảng viên FSB
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={signInWithGoogle}
            className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-300"
            disabled={loading}
          >
            <Mail className="h-5 w-5 mr-2" />
            Đăng nhập với Gmail @fsb.edu.vn
          </Button>
          
          <div className="text-sm text-gray-600 text-center">
            <p>Chỉ các email có tên miền @fsb.edu.vn mới được phép truy cập</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
