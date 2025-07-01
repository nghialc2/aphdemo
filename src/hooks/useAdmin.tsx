
import { useAuth } from './useAuth';

export const useAdmin = () => {
  const { user } = useAuth();
  
  const isAdmin = user?.user_metadata?.role === 'admin' || user?.email === 'nghialc2@fsb.edu.vn';
  
  return {
    isAdmin,
    user
  };
};
