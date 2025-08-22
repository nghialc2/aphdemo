import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  Target,
  Users,
  Zap,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { llmAnalysisService, LLMAnalysisResult } from '@/services/llmAnalysisService';

interface LLMAnalysisWidgetProps {
  onAnalysisComplete?: () => void;
}

export const LLMAnalysisWidget: React.FC<LLMAnalysisWidgetProps> = ({ onAnalysisComplete }) => {
  const [analysis, setAnalysis] = useState<LLMAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasOpenAIKey, setHasOpenAIKey] = useState(false);

  useEffect(() => {
    // Check if OpenAI API key is configured
    setHasOpenAIKey(!!import.meta.env.VITE_OPENAI_API_KEY);
    
    // Load latest analysis on component mount
    loadLatestAnalysis();
  }, []);

  const loadLatestAnalysis = async () => {
    try {
      const latestAnalysis = await llmAnalysisService.getLatestAnalysis();
      if (latestAnalysis) {
        setAnalysis(latestAnalysis);
      }
    } catch (error) {
      console.error('Error loading latest analysis:', error);
    }
  };

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await llmAnalysisService.triggerWeeklyAnalysis();
      setAnalysis(result);
      
      if (onAnalysisComplete) {
        onAnalysisComplete();
      }
    } catch (err) {
      console.error('Analysis error:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to run analysis');
      }
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
      case 'accelerating':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining':
      case 'slowing':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving':
      case 'accelerating':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'declining':
      case 'slowing':
        return 'text-red-700 bg-red-50 border-red-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-blue-600';
    if (score >= 4) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Analysis Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="h-5 w-5 mr-2" />
            AI Team Analysis
          </CardTitle>
          <CardDescription>
            GPT-powered insights from your weekly meeting data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!hasOpenAIKey && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>OpenAI API not configured.</strong> Add <code>VITE_OPENAI_API_KEY</code> to your .env file for AI analysis.
                <br />Mock analysis will be used instead.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {hasOpenAIKey ? 'Analyze last 4 weeks with GPT-4' : 'Generate mock analysis'}
              </p>
              {analysis && (
                <p className="text-xs text-gray-500 mt-1">
                  Last analysis: {new Date(analysis.created_at).toLocaleString()}
                </p>
              )}
            </div>
            <Button onClick={runAnalysis} disabled={loading}>
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Run Analysis
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-4">
          {/* Executive Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Executive Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{analysis.executive_summary}</p>
              <div className="flex items-center mt-3 text-sm text-gray-600">
                <Badge variant="outline" className="mr-2">
                  Confidence: {Math.round(analysis.confidence_score * 100)}%
                </Badge>
                <span>Based on {analysis.meetings_count} meetings, {analysis.action_items_count} action items</span>
              </div>
            </CardContent>
          </Card>

          {/* Scores & Trends */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Productivity</p>
                    <p className={`text-2xl font-bold ${getScoreColor(analysis.productivity_score)}`}>
                      {analysis.productivity_score}/10
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Collaboration</p>
                    <p className={`text-2xl font-bold ${getScoreColor(analysis.collaboration_score)}`}>
                      {analysis.collaboration_score}/10
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Morale Trend</p>
                    <div className={`flex items-center px-2 py-1 rounded text-sm font-medium ${getTrendColor(analysis.morale_trend)}`}>
                      {getTrendIcon(analysis.morale_trend)}
                      <span className="ml-1 capitalize">{analysis.morale_trend}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Velocity Trend</p>
                    <div className={`flex items-center px-2 py-1 rounded text-sm font-medium ${getTrendColor(analysis.velocity_trend)}`}>
                      {getTrendIcon(analysis.velocity_trend)}
                      <span className="ml-1 capitalize">{analysis.velocity_trend}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Key Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                  Key Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.key_achievements.map((achievement, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{achievement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
                  Main Challenges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.main_challenges.map((challenge, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{challenge}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Lightbulb className="h-5 w-5 mr-2 text-blue-600" />
                AI Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Strategic Recommendations</h4>
                  <ul className="space-y-2">
                    {analysis.strategic_recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start">
                        <Zap className="h-4 w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Operational Improvements</h4>
                  <ul className="space-y-2">
                    {analysis.operational_improvements.map((improvement, index) => (
                      <li key={index} className="flex items-start">
                        <Target className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risk Alerts */}
          {analysis.risk_alerts.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center text-lg text-red-800">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Risk Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.risk_alerts.map((risk, index) => (
                    <li key={index} className="flex items-start">
                      <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-sm text-red-700">{risk}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};