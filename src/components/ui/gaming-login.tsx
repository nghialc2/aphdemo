
'use client';
import React from 'react';

interface LoginFormProps {
    onSubmit: (email: string, password: string, remember: boolean) => void;
    onGoogleLogin?: () => void;
}

interface VideoBackgroundProps {
    videoUrl: string;
}

interface SocialButtonProps {
    icon: React.ReactNode;
    name: string;
    onClick?: () => void;
}

// Google Logo Component
const GoogleLogo = () => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
    );
};

// SocialButton Component
const SocialButton: React.FC<SocialButtonProps> = ({ icon, onClick }) => {
    return (
        <button 
            onClick={onClick}
            className="flex items-center justify-center gap-3 w-full p-4 bg-white/5 border border-white/15 rounded-lg text-white hover:bg-white/10 hover:border-white/25 transition-all duration-300 backdrop-blur-sm"
        >
            {icon}
            <span className="font-medium">Đăng nhập với Google</span>
        </button>
    );
};

// VideoBackground Component
export const VideoBackground: React.FC<VideoBackgroundProps> = ({ videoUrl }) => {
    const videoRef = React.useRef<HTMLVideoElement>(null);
    
    React.useEffect(() => {
        if (videoRef.current) {
            videoRef.current.play().catch(error => {
                console.error("Video autoplay failed:", error);
            });
        }
    }, []);
    
    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden">
            <div className="absolute inset-0 bg-black/30 z-10" />
            <video
                ref={videoRef}
                className="absolute inset-0 min-w-full min-h-full object-cover w-auto h-auto"
                style={{
                    objectPosition: 'center top',
                    transform: 'translateY(-10%)'
                }}
                autoPlay
                loop
                muted
                playsInline
            >
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
        </div>
    );
};

// Main LoginForm Component
export const LoginForm: React.FC<LoginFormProps> = ({ onGoogleLogin }) => {
    return (
        <div className="p-8 rounded-2xl backdrop-blur-sm bg-black/15 border border-white/10 shadow-2xl">
            <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold mb-2 relative group">
                    <span className="absolute -inset-1 bg-gradient-to-r from-purple-600/30 via-pink-500/30 to-blue-500/30 blur-xl opacity-70 group-hover:opacity-100 transition-all duration-500 animate-pulse"></span>
                    <span className="relative inline-block text-3xl font-bold mb-2 text-white">
                        APH Training Lab
                    </span>
                </h2>
                <p className="text-white/80 flex flex-col items-center space-y-1">
                    <span className="relative group cursor-default">
                        <span className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 to-pink-600/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                        <span className="relative inline-block animate-pulse">Chào mừng bạn đã đến với khóa học AI-Powered HRM của Viện Quản trị và Công nghệ FSB!</span>
                    </span>
                    <span className="text-xs text-white/50 animate-pulse">
                        [Đăng nhập để tiếp tục]
                    </span>
                </p>
            </div>
            
            <div className="space-y-6">
                <SocialButton 
                    icon={<GoogleLogo />} 
                    name="Google" 
                    onClick={onGoogleLogin}
                />
            </div>
            
            <p className="mt-8 text-center text-sm text-white/60">
                Chỉ dành cho tài khoản{' '}
                <span className="font-medium text-white">@fsb.edu.vn</span>
            </p>
        </div>
    );
};

// Export the components as properties of the default export to match Login.tsx expectations
const LoginPage = {
    VideoBackground,
    LoginForm
};

export default LoginPage;
