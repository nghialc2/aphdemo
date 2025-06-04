
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import UserMenu from "./UserMenu";

interface HeaderProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const Header = ({ toggleSidebar, isSidebarOpen }: HeaderProps) => {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
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
        <h1 className="text-xl font-bold text-fpt-orange">AI-Powered HRM Training Lab</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <UserMenu />
      </div>
    </header>
  );
};

export default Header;
