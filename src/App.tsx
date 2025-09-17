import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { InsightsAuthProvider } from "@/hooks/useInsightsAuth";
import { AuthProvider as InsightsAuthContextProvider } from "@/contexts/AuthContext";
import { InternationalRelationsAuthProvider } from "@/hooks/useInternationalRelationsAuth";
import { AdminProvider } from "@/context/AdminContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import InsightsProtectedRoute from "@/components/auth/ProtectedRoute";
import InternationalRelationsProtectedRoute from "@/components/auth/InternationalRelationsProtectedRoute";
import DarkModeManager from "@/components/DarkModeManager";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import LandingPage from "./pages/LandingPage";
import ExplorationPage from "./pages/ExplorationPage";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";
import EnhancedWeeklyDashboard from "./pages/EnhancedWeeklyDashboard";
import TaskTrackingAuth from "./pages/TaskTrackingAuth";
import InternationalRelationsAuth from "./pages/InternationalRelationsAuth";
import InternationalRelationsDashboard from "./pages/InternationalRelationsDashboard";
import ISODashboard from "./pages/ISODashboard";
import ISOAuth from "./pages/ISOAuth";
import SecretNoteDashboard from "./pages/SecretNoteDashboard";
import SecretNoteAuth from "./pages/SecretNoteAuth";
import Dashboard from "./pages/Dashboard";
import Notebook from "./pages/Notebook";

// Create a QueryClient instance
const queryClient = new QueryClient();

// Add meta tag to remove Lovable badge
const removeLovableBadge = () => {
  const meta = document.createElement('meta');
  meta.name = 'lovable:badge';
  meta.content = 'hidden';
  document.head.appendChild(meta);
};
removeLovableBadge();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <InsightsAuthProvider>
            <InsightsAuthContextProvider>
              <InternationalRelationsAuthProvider>
                <AdminProvider>
                <DarkModeManager />
              <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/explore" element={<ExplorationPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:id" element={<BlogPostPage />} />
              <Route 
                path="/documentation" 
                element={
                  <InsightsProtectedRoute fallback={<Auth />}>
                    <Dashboard />
                  </InsightsProtectedRoute>
                } 
              />
              <Route 
                path="/documentation/notebook/:id" 
                element={
                  <InsightsProtectedRoute fallback={<Auth />}>
                    <Notebook />
                  </InsightsProtectedRoute>
                } 
              />
            <Route 
              path="/task-tracking" 
              element={
                <ProtectedRoute>
                  <EnhancedWeeklyDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/task-tracking/login" 
              element={<TaskTrackingAuth />} 
            />
            <Route 
              path="/international-relations" 
              element={
                <InternationalRelationsProtectedRoute>
                  <InternationalRelationsDashboard />
                </InternationalRelationsProtectedRoute>
              } 
            />
            <Route 
              path="/international-relations/login" 
              element={<InternationalRelationsAuth />} 
            />
            <Route 
              path="/iso" 
              element={
                <ProtectedRoute>
                  <ISODashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/iso/login" 
              element={<ISOAuth />} 
            />
            <Route 
              path="/secret-note" 
              element={
                <ProtectedRoute>
                  <SecretNoteDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/secret-note/login" 
              element={<SecretNoteAuth />} 
            />
            <Route path="/login" element={<Login />} />
            <Route 
              path="/aph-lab" 
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
            </Routes>
                </AdminProvider>
              </InternationalRelationsAuthProvider>
            </InsightsAuthContextProvider>
          </InsightsAuthProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;