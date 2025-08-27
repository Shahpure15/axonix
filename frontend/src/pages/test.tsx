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
import { axonixColors, getAxonixGradient } from '@/lib/brand-colors';

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
    // Check if this is an AI-generated test
    const urlParams = new URLSearchParams(window.location.search);
    const isAITest = urlParams.get('ai') === 'true';
    const testId = urlParams.get('testId');
    
    if (isAITest && testId) {
      initializeAITest(testId);
    } else if (module && submodule) {
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

  /**
   * Initialize AI-generated test from session storage
   */
  const initializeAITest = async (testId: string) => {
    try {
      setLoading(true);
      console.log('🤖 Loading AI-generated test:', testId);
      
      // Get AI test data from session storage
      const aiTestData = sessionStorage.getItem('aiGeneratedTest');
      if (!aiTestData) {
        throw new Error('AI test data not found');
      }

      const parsedTestData = JSON.parse(aiTestData);
      console.log('📊 AI Test Data:', parsedTestData);

      // Initialize test session for AI test
      const session: TestSession = {
        moduleId: parsedTestData.domain,
        subModuleId: parsedTestData.testType,
        userId: 'user_123', // This should come from auth
        startTime: new Date().toISOString(),
        answers: {},
        timeSpent: 0,
        currentQuestion: 0,
        realTimeResponses: []
      };
      setTestSession(session);

      // Convert AI questions to test format
      const formattedQuestions: TestQuestion[] = parsedTestData.questions.map((q: any) => ({
        id: q._id,
        type: q.questionType || 'multiple-choice',
        question: q.questionText,
        options: q.options?.map((opt: any) => opt.text),
        difficulty: q.difficulty || 'Medium',
        points: q.points || 10,
        codeTemplate: q.codeTemplate,
        language: q.language
      }));

      setTestData(formattedQuestions);
      
      // Set custom time limit for AI test
      const timeLimit = parsedTestData.metadata?.timeLimit || 1800;
      setTimeRemaining(timeLimit);

      console.log('✅ AI test initialized with', formattedQuestions.length, 'questions');
      
    } catch (error) {
      console.error('❌ Error loading AI test:', error);
      // Fallback to regular test or go back to learn page
      router.push('/learn');
    } finally {
      setLoading(false);
    }
  };

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
      <div className="min-h-screen flex items-center justify-center" style={{ background: getAxonixGradient('primary') }}>
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
            <div className="absolute inset-0 rounded-full bg-purple-500/20 animate-pulse"></div>
          </div>
          <p className="text-purple-700 font-medium">Loading test...</p>
        </div>
      </div>
    );
  }

  if (testData.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: getAxonixGradient('primary') }}>
        <Card className="w-full max-w-md bg-white/80 backdrop-blur-md border-purple-200 shadow-xl">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-purple-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-purple-800">Test Not Available</h3>
            <p className="text-purple-600 mb-4">
              No test questions found for this module.
            </p>
            <Button 
              onClick={() => router.push('/roadmap')}
              className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg"
            >
              Back to Roadmap
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (aiFeedback) {
    return (
      <div className="min-h-screen p-4" style={{ background: getAxonixGradient('primary') }}>
        <div className="max-w-4xl mx-auto">
          <Card className="mb-6 bg-white/90 backdrop-blur-md border-purple-200 shadow-2xl">
            <CardHeader className="text-center bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-t-lg">
              <CardTitle className="text-2xl flex items-center justify-center gap-2">
                <CheckCircle2 className="h-8 w-8" />
                Test Completed!
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-purple-800">Your Score</h3>
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {Math.round(aiFeedback.score)}%
                  </div>
                  <p className="text-purple-700">{aiFeedback.feedback}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-purple-800">Performance Insights</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-green-600">Strengths:</span>
                      <ul className="text-sm text-purple-600 ml-4">
                        {aiFeedback.strengths.map((strength, index) => (
                          <li key={index}>• {strength}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-orange-600">Areas for Improvement:</span>
                      <ul className="text-sm text-purple-600 ml-4">
                        {aiFeedback.weaknesses.map((weakness, index) => (
                          <li key={index}>• {weakness}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3 text-purple-800">Personalized Learning Path</h3>
                <div className="grid gap-3">
                  {aiFeedback.subtasks.map((subtask, index) => (
                    <div key={index} className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-purple-800">{subtask.title}</h4>
                        <Badge variant={subtask.priority === 'high' ? 'destructive' : 'default'} className="bg-purple-100 text-purple-700">
                          {subtask.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-purple-600 mt-1">{subtask.description}</p>
                      <p className="text-xs text-purple-500 mt-2">⏱️ {subtask.estimatedTime}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 mt-6 justify-center">
                <Button 
                  onClick={() => router.push('/roadmap')}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg"
                >
                  Back to Roadmap
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/dashboard')}
                  className="border-purple-300 text-purple-700 hover:bg-purple-50"
                >
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
    <div className="min-h-screen bg-gradient-to-br from-axonix-100 via-axonix-200 to-axonix-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-axonix-100/98 via-axonix-200/95 to-axonix-300/90 backdrop-blur-lg shadow-xl border-b border-axonix-400/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-axonix-800 capitalize">
                {module} - {submodule?.toString().replace('-', ' ')}
              </h1>
              <p className="text-sm text-axonix-700">
                Question {currentQuestionIndex + 1} of {testData.length}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-axonix-800 bg-axonix-200/80 px-3 py-2 rounded-lg border border-axonix-400/50">
                <Clock className="h-4 w-4" />
                {formatTime(timeRemaining)}
              </div>
              <Badge 
                variant={timeRemaining < 300 ? 'destructive' : 'default'}
                className={timeRemaining < 300 ? 'bg-red-100 text-red-700 border border-red-300/50' : 'bg-axonix-300/80 text-axonix-800 border border-axonix-500/50'}
              >
                {timeRemaining < 300 ? 'Running Low' : 'Time Left'}
              </Badge>
            </div>
          </div>
          <div className="mt-3">
            <Progress 
              value={getProgressPercentage()} 
              className="h-3 bg-axonix-200/50 border border-axonix-300/30 rounded-full overflow-hidden"
              style={{
                '--progress-background': axonixColors.primary[200],
                '--progress-foreground': 'linear-gradient(90deg, ' + axonixColors.primary[500] + ', ' + axonixColors.primary[600] + ')'
              } as any}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Question Panel */}
          <div className="lg:col-span-2">
            <Card className="bg-gradient-to-br from-axonix-100/95 to-axonix-200/90 backdrop-blur-lg border border-axonix-400/50 shadow-xl shadow-axonix-200/20">
              <CardHeader className="bg-gradient-to-r from-axonix-200/80 to-axonix-300/70 rounded-t-lg border-b border-axonix-400/30">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-axonix-800">
                    {currentQuestion.type === 'coding' && <Code className="h-5 w-5 text-axonix-600" />}
                    {currentQuestion.type === 'multiple-choice' && <FileText className="h-5 w-5 text-axonix-600" />}
                    {currentQuestion.type === 'short-answer' && <Brain className="h-5 w-5 text-axonix-600" />}
                    Question {currentQuestionIndex + 1}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      currentQuestion.difficulty === 'Easy' ? 'default' :
                      currentQuestion.difficulty === 'Medium' ? 'secondary' : 'destructive'
                    } className="bg-axonix-200/80 text-axonix-800 border border-axonix-400/50">
                      {currentQuestion.difficulty}
                    </Badge>
                    <Badge variant="outline" className="border-axonix-500/50 text-axonix-800 bg-axonix-100/70">{currentQuestion.points} pts</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 bg-gradient-to-b from-axonix-50/90 to-axonix-100/80">
                <div className="space-y-4">
                  <p className="text-lg text-axonix-800 leading-relaxed">{currentQuestion.question}</p>
                  
                  {currentQuestion.type === 'multiple-choice' && (
                    <RadioGroup
                      value={answers[currentQuestion.id]?.toString() || ''}
                      onValueChange={(value) => handleAnswerChange(currentQuestion.id, parseInt(value))}
                    >
                      {currentQuestion.options?.map((option, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 rounded-lg border border-axonix-300/50 hover:border-axonix-500/50 hover:bg-axonix-200/50 transition-all">{/* Rest of options will follow */}
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
                    <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-800">AI Insights</span>
                      </div>
                      <p className="text-sm text-purple-700">{realTimeAnalysis}</p>
                    </div>
                  )}

                  {/* Confidence indicator */}
                  {responseConfidence[currentQuestion.id] && (
                    <div className="flex items-center gap-2 text-sm text-purple-600">
                      <span>Response Confidence:</span>
                      <div className="flex-1 bg-purple-100 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${responseConfidence[currentQuestion.id]}%` }}
                        ></div>
                      </div>
                      <span className="font-medium">{responseConfidence[currentQuestion.id]}%</span>
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
                className="border-purple-300 text-purple-700 hover:bg-purple-50 disabled:opacity-50"
              >
                Previous
              </Button>
              
              <div className="flex gap-2">
                {currentQuestionIndex === testData.length - 1 ? (
                  <Button
                    onClick={handleSubmitTest}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg"
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
                  <Button 
                    onClick={handleNextQuestion}
                    className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg"
                  >
                    Next
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Progress Overview */}
            <Card className="bg-white/90 backdrop-blur-md border-purple-200 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-t-lg border-b border-purple-200">
                <CardTitle className="text-lg text-purple-800">Progress</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {testData.map((_, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                        index < currentQuestionIndex ? 'bg-gradient-to-r from-green-400 to-green-500 text-white shadow-md' :
                        index === currentQuestionIndex ? 'bg-gradient-to-r from-axonix-700 to-axonix-800 text-axonix-50 shadow-lg ring-2 ring-axonix-500/50' :
                        'bg-axonix-200 text-axonix-800 border border-axonix-300'
                      }`}>
                        {index + 1}
                      </div>
                      <span className={`text-sm ${
                        index === currentQuestionIndex ? 'font-medium text-axonix-800' : 'text-axonix-600'
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
              <Card className="bg-white/90 backdrop-blur-md border-purple-200 shadow-xl">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                    <span className="text-purple-700">AI is analyzing your responses...</span>
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
