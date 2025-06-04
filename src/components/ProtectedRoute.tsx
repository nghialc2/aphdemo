
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fpt-orange mx-auto"></div>
          <p className="mt-2 text-gray-600">Đang kiểm tra xác thực...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login?redirect=aph-lab" replace />;
  }

  // Additional check for domain (redundant but safe)
  if (!user.email?.endsWith('@fsb.edu.vn')) {
    return <Navigate to="/login?redirect=aph-lab" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
