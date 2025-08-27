import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Clock, 
  TrendingUp, 
  Play,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { dashboardApi } from '@/lib/api';
import { useRouter } from 'next/router';

interface DiagnosticTest {
  domain: string;
  domainDisplayName: string;
  completed: boolean;
  attempts: number;
  bestScore: number;
  lastAttemptDate: string | null;
  canAttempt: boolean;
  status: 'completed' | 'not-started';
  recommendation: string;
}

interface DiagnosticTestCardProps {
  test: DiagnosticTest;
  onTestStarted?: () => void;
}

export function DiagnosticTestCard({ test, onTestStarted }: DiagnosticTestCardProps) {
  const [isStarting, setIsStarting] = useState(false);
  const router = useRouter();

  const handleStartTest = async () => {
    try {
      setIsStarting(true);
      const response = await dashboardApi.startDiagnosticTest(test.domain);
      
      if (response.success) {
        // Navigate to diagnostic test page with session ID
        router.push(`/diagnostic-test?domain=${test.domain}&sessionId=${response.data.sessionId}`);
        onTestStarted?.();
      } else {
        console.error('Failed to start test:', response.message);
        alert('Failed to start test. Please try again.');
      }
    } catch (error) {
      console.error('Error starting diagnostic test:', error);
      alert('Error starting test. Please try again.');
    } finally {
      setIsStarting(false);
    }
  };

  const getStatusIcon = () => {
    if (test.completed) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    return <AlertCircle className="h-5 w-5 text-orange-500" />;
  };

  const getStatusColor = () => {
    if (test.completed) {
      return 'bg-green-100 text-green-800 border-green-200';
    }
    return 'bg-orange-100 text-orange-800 border-orange-200';
  };

  const getScoreColor = () => {
    if (test.bestScore >= 80) return 'text-green-600';
    if (test.bestScore >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-indigo-600" />
            <CardTitle className="text-lg">{test.domainDisplayName}</CardTitle>
          </div>
          <div className="flex items-center space-x-1">
            {getStatusIcon()}
            <Badge className={getStatusColor()}>
              {test.completed ? 'Completed' : 'Not Started'}
            </Badge>
          </div>
        </div>
        <CardDescription className="text-sm">
          {test.recommendation}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress and Stats */}
        <div className="space-y-3">
          {test.completed && (
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center space-x-1">
                <TrendingUp className="h-4 w-4" />
                <span>Best Score:</span>
              </span>
              <span className={`font-semibold ${getScoreColor()}`}>
                {test.bestScore}%
              </span>
            </div>
          )}
          
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>Attempts:</span>
            </span>
            <span className="font-semibold">{test.attempts}</span>
          </div>

          {test.lastAttemptDate && (
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Last Attempt:</span>
              <span>{new Date(test.lastAttemptDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Progress Bar for completed tests */}
        {test.completed && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-600">
              <span>Progress</span>
              <span>{test.bestScore}%</span>
            </div>
            <Progress value={test.bestScore} className="h-2" />
          </div>
        )}

        {/* Action Button */}
        <Button 
          onClick={handleStartTest}
          disabled={isStarting || !test.canAttempt}
          className="w-full"
          variant={test.completed ? "outline" : "default"}
        >
          <Play className="h-4 w-4 mr-2" />
          {isStarting ? 'Starting...' : (test.completed ? 'Retake Test' : 'Start Test')}
        </Button>
      </CardContent>
    </Card>
  );
}
