import React from 'react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import NotebookGrid from '@/components/dashboard/NotebookGrid';
import EmptyDashboard from '@/components/dashboard/EmptyDashboard';
import { useNotebooks } from '@/hooks/useNotebooks';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Dashboard = () => {
  const { user, loading: authLoading, error: authError } = useAuth();
  const { notebooks, isLoading, error, isError } = useNotebooks();
  const hasNotebooks = notebooks && notebooks.length > 0;
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/explore');
  };

  // FSB Logo component for absolute top
  const FSBLogo = () => (
    <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-50">
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <img 
              src="/logo_FSB_new.png" 
              alt="FSB Logo" 
              className="h-16 w-auto cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handleLogoClick}
              onError={(e) => {
                console.error('Logo failed to load:', e);
                e.currentTarget.style.display = 'none';
              }}
            />
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-gray-900 text-white px-2 py-1 text-sm">
            Trở về trang chủ
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );

  // Show loading while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 relative">
        <DashboardHeader userEmail={user?.email} />
        <FSBLogo />
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

  // Show auth error if present
  if (authError) {
    return (
      <div className="min-h-screen bg-gray-50 relative">
        <DashboardHeader userEmail={user?.email} />
        <FSBLogo />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-medium text-gray-900 mb-2">Welcome to InsightsLM</h1>
          </div>
          <div className="text-center py-16">
            <p className="text-red-600">Authentication error: {authError}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Show notebooks loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 relative">
        <DashboardHeader userEmail={user?.email} />
        <FSBLogo />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-medium text-gray-900 mb-2">Welcome to InsightsLM</h1>
          </div>
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your notebooks...</p>
          </div>
        </main>
      </div>
    );
  }

  // Show notebooks error if present
  if (isError && error) {
    return (
      <div className="min-h-screen bg-gray-50 relative">
        <DashboardHeader userEmail={user?.email} />
        <FSBLogo />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-medium text-gray-900 mb-2">Welcome to InsightsLM</h1>
          </div>
          <div className="text-center py-16">
            <p className="text-red-600">Error loading notebooks: {error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative">
      <DashboardHeader userEmail={user?.email} />
      <FSBLogo />
      
      <main className="max-w-7xl mx-auto px-6 py-[60px]">
        <div className="mb-8">
          <h1 className="font-medium text-gray-900 mb-2 text-5xl">Welcome to InsightsLM</h1>
        </div>

        {hasNotebooks ? <NotebookGrid /> : <EmptyDashboard />}
      </main>
    </div>
  );
};

export default Dashboard;