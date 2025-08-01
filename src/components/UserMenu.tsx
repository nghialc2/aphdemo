
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/context/AdminContext';
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
import { LogOut, User, Shield } from 'lucide-react';

const UserMenu = () => {
  const { user, signOut } = useAuth();
  const { isAdmin, adminModeActive, toggleAdminMode } = useAdmin();
  
  const handleToggleClick = () => {
    toggleAdminMode();
  };

  if (!user) return null;

  const userInitials = user.email
    ? user.email.split('@')[0].slice(0, 2).toUpperCase()
    : 'U';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.user_metadata?.avatar_url} alt="Avatar" />
            <AvatarFallback className="bg-fpt-blue text-white">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.user_metadata?.full_name || user.email?.split('@')[0]}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isAdmin && (
          <>
            <DropdownMenuItem onClick={handleToggleClick} className="cursor-pointer">
              <Shield className={`mr-2 h-4 w-4 ${adminModeActive ? 'text-green-600' : 'text-gray-400'}`} />
              <div className="flex flex-col">
                <span className="font-medium">
                  {adminModeActive ? 'Edit Mode: ON' : 'Edit Mode: OFF'}
                </span>
                <span className="text-xs text-gray-500">
                  {adminModeActive ? 'Click to disable editing' : 'Click to enable editing'}
                </span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onClick={signOut} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Đăng xuất</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
