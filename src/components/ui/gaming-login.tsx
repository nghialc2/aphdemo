
'use client';
import React from 'react';
import { Chrome } from 'lucide-react';

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

// SocialButton Component
const SocialButton: React.FC<SocialButtonProps> = ({ icon, onClick }) => {
    return (
        <button 
            onClick={onClick}
            className="flex items-center justify-center gap-3 w-full p-4 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/15 hover:border-white/30 transition-all duration-300 backdrop-blur-sm"
        >
            {icon}
            <span className="font-medium">Đăng nhập với Google</span>
        </button>
    );
};

// VideoBackground Component
const VideoBackground: React.FC<VideoBackgroundProps> = ({ videoUrl }) => {
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
            <div className="absolute inset-0 bg-black/40 z-10" />
            <video
                ref={videoRef}
                className="absolute inset-0 min-w-full min-h-full object-cover w-auto h-auto"
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
const LoginForm: React.FC<LoginFormProps> = ({ onGoogleLogin }) => {
    return (
        <div className="p-8 rounded-2xl backdrop-blur-md bg-black/30 border border-white/20 shadow-2xl">
            <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold mb-2 relative group">
                    <span className="absolute -inset-1 bg-gradient-to-r from-purple-600/30 via-pink-500/30 to-blue-500/30 blur-xl opacity-75 group-hover:opacity-100 transition-all duration-500 animate-pulse"></span>
                    <span className="relative inline-block text-3xl font-bold mb-2 text-white">
                        AI-Powered HRM
                    </span>
                </h2>
                <p className="text-white/80 flex flex-col items-center space-y-1">
                    <span className="relative group cursor-default">
                        <span className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 to-pink-600/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                        <span className="relative inline-block animate-pulse">Chào mừng trở lại</span>
                    </span>
                    <span className="text-xs text-white/50 animate-pulse">
                        [Đăng nhập để tiếp tục]
                    </span>
                </p>
            </div>

            <div className="space-y-6">
                <SocialButton 
                    icon={<Chrome size={24} />} 
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

// Export as default components
const LoginPage = {
    LoginForm,
    VideoBackground
};

export default LoginPage;
