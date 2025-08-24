import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, BookOpen, ArrowLeft, Play } from 'lucide-react';

interface SubtaskContent {
  id: string;
  title: string;
  description: string;
  type: 'practice' | 'concept' | 'quiz';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  content: {
    sections: Array<{
      type: 'text' | 'code' | 'exercise';
      title?: string;
      content: string;
      language?: string;
    }>;
  };
  exercises?: Array<{
    id: string;
    question: string;
    type: 'multiple-choice' | 'coding' | 'short-answer';
    options?: string[];
    correctAnswer?: any;
  }>;
}

const SubtaskPage = () => {
  const router = useRouter();
  const { id, module, submodule } = router.query;
  
  const [subtask, setSubtask] = useState<SubtaskContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (id) {
      loadSubtaskContent();
    }
  }, [id]);

  const loadSubtaskContent = () => {
    // Mock subtask content - in real app, this would come from API
    const mockSubtask: SubtaskContent = {
      id: id as string,
      title: 'Memory Layout Concepts',
      description: 'Learn how arrays are stored in memory and understand the relationship between indexing and memory addresses',
      type: 'concept',
      difficulty: 'intermediate',
      estimatedTime: '15 min',
      content: {
        sections: [
          {
            type: 'text',
            title: 'Understanding Array Memory Layout',
            content: `Arrays in C++ are stored in contiguous memory locations. This means that each element is placed right next to the previous one in memory.

When you declare an array like:
\`\`\`cpp
int arr[5] = {10, 20, 30, 40, 50};
\`\`\`

The memory layout looks like this:

| Index | Value | Memory Address |
|-------|-------|----------------|
| 0     | 10    | 0x1000         |
| 1     | 20    | 0x1004         |
| 2     | 30    | 0x1008         |
| 3     | 40    | 0x100C         |
| 4     | 50    | 0x1010         |

Notice how each integer takes 4 bytes (on most systems), so addresses increment by 4.`
          },
          {
            type: 'code',
            title: 'Memory Address Calculation',
            content: `#include <iostream>
using namespace std;

int main() {
    int arr[5] = {10, 20, 30, 40, 50};
    
    cout << "Array elements and their addresses:" << endl;
    for(int i = 0; i < 5; i++) {
        cout << "arr[" << i << "] = " << arr[i] 
             << " at address: " << &arr[i] << endl;
    }
    
    cout << "\\nAddress calculation:" << endl;
    cout << "Base address: " << arr << endl;
    cout << "Size of int: " << sizeof(int) << " bytes" << endl;
    
    return 0;
}`,
            language: 'cpp'
          },
          {
            type: 'exercise',
            title: 'Practice Exercise',
            content: 'Now try to calculate memory addresses manually!'
          }
        ]
      },
      exercises: [
        {
          id: 'ex1',
          question: 'If an integer array starts at memory address 0x2000, what would be the address of arr[3]?',
          type: 'multiple-choice',
          options: [
            '0x2003',
            '0x200C',
            '0x2012',
            '0x2030'
          ],
          correctAnswer: 1
        },
        {
          id: 'ex2',
          question: 'Write a C++ code snippet that prints the difference between addresses of arr[1] and arr[0].',
          type: 'coding',
          correctAnswer: 'cout << &arr[1] - &arr[0];'
        }
      ]
    };

    setSubtask(mockSubtask);
    setLoading(false);
  };

  const handleSectionComplete = () => {
    if (currentSection < subtask!.content.sections.length - 1) {
      setCurrentSection(prev => prev + 1);
    } else {
      setCompleted(true);
    }
  };

  const handleSubtaskComplete = () => {
    // Mark subtask as completed and return to roadmap
    router.push('/roadmap');
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'concept': return <BookOpen className="h-4 w-4" />;
      case 'practice': return <Play className="h-4 w-4" />;
      case 'quiz': return <CheckCircle2 className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading subtask...</p>
        </div>
      </div>
    );
  }

  if (!subtask) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Subtask Not Found</h3>
            <Button onClick={() => router.push('/roadmap')}>
              Back to Roadmap
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentSectionData = subtask.content.sections[currentSection];
  const progress = ((currentSection + 1) / subtask.content.sections.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/roadmap')}
                className="flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <div>
                <div className="flex items-center space-x-2">
                  {getTypeIcon(subtask.type)}
                  <h1 className="text-xl font-bold text-gray-900">{subtask.title}</h1>
                </div>
                <p className="text-sm text-gray-600 mt-1">{subtask.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge 
                variant="outline" 
                className={`${getDifficultyColor(subtask.difficulty)}`}
              >
                {subtask.difficulty}
              </Badge>
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-1" />
                {subtask.estimatedTime}
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{currentSection + 1} of {subtask.content.sections.length}</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!completed ? (
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{currentSectionData.title || `Section ${currentSection + 1}`}</span>
                <Badge variant="outline" className="text-xs">
                  {currentSectionData.type}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                {currentSectionData.type === 'text' && (
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {currentSectionData.content}
                  </div>
                )}
                
                {currentSectionData.type === 'code' && (
                  <div>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                      <code>{currentSectionData.content}</code>
                    </pre>
                    <p className="text-sm text-gray-600 mt-2">
                      Language: {currentSectionData.language?.toUpperCase()}
                    </p>
                  </div>
                )}
                
                {currentSectionData.type === 'exercise' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Practice Time!</h4>
                    <p className="text-blue-800">{currentSectionData.content}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center mt-8 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setCurrentSection(prev => Math.max(0, prev - 1))}
                  disabled={currentSection === 0}
                >
                  Previous
                </Button>

                <span className="text-sm text-gray-600">
                  {currentSection + 1} / {subtask.content.sections.length}
                </span>

                <Button onClick={handleSectionComplete}>
                  {currentSection === subtask.content.sections.length - 1 ? 'Complete' : 'Next'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white shadow-lg">
            <CardContent className="p-8 text-center">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Subtask Completed!
              </h2>
              <p className="text-gray-600 mb-6">
                Great job! You've completed "{subtask.title}". This knowledge will help you in your main module.
              </p>
              
              {subtask.exercises && subtask.exercises.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    Optional: Test Your Knowledge
                  </h3>
                  <p className="text-blue-800 text-sm mb-3">
                    Try these quick exercises to reinforce what you learned
                  </p>
                  <Button variant="outline" size="sm">
                    Take Mini Quiz
                  </Button>
                </div>
              )}

              <div className="flex justify-center space-x-4">
                <Button variant="outline" onClick={() => router.push('/roadmap')}>
                  Back to Roadmap
                </Button>
                <Button onClick={handleSubtaskComplete} className="bg-green-600 hover:bg-green-700">
                  Continue Learning
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SubtaskPage;
