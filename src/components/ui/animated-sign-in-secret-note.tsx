"use client";

import React, { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  Sun,
  Moon,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import "../../index.css";

const SecretNoteLoginPage: React.FC = () => {
  const [email, setEmail] = useState("rdho@fsb.edu.vn");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailCleared, setEmailCleared] = useState(false);

  const { signInWithEmail } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/explore');
  };

  // Email validation
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  // Handle email change
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (e.target.value) {
      setIsEmailValid(validateEmail(e.target.value));
    } else {
      setIsEmailValid(true);
    }
  };

  // Handle email focus - clear pre-filled value on first focus
  const handleEmailFocus = () => {
    setIsEmailFocused(true);
    if (!emailCleared) {
      setEmail("");
      setEmailCleared(true);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsFormSubmitted(true);
    setIsLoading(true);

    if (email && password && validateEmail(email)) {
      try {
        const result = await signInWithEmail(email, password);
        
        if (result.success) {
          // Show success animation
          const form = document.querySelector(".login-form") as HTMLElement;
          if (form) {
            form.classList.add("form-success");
          }
          
          toast({
            title: "Login Successful",
            description: "Welcome to Secret Note Dashboard!",
          });
          
          // Redirect to Secret Note dashboard
          setTimeout(() => {
            navigate('/secret-note');
          }, 1500);
        } else {
          toast({
            title: "Login Failed",
            description: result.error || "Invalid credentials",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Login Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid @fsb.edu.vn email and password",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark-mode");
  };

  // Initialize theme based on user preference
  useEffect(() => {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    setIsDarkMode(prefersDark);
    if (prefersDark) {
      document.documentElement.classList.add("dark-mode");
    }
  }, []);

  // Create particles
  useEffect(() => {
    const canvas = document.getElementById("particles") as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);

    // Particle class
    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.color = isDarkMode
          ? `rgba(139, 92, 246, ${Math.random() * 0.7 + 0.3})`
          : `rgba(99, 102, 241, ${Math.random() * 0.8 + 0.4})`;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const particles: Particle[] = [];
    const particleCount = Math.min(
      150,
      Math.floor((canvas.width * canvas.height) / 8000)
    );

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const particle of particles) {
        particle.update();
        particle.draw();
      }

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", setCanvasSize);
    };
  }, [isDarkMode]);

  return (
    <div className={`login-container ${isDarkMode ? "dark" : "light"}`}>
      <canvas id="particles" className="particles-canvas"></canvas>

      <div className="theme-toggle" onClick={toggleDarkMode}>
        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      </div>

      <div className="flex flex-col items-center justify-center min-h-screen p-5">
        {/* FSB Logo - Above login card */}
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div 
                className="mb-8 cursor-pointer transition-opacity hover:opacity-80 z-50"
                onClick={handleLogoClick}
              >
                <img 
                  src="/logo_FSB_new.png" 
                  alt="FPT School of Business & Technology" 
                  className="h-16 w-auto"
                  onError={(e) => {
                    console.error('Logo failed to load:', e);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-gray-900 text-white px-2 py-1 text-sm">
              Trở về trang chủ
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="login-card">
        <div className="login-card-inner">
          <div className="login-header">
            <h1>Secret Note Dashboard</h1>
            <p>Sign in to access confidential notes</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div
              className={`form-field ${
                isEmailFocused || email ? "active" : ""
              } ${!isEmailValid && email ? "invalid" : ""}`}
            >
              <input
                type="email"
                id="email"
                value={email}
                onChange={handleEmailChange}
                onFocus={handleEmailFocus}
                onBlur={() => setIsEmailFocused(false)}
                required
              />
              <label htmlFor="email">Email Address</label>
              {!isEmailValid && email && (
                <span className="error-message">
                  Please enter a valid email
                </span>
              )}
            </div>

            <div
              className={`form-field ${
                isPasswordFocused || password ? "active" : ""
              }`}
            >
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
                required
              />
              <label htmlFor="password">Password</label>
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                />
                <span className="checkmark"></span>
                Remember me
              </label>

              <a href="#" className="forgot-password">
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={isLoading || (isFormSubmitted && (!email || !password || !isEmailValid))}
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <p className="signup-prompt">
            Need access? Contact your administrator
          </p>
        </div>
        </div>
      </div>
    </div>
  );
};

export default SecretNoteLoginPage;