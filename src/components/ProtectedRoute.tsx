
import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();
 
  // Determine redirect parameter based on current path
  const getRedirectParam = () => {
    if (location.pathname.startsWith('/documentation')) {
      return 'documentation';
    } else if (location.pathname === '/aph-lab') {
      return 'aph-lab';
    }
    // Default to aph-lab for other protected routes
    return 'aph-lab';
  };

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
    const redirectParam = getRedirectParam();
    return <Navigate to={`/login?redirect=${redirectParam}`} replace />;
  }

  // Additional check for domain (redundant but safe)
  if (!user.email?.endsWith('@fsb.edu.vn')) {
    const redirectParam = getRedirectParam();
    return <Navigate to={`/login?redirect=${redirectParam}`} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
