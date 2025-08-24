import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, AlertCircle, Code, FileText, Brain, Zap, Send, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TestQuestion {
  id: string;
  type: 'multiple-choice' | 'coding' | 'short-answer';
  question: string;
  options?: string[];
  correctAnswer?: string | number;
  codeTemplate?: string;
  language?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  points: number;
}

interface TestSession {
  moduleId: string;
  subModuleId: string;
  userId: string;
  startTime: string;
  answers: Record<string, any>;
  timeSpent: number;
  currentQuestion: number;
  realTimeResponses: Array<{
    questionId: string;
    response: any;
    timestamp: string;
    confidence?: number;
  }>;
}

interface AIFeedback {
  score: number;
  feedback: string;
  suggestions: string[];
  nextTopics: string[];
  strengths: string[];
  weaknesses: string[];
  subtasks: Array<{
    id: string;
    title: string;
    description: string;
    priority: string;
    estimatedTime: string;
  }>;
}

const TestPage = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { module, submodule } = router.query;
  
  const [testData, setTestData] = useState<TestQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeRemaining, setTimeRemaining] = useState(1800); // 30 minutes
  const [testSession, setTestSession] = useState<TestSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<AIFeedback | null>(null);
  const [realTimeAnalysis, setRealTimeAnalysis] = useState<string>('');
  const [responseConfidence, setResponseConfidence] = useState<Record<string, number>>({});
  
  // WebSocket ref for real-time communication (simulated)
  const wsRef = useRef<WebSocket | null>(null);
  const analysisTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (module && submodule) {
      initializeTest();
    }
  }, [module, submodule]);

  useEffect(() => {
    if (timeRemaining > 0 && !aiFeedback) {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0) {
      handleSubmitTest();
    }
  }, [timeRemaining, aiFeedback]);

  const initializeTest = async () => {
    try {
      setLoading(true);
      
      // Initialize test session
      const session: TestSession = {
        moduleId: module as string,
        subModuleId: submodule as string,
        userId: 'user_123', // This should come from auth
        startTime: new Date().toISOString(),
        answers: {},
        timeSpent: 0,
        currentQuestion: 0,
        realTimeResponses: []
      };
      setTestSession(session);

      // Load test data (this would typically come from an API)
      const mockTestData: TestQuestion[] = [
        {
          id: 'q1',
          type: 'multiple-choice',
          question: 'What is the time complexity of binary search?',
          options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
          correctAnswer: 1,
          difficulty: 'Medium',
          points: 10
        },
        {
          id: 'q2',
          type: 'coding',
          question: 'Implement a function to reverse a string',
          codeTemplate: 'function reverseString(str) {\n  // Your code here\n}',
          language: 'javascript',
          difficulty: 'Easy',
          points: 15
        },
        {
          id: 'q3',
          type: 'short-answer',
          question: 'Explain the difference between call, apply, and bind in JavaScript',
          difficulty: 'Hard',
          points: 20
        }
      ];
      
      setTestData(mockTestData);
      setLoading(false);
    } catch (error) {
      console.error('Error initializing test:', error);
      setLoading(false);
    }
  };

  const handleAnswerChange = async (questionId: string, value: any) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);

    // Update test session with real-time response
    if (testSession) {
      const realTimeResponse = {
        questionId,
        response: value,
        timestamp: new Date().toISOString(),
        confidence: calculateConfidence(value)
      };

      const updatedSession = {
        ...testSession,
        answers: newAnswers,
        realTimeResponses: [...testSession.realTimeResponses, realTimeResponse]
      };
      setTestSession(updatedSession);

      // Trigger real-time AI analysis with debounce
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current);
      }
      
      analysisTimeoutRef.current = setTimeout(() => {
        performRealTimeAnalysis(questionId, value);
      }, 1500);
    }
  };

  const calculateConfidence = (response: any): number => {
    if (!response) return 0;
    
    if (typeof response === 'string') {
      const length = response.length;
      if (length < 10) return 30;
      if (length < 50) return 60;
      if (length < 100) return 80;
      return 95;
    }
    
    return 75; // Default confidence for other types
  };

  const performRealTimeAnalysis = async (questionId: string, response: any) => {
    try {
      const analysisResponse = await fetch('/api/ai/real-time-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId,
          response,
          currentQuestion: testData[currentQuestionIndex],
          sessionData: testSession
        }),
      });

      if (analysisResponse.ok) {
        const analysis = await analysisResponse.json();
        setRealTimeAnalysis(analysis.insights);
        
        if (analysis.confidence) {
          setResponseConfidence(prev => ({
            ...prev,
            [questionId]: analysis.confidence
          }));
        }
      }
    } catch (error) {
      console.error('Real-time analysis error:', error);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < testData.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setRealTimeAnalysis('');
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setRealTimeAnalysis('');
    }
  };

  const handleSubmitTest = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setIsProcessingAI(true);
    
    try {
      const finalSession = {
        ...testSession,
        answers,
        timeSpent: 1800 - timeRemaining,
        currentQuestion: currentQuestionIndex
      };

      // Submit to AI for analysis
      const response = await fetch('/api/ai/analyze-submission', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionData: finalSession,
          testQuestions: testData,
          moduleContext: {
            moduleId: module,
            subModuleId: submodule,
            difficulty: testData[0]?.difficulty || 'Medium'
          }
        }),
      });

      if (response.ok) {
        const feedback = await response.json();
        setAiFeedback(feedback);
        
        toast({
          title: "Test Completed!",
          description: "Your AI-powered feedback is ready.",
        });
      } else {
        throw new Error('Failed to get AI feedback');
      }
    } catch (error) {
      console.error('Error submitting test:', error);
      toast({
        title: "Submission Error",
        description: "There was an issue processing your test. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setIsProcessingAI(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return ((currentQuestionIndex + 1) / testData.length) * 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading test...</p>
        </div>
      </div>
    );
  }

  if (testData.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Test Not Available</h3>
            <p className="text-gray-600 mb-4">
              No test questions found for this module.
            </p>
            <Button onClick={() => router.push('/roadmap')}>
              Back to Roadmap
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (aiFeedback) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-6">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-green-600 flex items-center justify-center gap-2">
                <CheckCircle2 className="h-8 w-8" />
                Test Completed!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Your Score</h3>
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {Math.round(aiFeedback.score)}%
                  </div>
                  <p className="text-gray-600">{aiFeedback.feedback}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Performance Insights</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-green-600">Strengths:</span>
                      <ul className="text-sm text-gray-600 ml-4">
                        {aiFeedback.strengths.map((strength, index) => (
                          <li key={index}>• {strength}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-orange-600">Areas for Improvement:</span>
                      <ul className="text-sm text-gray-600 ml-4">
                        {aiFeedback.weaknesses.map((weakness, index) => (
                          <li key={index}>• {weakness}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Personalized Learning Path</h3>
                <div className="grid gap-3">
                  {aiFeedback.subtasks.map((subtask, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{subtask.title}</h4>
                        <Badge variant={subtask.priority === 'high' ? 'destructive' : 'default'}>
                          {subtask.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{subtask.description}</p>
                      <p className="text-xs text-gray-500 mt-2">⏱️ {subtask.estimatedTime}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 mt-6 justify-center">
                <Button onClick={() => router.push('/roadmap')}>
                  Back to Roadmap
                </Button>
                <Button variant="outline" onClick={() => router.push('/dashboard')}>
                  View Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentQuestion = testData[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 capitalize">
                {module} - {submodule?.toString().replace('-', ' ')}
              </h1>
              <p className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} of {testData.length}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                {formatTime(timeRemaining)}
              </div>
              <Badge variant={timeRemaining < 300 ? 'destructive' : 'default'}>
                {timeRemaining < 300 ? 'Running Low' : 'Time Left'}
              </Badge>
            </div>
          </div>
          <Progress value={getProgressPercentage()} className="mt-3" />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Question Panel */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {currentQuestion.type === 'coding' && <Code className="h-5 w-5" />}
                    {currentQuestion.type === 'multiple-choice' && <FileText className="h-5 w-5" />}
                    {currentQuestion.type === 'short-answer' && <Brain className="h-5 w-5" />}
                    Question {currentQuestionIndex + 1}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      currentQuestion.difficulty === 'Easy' ? 'default' :
                      currentQuestion.difficulty === 'Medium' ? 'secondary' : 'destructive'
                    }>
                      {currentQuestion.difficulty}
                    </Badge>
                    <Badge variant="outline">{currentQuestion.points} pts</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-lg">{currentQuestion.question}</p>
                  
                  {currentQuestion.type === 'multiple-choice' && (
                    <RadioGroup
                      value={answers[currentQuestion.id]?.toString() || ''}
                      onValueChange={(value) => handleAnswerChange(currentQuestion.id, parseInt(value))}
                    >
                      {currentQuestion.options?.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                          <Label htmlFor={`option-${index}`} className="cursor-pointer">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {currentQuestion.type === 'coding' && (
                    <div className="space-y-2">
                      <Label htmlFor="code-editor">Your Code:</Label>
                      <Textarea
                        id="code-editor"
                        placeholder={currentQuestion.codeTemplate}
                        value={answers[currentQuestion.id] || ''}
                        onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                        className="font-mono min-h-[200px]"
                      />
                    </div>
                  )}

                  {currentQuestion.type === 'short-answer' && (
                    <div className="space-y-2">
                      <Label htmlFor="short-answer">Your Answer:</Label>
                      <Textarea
                        id="short-answer"
                        placeholder="Type your answer here..."
                        value={answers[currentQuestion.id] || ''}
                        onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                        className="min-h-[150px]"
                      />
                    </div>
                  )}

                  {/* Real-time AI insights */}
                  {realTimeAnalysis && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">AI Insights</span>
                      </div>
                      <p className="text-sm text-blue-700">{realTimeAnalysis}</p>
                    </div>
                  )}

                  {/* Confidence indicator */}
                  {responseConfidence[currentQuestion.id] && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>Response Confidence:</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${responseConfidence[currentQuestion.id]}%` }}
                        ></div>
                      </div>
                      <span>{responseConfidence[currentQuestion.id]}%</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>
              
              <div className="flex gap-2">
                {currentQuestionIndex === testData.length - 1 ? (
                  <Button
                    onClick={handleSubmitTest}
                    disabled={isSubmitting}
                    className="flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Submit Test
                      </>
                    )}
                  </Button>
                ) : (
                  <Button onClick={handleNextQuestion}>
                    Next
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Progress Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {testData.map((_, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                        index < currentQuestionIndex ? 'bg-green-500 text-white' :
                        index === currentQuestionIndex ? 'bg-blue-500 text-white' :
                        'bg-gray-200 text-gray-600'
                      }`}>
                        {index + 1}
                      </div>
                      <span className={`text-sm ${
                        index === currentQuestionIndex ? 'font-medium' : ''
                      }`}>
                        Question {index + 1}
                      </span>
                      {answers[testData[index].id] && (
                        <CheckCircle2 className="h-4 w-4 text-green-500 ml-auto" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Processing Status */}
            {isProcessingAI && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    <span>AI is analyzing your responses...</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
