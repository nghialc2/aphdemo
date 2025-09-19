import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { supabase as insightsSupabase } from "@/integrations/supabase/insights/client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Chatbot from "@/components/Chatbot";


export default function ExplorationPage() {
  const [programDropdownOpen, setProgramDropdownOpen] = useState(false);
  const [rndHubDropdownOpen, setRndHubDropdownOpen] = useState(false);
  const rndHubRef = useRef<HTMLDivElement>(null);
  const programRef = useRef<HTMLDivElement>(null);
  
  // Automatically sign out from all auth contexts when accessing /explore
  useEffect(() => {
    const signOutFromAllContexts = async () => {
      try {
        // Clear any session data from localStorage to prevent conflicts
        localStorage.removeItem('supabase.auth.token');
        sessionStorage.clear();
        
        // Sign out from main auth context
        const { error: mainError } = await supabase.auth.signOut();
        if (mainError) {
          console.error('Error signing out from main auth:', mainError);
        } else {
          console.log('Successfully signed out from main auth');
        }
        
        // Sign out from insights auth context
        const { error: insightsError } = await insightsSupabase.auth.signOut();
        if (insightsError) {
          console.error('Error signing out from insights auth:', insightsError);
        } else {
          console.log('Successfully signed out from insights auth');
        }
        
        // Clear any remaining auth-related localStorage items
        Object.keys(localStorage).forEach(key => {
          if (key.includes('supabase') || key.includes('auth')) {
            localStorage.removeItem(key);
          }
        });
      } catch (error) {
        console.error('Error during sign out:', error);
      }
    };
    
    // Execute sign out when component mounts
    signOutFromAllContexts();
  }, []); // Run only once on mount
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (rndHubRef.current && !rndHubRef.current.contains(event.target as Node)) {
        setRndHubDropdownOpen(false);
      }
      if (programRef.current && !programRef.current.contains(event.target as Node)) {
        setProgramDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close dropdowns when pressing escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setRndHubDropdownOpen(false);
        setProgramDropdownOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);
  
  const toggleProgramDropdown = () => {
    setProgramDropdownOpen(!programDropdownOpen);
    // Close the other dropdown when opening this one
    if (!programDropdownOpen) {
      setRndHubDropdownOpen(false);
    }
  };

  const toggleRndHubDropdown = () => {
    setRndHubDropdownOpen(!rndHubDropdownOpen);
    // Close the other dropdown when opening this one
    if (!rndHubDropdownOpen) {
      setProgramDropdownOpen(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/rnd-team.jpg')`,
          backgroundPosition: 'center center',
          backgroundSize: 'cover',
          transform: 'translateY(50px)',
          top: '-50px',
          left: '0',
          right: '0',
          height: 'calc(100vh + 50px)'
        }}
      />
      
      {/* Balanced Grey Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/55 via-slate-800/50 to-slate-900/60" />
      
      {/* Additional subtle pattern overlay for texture */}
      <div className="absolute inset-0 bg-black/15" />
      
      {/* Navigation Header */}
      <header className="relative z-[60] w-full py-6 px-6">
        <div className="w-full flex justify-end items-center pr-6">
          {/* Navigation Menu */}
          <nav className="flex items-center space-x-6">
            <Link to="/blog" className="text-white font-bold text-lg drop-shadow-lg hover:text-blue-200 transition-colors px-6 py-3 rounded-xl hover:bg-black/30 backdrop-blur-sm border border-white/30 shadow-lg">Blog</Link>
            
            {/* R&D Hub Dropdown */}
            <div className="relative" ref={rndHubRef}>
              <button
                onClick={toggleRndHubDropdown}
                className="text-white font-bold text-lg drop-shadow-lg hover:text-blue-200 focus:outline-none focus:text-blue-200 transition-colors px-6 py-3 rounded-xl hover:bg-black/30 backdrop-blur-sm border border-white/30 shadow-lg"
              >
                R&D Hub
              </button>
              
              {rndHubDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-200 py-2 z-[60]">
                  <Link 
                    to="/task-tracking" 
                    className="block px-4 py-2 text-gray-800 hover:bg-blue-50 hover:text-blue-600 font-medium"
                  >
                    Task & Tracking
                  </Link>
                  <Link 
                    to="/documentation" 
                    className="block px-4 py-2 text-gray-800 hover:bg-blue-50 hover:text-blue-600 font-medium"
                  >
                    InsightsLM
                  </Link>
                  <Link 
                    to="/international-relations" 
                    className="block px-4 py-2 text-gray-800 hover:bg-blue-50 hover:text-blue-600 font-medium"
                  >
                    International Relations
                  </Link>
                  <Link 
                    to="/iso" 
                    className="block px-4 py-2 text-gray-800 hover:bg-blue-50 hover:text-blue-600 font-medium"
                  >
                    ISO Management
                  </Link>
                  <Link 
                    to="/secret-note" 
                    className="block px-4 py-2 text-gray-800 hover:bg-blue-50 hover:text-blue-600 font-medium"
                  >
                    Secret Note
                  </Link>
                </div>
              )}
            </div>

            {/* Program Lab Dropdown */}
            <div className="relative" ref={programRef}>
              <button
                onClick={toggleProgramDropdown}
                className="text-white font-bold text-lg drop-shadow-lg hover:text-blue-200 focus:outline-none focus:text-blue-200 transition-colors px-6 py-3 rounded-xl hover:bg-black/30 backdrop-blur-sm border border-white/30 shadow-lg"
              >
                Program Lab
              </button>
              
              {programDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-200 py-2 z-[60]">
                  <Link 
                    to="/login?redirect=aph-lab" 
                    className="block px-4 py-2 text-gray-800 hover:bg-blue-50 hover:text-blue-600 font-medium"
                  >
                    APH Lab
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-8">
        {/* Content will be added later */}
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-4 bg-black/30 backdrop-blur-sm text-white/80 text-sm border-t border-white/10">
        © 2025 Designed by NghiaLC2. All rights reserved.
      </footer>

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
}