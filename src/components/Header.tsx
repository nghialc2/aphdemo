import { Button } from "@/components/ui/button";
import { Menu, X, Edit } from "lucide-react";
import UserMenu from "./UserMenu";
import { useAdmin } from "@/context/AdminContext";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const Header = ({ toggleSidebar, isSidebarOpen }: HeaderProps) => {
  const { isInEditMode } = useAdmin();
  
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between fixed top-0 left-0 right-0 z-50 h-[60px]">
      <div className="flex items-center space-x-4">
        {/* FSB Logo */}
        <div className="flex-shrink-0">
          <img 
            src="/logo_FSB_new.png" 
            alt="FPT School of Business & Technology" 
            className="h-10 w-auto"
            onError={(e) => {
              console.error('Logo failed to load:', e);
              // Fallback: hide the image if it fails to load
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-fpt-orange">AI-Powered HRM Training Lab</h1>
          {isInEditMode && (
            <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-300">
              <Edit className="w-3 h-3 mr-1" />
              Edit Mode
            </Badge>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <UserMenu />
      </div>
    </header>
  );
};

export default Header;
