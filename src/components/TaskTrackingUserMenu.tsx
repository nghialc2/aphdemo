import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, User, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const TaskTrackingUserMenu = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/task-tracking');
  };

  if (!user) return null;

  const userInitials = user.email
    ? user.email.split('@')[0].slice(0, 2).toUpperCase()
    : 'U';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.user_metadata?.avatar_url} alt="Avatar" />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm font-semibold">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 bg-white/95 backdrop-blur-md border border-blue-200 shadow-xl rounded-xl" align="end" forceMount>
        <DropdownMenuLabel className="font-normal p-4">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-semibold text-gray-800">Weekly Team Tracker</span>
            </div>
            <div className="pl-6">
              <p className="text-sm font-medium leading-none text-gray-700">
                {user.user_metadata?.full_name || user.email?.split('@')[0]}
              </p>
              <p className="text-xs leading-none text-gray-500 mt-1">
                {user.email}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-blue-100" />
        <DropdownMenuItem 
          onClick={() => navigate('/documentation')} 
          className="cursor-pointer hover:bg-blue-50 mx-2 rounded-lg"
        >
          <User className="mr-3 h-4 w-4 text-purple-600" />
          <div className="flex flex-col">
            <span className="font-medium text-gray-700">InsightsLM</span>
            <span className="text-xs text-gray-500">Switch to documentation</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-blue-100" />
        <DropdownMenuItem 
          onClick={handleSignOut} 
          className="cursor-pointer hover:bg-red-50 mx-2 rounded-lg text-red-600"
        >
          <LogOut className="mr-3 h-4 w-4" />
          <span className="font-medium">Đăng xuất</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TaskTrackingUserMenu;