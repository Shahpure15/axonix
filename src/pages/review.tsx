import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle,
  Brain,
  Clock,
  RotateCcw,
  TrendingDown,
  Target,
  CheckCircle,
  XCircle,
  Calendar,
  BookOpen,
  Lightbulb,
  RefreshCw,
  Star,
  Eye
} from 'lucide-react';

interface Mistake {
  id: string;
  question: string;
  domain: string;
  topic: string;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  frequency: number;
  lastAttempt: Date;
  isResolved: boolean;
  concept: string;
}

interface WeakArea {
  topic: string;
  domain: string;
  mistakeCount: number;
  accuracy: number;
  lastPracticed: Date;
  urgency: 'high' | 'medium' | 'low';
}

export default function ReviewPage() {
  const router = useRouter();
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [weakAreas, setWeakAreas] = useState<WeakArea[]>([]);
  const [selectedMistake, setSelectedMistake] = useState<Mistake | null>(null);
  const [showExplanation, setShowExplanation] = useState<string | null>(null);

  // Mock data for demonstration
  useEffect(() => {
    const mockMistakes: Mistake[] = [
      {
        id: '1',
        question: 'What is the time complexity of binary search?',
        domain: 'Algorithms',
        topic: 'Search Algorithms',
        userAnswer: 'O(n)',
        correctAnswer: 'O(log n)',
        explanation: 'Binary search repeatedly divides the search space in half, leading to logarithmic time complexity.',
        difficulty: 'medium',
        frequency: 5,
        lastAttempt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        isResolved: false,
        concept: 'Time Complexity Analysis'
      },
      {
        id: '2',
        question: 'Which data structure is best for implementing a LRU cache?',
        domain: 'Data Structures',
        topic: 'Hash Tables & Linked Lists',
        userAnswer: 'Array',
        correctAnswer: 'HashMap + Doubly Linked List',
        explanation: 'LRU cache requires O(1) access and O(1) update operations, which is achieved by combining HashMap for fast lookup and Doubly Linked List for efficient insertion/deletion.',
        difficulty: 'hard',
        frequency: 3,
        lastAttempt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        isResolved: false,
        concept: 'Cache Design'
      },
      {
        id: '3',
        question: 'What is the difference between SQL JOIN types?',
        domain: 'Databases',
        topic: 'SQL Queries',
        userAnswer: 'No difference',
        correctAnswer: 'INNER JOIN returns matching records, LEFT JOIN returns all left records, RIGHT JOIN returns all right records',
        explanation: 'Different JOIN types determine which records are included in the result set based on matching conditions.',
        difficulty: 'medium',
        frequency: 4,
        lastAttempt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        isResolved: true,
        concept: 'Database Joins'
      },
      {
        id: '4',
        question: 'How does garbage collection work in Java?',
        domain: 'Programming Languages',
        topic: 'Memory Management',
        userAnswer: 'Manual memory deallocation',
        correctAnswer: 'Automatic memory management that reclaims unused objects',
        explanation: 'Java garbage collector automatically identifies and removes objects that are no longer reachable, freeing up memory.',
        difficulty: 'medium',
        frequency: 6,
        lastAttempt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        isResolved: false,
        concept: 'Memory Management'
      }
    ];

    const mockWeakAreas: WeakArea[] = [
      {
        topic: 'Time Complexity Analysis',
        domain: 'Algorithms',
        mistakeCount: 8,
        accuracy: 45,
        lastPracticed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        urgency: 'high'
      },
      {
        topic: 'Database Joins',
        domain: 'Databases',
        mistakeCount: 5,
        accuracy: 60,
        lastPracticed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        urgency: 'medium'
      },
      {
        topic: 'Memory Management',
        domain: 'Programming Languages',
        mistakeCount: 7,
        accuracy: 40,
        lastPracticed: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        urgency: 'high'
      },
      {
        topic: 'Graph Algorithms',
        domain: 'Algorithms',
        mistakeCount: 3,
        accuracy: 75,
        lastPracticed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        urgency: 'low'
      }
    ];

    setMistakes(mockMistakes);
    setWeakAreas(mockWeakAreas);
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'from-green-400 to-emerald-500';
      case 'medium': return 'from-yellow-400 to-orange-500';
      case 'hard': return 'from-red-400 to-pink-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'border-red-400/50 bg-red-50/50';
      case 'medium': return 'border-yellow-400/50 bg-yellow-50/50';
      case 'low': return 'border-green-400/50 bg-green-50/50';
      default: return 'border-gray-400/50 bg-gray-50/50';
    }
  };

  const handleRetryMistake = (mistake: Mistake) => {
    // In a real app, this would create a focused practice session
    router.push(`/practice?topic=${encodeURIComponent(mistake.topic)}&focus=${mistake.id}`);
  };

  const markAsResolved = (mistakeId: string) => {
    setMistakes(prev => 
      prev.map(m => m.id === mistakeId ? { ...m, isResolved: true } : m)
    );
  };

  const unresolvedMistakes = mistakes.filter(m => !m.isResolved);
  const resolvedMistakes = mistakes.filter(m => m.isResolved);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-axonix-800 axonix-text-shadow">Review Center</h1>
            <p className="text-axonix-600 mt-1">Analyze and practice your frequent mistakes to improve learning</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge className="bg-gradient-to-r from-axonix-600 to-axonix-800 text-white px-4 py-2">
              {unresolvedMistakes.length} Active Issues
            </Badge>
            <Button 
              onClick={() => router.push('/practice')}
              className="bg-gradient-to-r from-axonix-700 to-axonix-800 hover:from-axonix-800 hover:to-axonix-900 text-white shadow-lg"
            >
              <Target className="h-4 w-4 mr-2" />
              Start Practice
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-axonix-100/95 to-axonix-200/90 backdrop-blur-lg border border-axonix-400/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-axonix-600">Total Mistakes</p>
                  <p className="text-2xl font-bold text-axonix-800">{mistakes.length}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-axonix-100/95 to-axonix-200/90 backdrop-blur-lg border border-axonix-400/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-axonix-600">Resolved</p>
                  <p className="text-2xl font-bold text-green-600">{resolvedMistakes.length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-axonix-100/95 to-axonix-200/90 backdrop-blur-lg border border-axonix-400/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-axonix-600">Weak Areas</p>
                  <p className="text-2xl font-bold text-red-600">{weakAreas.filter(w => w.urgency === 'high').length}</p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-axonix-100/95 to-axonix-200/90 backdrop-blur-lg border border-axonix-400/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-axonix-600">Avg Accuracy</p>
                  <p className="text-2xl font-bold text-axonix-800">
                    {Math.round(weakAreas.reduce((acc, w) => acc + w.accuracy, 0) / weakAreas.length)}%
                  </p>
                </div>
                <Target className="h-8 w-8 text-axonix-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="mistakes" className="space-y-6">
          <TabsList className="bg-axonix-200/60 border border-axonix-400/30">
            <TabsTrigger value="mistakes" className="data-[state=active]:bg-axonix-700 data-[state=active]:text-white">
              Frequent Mistakes
            </TabsTrigger>
            <TabsTrigger value="weak-areas" className="data-[state=active]:bg-axonix-700 data-[state=active]:text-white">
              Weak Areas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mistakes" className="space-y-6">
            {/* Unresolved Mistakes */}
            <Card className="bg-gradient-to-br from-axonix-100/95 to-axonix-200/90 backdrop-blur-lg border border-axonix-400/50 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-axonix-200/80 to-axonix-300/70 rounded-t-lg border-b border-axonix-400/30">
                <CardTitle className="flex items-center gap-2 text-axonix-800">
                  <XCircle className="h-6 w-6 text-red-500" />
                  Active Mistakes ({unresolvedMistakes.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {unresolvedMistakes.map((mistake) => (
                    <div 
                      key={mistake.id}
                      className="p-4 rounded-lg border-2 border-red-200/50 bg-red-50/30 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge className={`bg-gradient-to-r ${getDifficultyColor(mistake.difficulty)} text-white border-0`}>
                              {mistake.difficulty}
                            </Badge>
                            <Badge variant="outline" className="border-axonix-400/50 text-axonix-700">
                              {mistake.domain}
                            </Badge>
                            <Badge variant="outline" className="border-orange-400/50 text-orange-700">
                              {mistake.frequency}x repeated
                            </Badge>
                          </div>
                          
                          <h3 className="font-semibold text-axonix-800 mb-2">{mistake.question}</h3>
                          <p className="text-sm text-axonix-600 mb-2">
                            <span className="font-medium">Topic:</span> {mistake.topic} • {mistake.concept}
                          </p>
                          
                          <div className="grid md:grid-cols-2 gap-4 mb-3">
                            <div className="bg-red-100/60 p-3 rounded-lg border border-red-200/50">
                              <p className="text-sm font-medium text-red-800 mb-1">Your Answer:</p>
                              <p className="text-sm text-red-700">{mistake.userAnswer}</p>
                            </div>
                            <div className="bg-green-100/60 p-3 rounded-lg border border-green-200/50">
                              <p className="text-sm font-medium text-green-800 mb-1">Correct Answer:</p>
                              <p className="text-sm text-green-700">{mistake.correctAnswer}</p>
                            </div>
                          </div>

                          {showExplanation === mistake.id && (
                            <div className="bg-blue-100/60 p-3 rounded-lg border border-blue-200/50 mb-3">
                              <p className="text-sm font-medium text-blue-800 mb-1 flex items-center gap-2">
                                <Lightbulb className="h-4 w-4" />
                                Explanation:
                              </p>
                              <p className="text-sm text-blue-700">{mistake.explanation}</p>
                            </div>
                          )}

                          <p className="text-xs text-axonix-500">
                            Last attempt: {mistake.lastAttempt.toLocaleDateString()}
                          </p>
                        </div>

                        <div className="flex flex-col gap-2 ml-4">
                          <Button
                            size="sm"
                            onClick={() => setShowExplanation(
                              showExplanation === mistake.id ? null : mistake.id
                            )}
                            variant="outline"
                            className="border-axonix-400/50 text-axonix-700"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            {showExplanation === mistake.id ? 'Hide' : 'Explain'}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleRetryMistake(mistake)}
                            className="bg-gradient-to-r from-axonix-600 to-axonix-700 hover:from-axonix-700 hover:to-axonix-800 text-white"
                          >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            Practice
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => markAsResolved(mistake.id)}
                            variant="outline"
                            className="border-green-400/50 text-green-700 hover:bg-green-50"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Mark Resolved
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {unresolvedMistakes.length === 0 && (
                    <div className="text-center py-8">
                      <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-axonix-800 mb-2">Great job!</h3>
                      <p className="text-axonix-600">You have no unresolved mistakes. Keep up the excellent work!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Resolved Mistakes */}
            {resolvedMistakes.length > 0 && (
              <Card className="bg-gradient-to-br from-axonix-100/95 to-axonix-200/90 backdrop-blur-lg border border-axonix-400/50 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-green-200/80 to-green-300/70 rounded-t-lg border-b border-green-400/30">
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    Resolved Mistakes ({resolvedMistakes.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid gap-4">
                    {resolvedMistakes.map((mistake) => (
                      <div 
                        key={mistake.id}
                        className="p-4 rounded-lg border border-green-200/50 bg-green-50/30 opacity-75"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-green-800">{mistake.question}</h4>
                            <p className="text-sm text-green-600">{mistake.topic} • {mistake.domain}</p>
                          </div>
                          <Badge className="bg-green-600 text-white">
                            Resolved
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="weak-areas" className="space-y-6">
            <Card className="bg-gradient-to-br from-axonix-100/95 to-axonix-200/90 backdrop-blur-lg border border-axonix-400/50 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-axonix-200/80 to-axonix-300/70 rounded-t-lg border-b border-axonix-400/30">
                <CardTitle className="flex items-center gap-2 text-axonix-800">
                  <TrendingDown className="h-6 w-6 text-red-500" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-4">
                  {weakAreas.map((area, index) => (
                    <div 
                      key={index}
                      className={`p-4 rounded-lg border-2 ${getUrgencyColor(area.urgency)} hover:shadow-lg transition-all duration-300`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-axonix-800">{area.topic}</h3>
                          <p className="text-sm text-axonix-600">{area.domain}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            className={`${
                              area.urgency === 'high' ? 'bg-red-600' : 
                              area.urgency === 'medium' ? 'bg-yellow-600' : 'bg-green-600'
                            } text-white`}
                          >
                            {area.urgency} priority
                          </Badge>
                          <Button
                            size="sm"
                            onClick={() => router.push(`/practice?topic=${encodeURIComponent(area.topic)}`)}
                            className="bg-gradient-to-r from-axonix-600 to-axonix-700 hover:from-axonix-700 hover:to-axonix-800 text-white"
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Practice
                          </Button>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4 mb-3">
                        <div>
                          <p className="text-sm font-medium text-axonix-700">Mistakes Made</p>
                          <p className="text-lg font-bold text-red-600">{area.mistakeCount}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-axonix-700">Accuracy</p>
                          <p className="text-lg font-bold text-axonix-800">{area.accuracy}%</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-axonix-700">Last Practiced</p>
                          <p className="text-sm text-axonix-600">{area.lastPracticed.toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-axonix-600">Mastery Progress</span>
                          <span className="font-medium text-axonix-800">{area.accuracy}%</span>
                        </div>
                        <Progress value={area.accuracy} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
