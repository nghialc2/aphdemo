
import { useEffect, useState } from 'react';

const Header = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center">
          <img 
            src="/lovable-uploads/eb77959b-2b45-4a88-a70d-f1f09faaa124.png" 
            alt="FSB Logo" 
            className="h-12 mr-4" 
          />
          <h1 className={`font-bold ${isMobile ? 'text-lg' : 'text-2xl'} text-fpt-orange`}>
            APH Demo Lab
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="hidden md:inline-block text-sm text-gray-500">
            Prompt Engineering Practice
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
