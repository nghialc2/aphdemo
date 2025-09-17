import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useInternationalRelationsAuth } from '@/hooks/useInternationalRelationsAuth';

interface InternationalRelationsProtectedRouteProps {
  children: ReactNode;
}

const InternationalRelationsProtectedRoute = ({ children }: InternationalRelationsProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useInternationalRelationsAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/international-relations/login" replace />;
  }

  return <>{children}</>;
};

export default InternationalRelationsProtectedRoute;