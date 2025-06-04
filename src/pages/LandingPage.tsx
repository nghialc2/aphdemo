import { SplineSceneBasic } from "@/components/ui/demo";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

// Import the logo directly
import logoFSB from "/logo_FSB_new.png";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-black landing-page-container">
      {/* Full-screen 3D Scene */}
      <div className="flex-1">
        <SplineSceneBasic />
      </div>
      
      {/* Floating Header */}
      <header className="absolute top-0 left-0 right-0 z-20 container mx-auto py-6 flex justify-between items-center">
        <div className="text-2xl font-bold text-white">
          <img src={logoFSB} alt="FSB Logo" className="h-16" />
        </div>
      </header>
      
      {/* Floating CTA Button */}
      <div className="absolute bottom-32 left-0 right-0 z-20 flex justify-center">
        <Button asChild size="lg" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
          <Link to="/explore">Let's Explore</Link>
        </Button>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 z-20 container mx-auto py-4 border-t border-white/10">
        <div className="flex justify-center items-center">
          <div className="text-sm text-gray-400">
            © 2025 Designed by NghiaLC2. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
} 