
import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();
 
  // Determine redirect parameter and login route based on current path
  const getRedirectInfo = () => {
    if (location.pathname.startsWith('/documentation')) {
      return { param: 'documentation', loginRoute: '/documentation/login' };
    } else if (location.pathname.startsWith('/task-tracking')) {
      return { param: 'task-tracking', loginRoute: '/task-tracking/login' };
    } else if (location.pathname.startsWith('/international-relations')) {
      return { param: 'international-relations', loginRoute: '/international-relations/login' };
    } else if (location.pathname.startsWith('/iso')) {
      return { param: 'iso', loginRoute: '/iso/login' };
    } else if (location.pathname.startsWith('/secret-note')) {
      return { param: 'secret-note', loginRoute: '/secret-note/login' };
    } else if (location.pathname === '/aph-lab') {
      return { param: 'aph-lab', loginRoute: '/login?redirect=aph-lab' };
    }
    // Default to aph-lab for other protected routes
    return { param: 'aph-lab', loginRoute: '/login?redirect=aph-lab' };
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
    const { loginRoute } = getRedirectInfo();
    return <Navigate to={loginRoute} replace />;
  }

  // Additional check for domain (redundant but safe)
  if (!user.email?.endsWith('@fsb.edu.vn')) {
    const { loginRoute } = getRedirectInfo();
    return <Navigate to={loginRoute} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
