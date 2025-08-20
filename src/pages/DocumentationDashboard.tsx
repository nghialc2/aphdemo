import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNotebooks } from '@/hooks/insights/useNotebooks';
import DashboardHeader from '@/components/insights/dashboard/DashboardHeader';
import NotebookGrid from '@/components/insights/dashboard/NotebookGrid';
import EmptyDashboard from '@/components/insights/dashboard/EmptyDashboard';

const DocumentationDashboard = () => {
  const { user } = useAuth();
  
  // For now, show setup message until InsightsLM schema is configured
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <div className="mb-12">
            <h2 className="text-3xl font-medium text-gray-900 mb-4">Documentation Setup Required</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The Documentation section has been integrated successfully! To enable full functionality, 
              you need to set up the InsightsLM database schema in your Supabase project.
            </p>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-8 max-w-2xl mx-auto text-left">
            <h3 className="text-xl font-semibold mb-4">Setup Instructions:</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              <li>Run the SQL migration from insights-lm-public/supabase/migrations/</li>
              <li>Configure N8N workflows for backend processing</li>
              <li>Set up Supabase Edge Functions</li>
              <li>Add required environment variables</li>
            </ol>
            <p className="mt-4 text-sm text-gray-500">
              See the README.md in insights-lm-public/ for detailed setup instructions.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DocumentationDashboard;