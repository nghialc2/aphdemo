import React from 'react';
import AuthForm from '@/components/auth/AuthForm';
import Logo from '@/components/ui/Logo';

// VideoBackground Component
const VideoBackground = ({ videoUrl }: { videoUrl: string }) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  
  React.useEffect(() => {
    // Preload the video
    const video = document.createElement('video');
    video.src = videoUrl;
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    
    video.addEventListener('loadedmetadata', () => {
      setIsLoaded(true);
    });
    
    video.addEventListener('error', () => {
      setHasError(true);
    });
    
    video.load();
    
    return () => {
      video.removeEventListener('loadedmetadata', () => {});
      video.removeEventListener('error', () => {});
    };
  }, [videoUrl]);
  
  React.useEffect(() => {
    if (videoRef.current && isLoaded) {
      videoRef.current.play().catch(error => {
        console.error("Video autoplay failed:", error);
        setHasError(true);
      });
    }
  }, [isLoaded]);
  
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      <div className="absolute inset-0 bg-black/30 z-10" />
      
      {/* Loading state with gradient background */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 animate-pulse">
          <div className="absolute inset-0 bg-black/20" />
        </div>
      )}
      
      {/* Error state with static gradient */}
      {hasError && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <div className="absolute inset-0 bg-black/30" />
        </div>
      )}
      
      {/* Video element */}
      <video
        ref={videoRef}
        className={`absolute inset-0 min-w-full min-h-full object-cover w-auto h-auto transition-opacity duration-500 ${
          isLoaded && !hasError ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          objectPosition: 'center top',
          transform: 'translateY(-10%)'
        }}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
      >
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

const Auth = () => {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center px-4 py-12">
      {/* FSB Logo - Top Left */}
      <div className="absolute top-6 left-6 z-30">
        <img 
          src="/lovable-uploads/d0043d77-a2db-44b0-b64d-aa59b3ada6a7.png" 
          alt="FPT School of Business & Technology" 
          className="h-16 w-auto"
        />
      </div>

      <VideoBackground videoUrl="/FPT_Tower.mp4" />

      <div className="relative z-20 w-full max-w-md animate-fadeIn">
        <div className="p-8 rounded-2xl backdrop-blur-sm bg-black/15 border border-white/10 shadow-2xl">
          <div className="mb-8 text-center">
            <div className="flex justify-center mb-4">
              <Logo size="lg" />
            </div>
            <h2 className="text-3xl font-bold mb-2 relative group">
              <span className="absolute -inset-1 bg-gradient-to-r from-purple-600/30 via-pink-500/30 to-blue-500/30 blur-xl opacity-70 group-hover:opacity-100 transition-all duration-500 animate-pulse"></span>
              <span className="relative inline-block text-3xl font-bold mb-2 text-white">
                InsightsLM
              </span>
            </h2>
            <p className="text-white/80 flex flex-col items-center space-y-1">
              <span className="relative group cursor-default">
                <span className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 to-pink-600/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                <span className="relative inline-block animate-pulse">Your AI-powered knowledge companion</span>
              </span>
              <span className="text-xs text-white/50 animate-pulse">
                [Đăng nhập để tiếp tục]
              </span>
            </p>
          </div>
          
          <AuthForm />
        </div>
      </div>

      <footer className="absolute bottom-4 left-0 right-0 text-center text-white/60 text-sm z-20">
        © 2025 FPT School of Business & Technology. All rights reserved.
      </footer>
    </div>
  );
};

export default Auth;