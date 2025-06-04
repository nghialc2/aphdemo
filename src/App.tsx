
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import LandingPage from "./pages/LandingPage";
import ExplorationPage from "./pages/ExplorationPage";

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
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/explore" element={<ExplorationPage />} />
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
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
