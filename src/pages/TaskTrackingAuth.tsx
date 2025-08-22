import React from 'react';
import TaskTrackingAuthForm from '@/components/auth/TaskTrackingAuthForm';
import Logo from '@/components/ui/Logo';

// Professional static background matching FPT Tower aesthetic
const FPTTowerBackground = () => (
  <div className="absolute inset-0 w-full h-full overflow-hidden">
    {/* Professional gradient background inspired by FPT Tower */}
    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-purple-900">
      <div className="absolute inset-0 bg-black/40" />
      
      {/* Subtle architectural lines to mimic tower structure */}
      <div className="absolute inset-0">
        <div className="absolute right-1/4 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent"></div>
        <div className="absolute right-1/3 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-blue-300/10 to-transparent"></div>
        <div className="absolute left-1/4 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-purple-300/10 to-transparent"></div>
      </div>
      
      {/* Ambient lighting effects */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-2xl"></div>
      
      {/* Subtle particles */}
      <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-white/30 rounded-full animate-pulse"></div>
      <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-blue-300/40 rounded-full animate-pulse delay-1000"></div>
    </div>
  </div>
)

// VideoBackground Component - Optimized for seamless loading
const VideoBackground = ({ videoUrl }: { videoUrl: string }) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [isVideoVisible, setIsVideoVisible] = React.useState(false);
  
  React.useEffect(() => {
    if (videoRef.current) {
      const video = videoRef.current;
      
      const handleCanPlay = () => {
        // Smooth fade-in when video is ready
        setIsVideoVisible(true);
      };
      
      video.addEventListener('canplay', handleCanPlay);
      video.addEventListener('loadeddata', handleCanPlay);
      
      // Start playing silently in background
      video.play().catch(() => {
        // Video autoplay failed, but static background is already visible
      });
      
      return () => {
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('loadeddata', handleCanPlay);
      };
    }
  }, []);
  
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      {/* Always show professional static background */}
      <FPTTowerBackground />
      
      {/* Video overlay - fades in when ready */}
      <video
        ref={videoRef}
        className={`absolute inset-0 min-w-full min-h-full object-cover w-auto h-auto transition-opacity duration-2000 ${
          isVideoVisible ? 'opacity-60' : 'opacity-0'
        }`}
        style={{
          objectPosition: 'center top',
          transform: 'translateY(-10%)'
        }}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
      >
        <source src={videoUrl} type="video/mp4" />
      </video>
      
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/30 z-10" />
    </div>
  );
};

const TaskTrackingAuth = () => {
  // Preload video for faster loading
  React.useEffect(() => {
    const videoLink = document.createElement('link')
    videoLink.rel = 'preload'
    videoLink.href = '/FPT_Tower.mp4'
    videoLink.as = 'video'
    videoLink.type = 'video/mp4'
    document.head.appendChild(videoLink)

    return () => {
      try {
        document.head.removeChild(videoLink)
      } catch (e) {
        // Element might already be removed
      }
    }
  }, [])

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
              <span className="absolute -inset-1 bg-gradient-to-r from-blue-600/30 via-indigo-500/30 to-purple-500/30 blur-xl opacity-70 group-hover:opacity-100 transition-all duration-500 animate-pulse"></span>
              <span className="relative inline-block text-3xl font-bold mb-2 text-white">
                📊 Weekly Team Tracker
              </span>
            </h2>
            <p className="text-white/80 flex flex-col items-center space-y-1">
              <span className="relative group cursor-default">
                <span className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                <span className="relative inline-block animate-pulse">Track progress, decisions & discussions</span>
              </span>
              <span className="text-xs text-white/50 animate-pulse">
                [Đăng nhập để truy cập dashboard]
              </span>
            </p>
          </div>
          
          <TaskTrackingAuthForm />
        </div>
      </div>

      <footer className="absolute bottom-4 left-0 right-0 text-center text-white/60 text-sm z-20">
        © 2025 FPT School of Business & Technology. All rights reserved.
      </footer>
    </div>
  );
};

export default TaskTrackingAuth;