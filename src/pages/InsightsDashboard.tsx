import React from 'react';
import DashboardHeader from '@/components/insights/dashboard/DashboardHeader';
import NotebookGrid from '@/components/insights/dashboard/NotebookGrid';
import EmptyDashboard from '@/components/insights/dashboard/EmptyDashboard';
import { useNotebooks } from '@/hooks/insights/useNotebooks';
import { useInsightsAuth } from '@/hooks/useInsightsAuth';
import LoginPage from '@/components/ui/gaming-login';

const InsightsDashboard = () => {
  console.log('🚀 InsightsDashboard RENDERING at:', new Date().toISOString());
  const { user, loading: authLoading, signInWithGoogle } = useInsightsAuth();
  
  console.log('🔐 InsightsDashboard auth state:', { user, authLoading });
  const { notebooks, isLoading, error, isError } = useNotebooks();
  const hasNotebooks = notebooks && notebooks.length > 0;
  
  console.log('📊 InsightsDashboard render state:', {
    user: user?.email,
    authLoading,
    notebooksLoading: isLoading,
    notebooksCount: notebooks?.length,
    hasNotebooks,
    error
  });
  
  console.log('🎨 Will show login interface:', !user && !authLoading);

  // Show loading while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader userEmail={user?.email} />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-medium text-gray-900 mb-2">Welcome to InsightsLM</h1>
          </div>
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Initializing...</p>
          </div>
        </main>
      </div>
    );
  }

  // Show login interface if not authenticated
  if (!user) {
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

        <LoginPage.VideoBackground videoUrl="/FPT_Tower.mp4" />

        <div className="relative z-20 w-full max-w-md animate-fadeIn">
          <div className="p-8 rounded-2xl backdrop-blur-sm bg-black/15 border border-white/10 shadow-2xl">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold mb-2 relative group">
                <span className="absolute -inset-1 bg-gradient-to-r from-purple-600/30 via-pink-500/30 to-blue-500/30 blur-xl opacity-70 group-hover:opacity-100 transition-all duration-500 animate-pulse"></span>
                <span className="relative inline-block text-3xl font-bold mb-2 text-white">
                  InsightsLM
                </span>
              </h2>
              <p className="text-white/80">
                <span className="relative inline-block">Documentation & Knowledge Management System</span>
              </p>
              {/* Debug identifier */}
              <div className="text-xs text-white/40 mt-2">DEBUG: InsightsDashboard Login</div>
            </div>
            
            <div className="space-y-6">
              <button 
                onClick={signInWithGoogle}
                className="flex items-center justify-center gap-3 w-full p-4 bg-white/5 border border-white/15 rounded-lg text-white hover:bg-white/10 hover:border-white/25 transition-all duration-300 backdrop-blur-sm"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span className="font-medium">Sign in with Google</span>
              </button>
              
              <p className="text-center text-sm text-white/60">
                Only @fsb.edu.vn accounts
              </p>
            </div>
          </div>
        </div>

        <footer className="absolute bottom-4 left-0 right-0 text-center text-white/60 text-sm z-20">
          © 2025 FPT School of Business & Technology. All rights reserved.
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader userEmail={user.email} />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-medium text-gray-900 mb-2">Welcome to InsightsLM</h1>
          <p className="text-gray-600 text-lg">
            Create notebooks, upload sources, and chat with your documents using AI
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading notebooks...</p>
          </div>
        ) : isError ? (
          <div className="text-center py-16">
            <p className="text-red-600">Error loading notebooks: {error?.message || 'Unknown error'}</p>
          </div>
        ) : hasNotebooks ? (
          <NotebookGrid notebooks={notebooks} />
        ) : (
          <EmptyDashboard />
        )}
      </main>
    </div>
  );
};

export default InsightsDashboard;