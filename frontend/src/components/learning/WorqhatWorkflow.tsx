import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  CheckCircle, 
  Clock, 
  Lightbulb, 
  Code,
  ArrowRight,
  ArrowLeft,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { createLearningWorkflow, WorkflowRequest, WorkflowResponse, WorkflowTask } from '@/lib/worqhat';

interface WorqhatWorkflowProps {
  userId: string;
  learningMode: 'diagnostic' | 'learning' | 'practice' | 'review';
  domain: string;
  userLevel?: string;
  onComplete: (results: any) => void;
  onCancel: () => void;
}

export default function WorqhatWorkflow({ 
  userId, 
  learningMode, 
  domain, 
  userLevel, 
  onComplete, 
  onCancel 
}: WorqhatWorkflowProps) {
  const [workflow, setWorkflow] = useState<WorkflowResponse | null>(null);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionStartTime] = useState(Date.now());
  const [taskStartTime, setTaskStartTime] = useState(Date.now());
  const [showHints, setShowHints] = useState(false);

  // Initialize workflow
  useEffect(() => {
    initializeWorkflow();
  }, []);

  const initializeWorkflow = async () => {
    try {
      setIsLoading(true);
      
      const workflowRequest: WorkflowRequest = {
        userId,
        learningMode,
        domain,
        userLevel,
        preferences: {
          difficulty: (userLevel as any) || 'intermediate',
          timeAvailable: getTimeAllocation(learningMode),
          focusAreas: [domain]
        }
      };

      console.log('🚀 Creating WorqHat workflow with request:', workflowRequest);
      const workflowResponse = await createLearningWorkflow(workflowRequest);
      console.log('✅ WorqHat workflow created:', workflowResponse);
      
      setWorkflow(workflowResponse);
      setTaskStartTime(Date.now());
    } catch (error) {
      console.error('❌ Failed to create workflow:', error);
      // Show error to user or fallback
    } finally {
      setIsLoading(false);
    }
  };

  const getTimeAllocation = (mode: string): number => {
    const allocations = {
      'diagnostic': 20,
      'learning': 35,
      'practice': 25,
      'review': 15
    };
    return allocations[mode as keyof typeof allocations] || 30;
  };

  const currentTask = workflow?.tasks[currentTaskIndex];
  const progress = workflow ? ((currentTaskIndex) / workflow.tasks.length) * 100 : 0;

  const handleAnswer = (answer: string) => {
    if (!currentTask) return;
    
    setAnswers(prev => ({
      ...prev,
      [currentTask.id]: answer
    }));
  };

  const handleNextTask = () => {
    if (!workflow || currentTaskIndex >= workflow.tasks.length - 1) {
      handleCompleteWorkflow();
      return;
    }
    
    setCurrentTaskIndex(prev => prev + 1);
    setTaskStartTime(Date.now());
    setShowHints(false);
  };

  const handlePreviousTask = () => {
    if (currentTaskIndex > 0) {
      setCurrentTaskIndex(prev => prev - 1);
      setTaskStartTime(Date.now());
      setShowHints(false);
    }
  };

  const handleCompleteWorkflow = async () => {
    if (!workflow) return;
    
    setIsSubmitting(true);
    
    try {
      const sessionDuration = Math.round((Date.now() - sessionStartTime) / 1000 / 60); // in minutes
      const results = {
        sessionId: workflow.sessionId,
        userId,
        learningMode,
        domain,
        answers,
        duration: sessionDuration,
        completedTasks: currentTaskIndex + 1,
        totalTasks: workflow.tasks.length,
        score: calculateScore(),
        adaptiveSettings: workflow.adaptiveSettings
      };
      
      console.log('📊 Workflow completed with results:', results);
      onComplete(results);
    } catch (error) {
      console.error('❌ Error completing workflow:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateScore = (): number => {
    if (!workflow) return 0;
    
    let correctAnswers = 0;
    let totalQuestions = 0;
    
    workflow.tasks.forEach(task => {
      if (task.type === 'question' && task.correctAnswer) {
        totalQuestions++;
        if (answers[task.id] === task.correctAnswer) {
          correctAnswers++;
        }
      }
    });
    
    return totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 100;
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'question': return <Brain className="h-5 w-5" />;
      case 'concept': return <Lightbulb className="h-5 w-5" />;
      case 'practice': return <Code className="h-5 w-5" />;
      case 'review': return <CheckCircle className="h-5 w-5" />;
      default: return <Brain className="h-5 w-5" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="bg-gradient-to-br from-axonix-100/95 to-axonix-200/90 backdrop-blur-lg border border-axonix-400/50 shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-axonix-700 mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-axonix-800 mb-2">Creating Your Personalized Workflow</h3>
            <p className="text-axonix-600">WorqHat AI is analyzing your preferences and generating custom learning tasks...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="bg-gradient-to-br from-axonix-100/95 to-axonix-200/90 backdrop-blur-lg border border-axonix-400/50 shadow-xl">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-semibold text-axonix-800 mb-2">Failed to Create Workflow</h3>
            <p className="text-axonix-600 mb-4">We couldn't generate your learning workflow. Please try again.</p>
            <div className="flex justify-center gap-4">
              <Button onClick={initializeWorkflow}>Try Again</Button>
              <Button variant="outline" onClick={onCancel}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Header */}
      <Card className="bg-gradient-to-br from-axonix-100/95 to-axonix-200/90 backdrop-blur-lg border border-axonix-400/50 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-axonix-200/80 to-axonix-300/70 rounded-t-lg border-b border-axonix-400/30">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-axonix-800">
                {getTaskIcon(currentTask?.type || 'question')}
                {learningMode.charAt(0).toUpperCase() + learningMode.slice(1)} Session
              </CardTitle>
              <CardDescription className="text-axonix-600">
                {domain} • Task {currentTaskIndex + 1} of {workflow.tasks.length}
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <Badge className={`${getDifficultyColor(currentTask?.difficulty || 'intermediate')} text-white`}>
                {currentTask?.difficulty}
              </Badge>
              <div className="flex items-center gap-1 text-axonix-600">
                <Clock className="h-4 w-4" />
                <span className="text-sm">{currentTask?.estimatedTime}m</span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-axonix-600">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      {/* Current Task */}
      {currentTask && (
        <Card className="bg-gradient-to-br from-axonix-100/95 to-axonix-200/90 backdrop-blur-lg border border-axonix-400/50 shadow-xl">
          <CardHeader>
            <CardTitle className="text-axonix-800">{currentTask.title}</CardTitle>
            <CardDescription className="text-axonix-600">{currentTask.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose prose-sm max-w-none">
              <p className="text-axonix-700 whitespace-pre-wrap">{currentTask.content}</p>
            </div>

            {/* Code Snippet */}
            {currentTask.codeSnippet && (
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-green-400 text-sm">
                  <code>{currentTask.codeSnippet}</code>
                </pre>
              </div>
            )}

            {/* Multiple Choice Options */}
            {currentTask.type === 'question' && currentTask.options && currentTask.options.length > 0 && (
              <div className="space-y-3">
                {currentTask.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(option)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      answers[currentTask.id] === option
                        ? 'border-axonix-600 bg-axonix-200/50'
                        : 'border-axonix-300/50 hover:border-axonix-400/50 hover:bg-axonix-100/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        answers[currentTask.id] === option 
                          ? 'border-axonix-600 bg-axonix-600' 
                          : 'border-axonix-400'
                      }`}>
                        {answers[currentTask.id] === option && (
                          <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                        )}
                      </div>
                      <span className="text-axonix-800">{option}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Hints */}
            {currentTask.hints && currentTask.hints.length > 0 && (
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHints(!showHints)}
                  className="border-axonix-400/50 text-axonix-700"
                >
                  <Lightbulb className="h-4 w-4 mr-2" />
                  {showHints ? 'Hide Hints' : 'Show Hints'}
                </Button>
                {showHints && (
                  <div className="bg-axonix-100/60 rounded-lg p-4 border border-axonix-300/50">
                    <h4 className="font-medium text-axonix-800 mb-2">Hints:</h4>
                    <ul className="space-y-1">
                      {currentTask.hints.map((hint, index) => (
                        <li key={index} className="text-sm text-axonix-600 flex items-start gap-2">
                          <span className="text-axonix-500">•</span>
                          {hint}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Explanation for answered questions */}
            {currentTask.type === 'question' && 
             answers[currentTask.id] && 
             currentTask.explanation && (
              <div className="bg-axonix-100/60 rounded-lg p-4 border border-axonix-300/50">
                <h4 className="font-medium text-axonix-800 mb-2">Explanation:</h4>
                <p className="text-sm text-axonix-600">{currentTask.explanation}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={handlePreviousTask}
          disabled={currentTaskIndex === 0}
          className="border-axonix-400/50 text-axonix-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel} className="border-axonix-400/50 text-axonix-700">
            Cancel
          </Button>
          <Button
            onClick={handleNextTask}
            disabled={isSubmitting}
            className="bg-gradient-to-r from-axonix-700 to-axonix-800 hover:from-axonix-800 hover:to-axonix-900 text-white"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </>
            ) : currentTaskIndex >= workflow.tasks.length - 1 ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete
              </>
            ) : (
              <>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
