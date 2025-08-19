import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from '@/hooks/useSession';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import CodeEditor from './CodeEditor';
import HintLadder from './HintLadder';
import { 
  Brain, 
  Clock, 
  Target, 
  CheckCircle, 
  ArrowRight,
  BookOpen,
  Lightbulb 
} from 'lucide-react';

interface LearningSessionProps {
  sessionId: string;
}

export default function LearningSession({ sessionId }: LearningSessionProps) {
  const router = useRouter();
  const {
    currentSession,
    currentQuestion,
    submitAnswer,
    endSession,
    isSubmitting,
    timeElapsed,
  } = useSession();

  const [sessionPhase, setSessionPhase] = useState<'recall' | 'learn' | 'practice' | 'reflect'>('recall');
  const [completedPhases, setCompletedPhases] = useState<string[]>([]);
  const [reflectionNotes, setReflectionNotes] = useState('');

  useEffect(() => {
    // Initialize session phase based on session data
    if (currentSession) {
      // Determine current phase based on session progress
      setSessionPhase('practice'); // Simplified for now
    }
  }, [currentSession]);

  const handleCodeSubmission = async (code: string, language: string) => {
    const result = await submitAnswer(code, language);
    
    // If solution is accepted, move to reflection phase
    if (result.verdict === 'accepted') {
      setCompletedPhases(prev => [...prev, 'practice']);
      setSessionPhase('reflect');
    }
    
    return result;
  };

  const handlePhaseComplete = (phase: string) => {
    setCompletedPhases(prev => [...prev, phase]);
    
    // Progress to next phase
    switch (phase) {
      case 'recall':
        setSessionPhase('learn');
        break;
      case 'learn':
        setSessionPhase('practice');
        break;
      case 'practice':
        setSessionPhase('reflect');
        break;
      case 'reflect':
        // Session complete
        handleSessionComplete();
        break;
    }
  };

  const handleSessionComplete = async () => {
    await endSession();
    router.push('/dashboard');
  };

  const getPhaseProgress = () => {
    const phases = ['recall', 'learn', 'practice', 'reflect'];
    const currentIndex = phases.indexOf(sessionPhase);
    const completedCount = completedPhases.length;
    return ((completedCount + (currentIndex + 1) * 0.5) / phases.length) * 100;
  };

  const renderPhaseContent = () => {
    switch (sessionPhase) {
      case 'recall':
        return <RecallPhase onComplete={() => handlePhaseComplete('recall')} />;
      case 'learn':
        return <LearnPhase onComplete={() => handlePhaseComplete('learn')} />;
      case 'practice':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            <div className="lg:col-span-2 space-y-6">
              <ProblemStatement problem={currentQuestion} />
              <CodeEditor
                question={currentQuestion}
                onSubmit={handleCodeSubmission}
                isSubmitting={isSubmitting}
                timeElapsed={timeElapsed}
              />
            </div>
            <div className="space-y-6">
              <HintLadder questionId={currentQuestion?.question_id} />
            </div>
          </div>
        );
      case 'reflect':
        return (
          <ReflectionPhase
            onComplete={() => handlePhaseComplete('reflect')}
            notes={reflectionNotes}
            onNotesChange={setReflectionNotes}
          />
        );
    }
  };

  if (!currentSession) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Session Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-primary" />
                <span>Learning Session</span>
              </CardTitle>
              <CardDescription>
                {currentSession.domain} • {sessionPhase.charAt(0).toUpperCase() + sessionPhase.slice(1)} Phase
              </CardDescription>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{Math.floor(timeElapsed / 60000)}:{((timeElapsed % 60000) / 1000).toFixed(0).padStart(2, '0')}</span>
              </Badge>
              <Button variant="outline" size="sm" onClick={handleSessionComplete}>
                End Session
              </Button>
            </div>
          </div>
          <Progress value={getPhaseProgress()} className="mt-4" />
        </CardHeader>
      </Card>

      {/* Phase Navigation */}
      <div className="flex items-center justify-center space-x-4">
        {['recall', 'learn', 'practice', 'reflect'].map((phase, index) => (
          <div key={phase} className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
              completedPhases.includes(phase) 
                ? 'bg-green-500 border-green-500 text-white' 
                : sessionPhase === phase
                ? 'border-primary bg-primary text-white'
                : 'border-gray-300 text-gray-500'
            }`}>
              {completedPhases.includes(phase) ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <span className="text-sm font-medium">{index + 1}</span>
              )}
            </div>
            <span className="ml-2 text-sm font-medium capitalize">{phase}</span>
            {index < 3 && <ArrowRight className="h-4 w-4 mx-4 text-gray-400" />}
          </div>
        ))}
      </div>

      {/* Phase Content */}
      <div className="min-h-[600px]">
        {renderPhaseContent()}
      </div>
    </div>
  );
}

// Phase Components
function RecallPhase({ onComplete }: { onComplete: () => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-blue-500" />
          <span>Recall Phase</span>
        </CardTitle>
        <CardDescription>
          Review concepts you've learned before
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Lightbulb className="h-4 w-4" />
          <AlertDescription>
            Let's start by recalling what you know. This helps strengthen your memory and prepare for new learning.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-4">
          <p>Quick review questions will appear here based on your previous learning...</p>
          <Button onClick={onComplete} className="w-full">
            Continue to Learn Phase
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function LearnPhase({ onComplete }: { onComplete: () => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BookOpen className="h-5 w-5 text-green-500" />
          <span>Learn Phase</span>
        </CardTitle>
        <CardDescription>
          Learn new concepts and techniques
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <BookOpen className="h-4 w-4" />
          <AlertDescription>
            Time to learn something new! We'll introduce concepts that will help you solve the upcoming problem.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-4">
          <p>Micro-lesson content will be displayed here...</p>
          <Button onClick={onComplete} className="w-full">
            Continue to Practice Phase
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ProblemStatement({ problem }: { problem: any }) {
  if (!problem) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{problem.title}</span>
          <Badge variant={
            problem.difficulty === 'easy' ? 'default' :
            problem.difficulty === 'medium' ? 'secondary' : 'destructive'
          }>
            {problem.difficulty}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="prose max-w-none">
          <div dangerouslySetInnerHTML={{ __html: problem.body }} />
        </div>

        {problem.testcases && problem.testcases.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Examples:</h4>
            {problem.testcases.slice(0, 2).map((testcase: any, index: number) => (
              <div key={index} className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm">
                  <div><strong>Input:</strong> {testcase.input}</div>
                  <div><strong>Output:</strong> {testcase.expected_output}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {problem.tags && problem.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {problem.tags.map((tag: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ReflectionPhase({ 
  onComplete, 
  notes, 
  onNotesChange 
}: { 
  onComplete: () => void;
  notes: string;
  onNotesChange: (notes: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Target className="h-5 w-5 text-purple-500" />
          <span>Reflection Phase</span>
        </CardTitle>
        <CardDescription>
          Reflect on your learning experience
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Target className="h-4 w-4" />
          <AlertDescription>
            Great job! Now let's reflect on what you learned and any challenges you faced.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">What did you learn today?</label>
            <textarea
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              className="w-full mt-1 p-3 border rounded-lg"
              rows={4}
              placeholder="Reflect on your learning experience, challenges faced, and insights gained..."
            />
          </div>
          
          <Button onClick={onComplete} className="w-full">
            Complete Session
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}