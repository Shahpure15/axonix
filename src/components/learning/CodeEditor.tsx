import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  RotateCcw, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Loader2 
} from 'lucide-react';

interface CodeEditorProps {
  question: any;
  onSubmit: (code: string, language: string) => Promise<any>;
  isSubmitting: boolean;
  timeElapsed: number;
}

const SUPPORTED_LANGUAGES = [
  { value: 'cpp', label: 'C++', extension: '.cpp' },
  { value: 'python', label: 'Python', extension: '.py' },
  { value: 'java', label: 'Java', extension: '.java' },
  { value: 'javascript', label: 'JavaScript', extension: '.js' },
  { value: 'typescript', label: 'TypeScript', extension: '.ts' },
];

const DEFAULT_TEMPLATES = {
  cpp: `#include <iostream>
#include <vector>
#include <string>
using namespace std;

class Solution {
public:
    // Your solution here
    
};

int main() {
    Solution solution;
    // Test your solution
    return 0;
}`,
  python: `class Solution:
    def solve(self):
        # Your solution here
        pass

if __name__ == "__main__":
    solution = Solution()
    # Test your solution`,
  java: `public class Solution {
    public void solve() {
        // Your solution here
    }
    
    public static void main(String[] args) {
        Solution solution = new Solution();
        // Test your solution
    }
}`,
  javascript: `class Solution {
    solve() {
        // Your solution here
    }
}

// Test your solution
const solution = new Solution();`,
  typescript: `class Solution {
    solve(): void {
        // Your solution here
    }
}

// Test your solution
const solution = new Solution();`,
};

export default function CodeEditor({ question, onSubmit, isSubmitting, timeElapsed }: CodeEditorProps) {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('cpp');
  const [lastResult, setLastResult] = useState<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Set default template when language changes
    setCode(DEFAULT_TEMPLATES[language as keyof typeof DEFAULT_TEMPLATES] || '');
  }, [language]);

  const handleSubmit = async () => {
    if (!code.trim()) return;

    try {
      const result = await onSubmit(code, language);
      setLastResult(result);
    } catch (error) {
      setLastResult({
        verdict: 'error',
        error: error instanceof Error ? error.message : 'Submission failed',
      });
    }
  };

  const handleReset = () => {
    setCode(DEFAULT_TEMPLATES[language as keyof typeof DEFAULT_TEMPLATES] || '');
    setLastResult(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60000);
    const secs = Math.floor((seconds % 60000) / 1000);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'accepted': return 'text-green-600 bg-green-50 border-green-200';
      case 'wrong_answer': return 'text-red-600 bg-red-50 border-red-200';
      case 'time_limit_exceeded': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'runtime_error': return 'text-red-600 bg-red-50 border-red-200';
      case 'compilation_error': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case 'accepted': return <CheckCircle className="h-4 w-4" />;
      case 'wrong_answer': return <XCircle className="h-4 w-4" />;
      case 'time_limit_exceeded': return <Clock className="h-4 w-4" />;
      case 'runtime_error': return <AlertCircle className="h-4 w-4" />;
      case 'compilation_error': return <AlertCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <span>Code Editor</span>
          </CardTitle>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{formatTime(timeElapsed)}</span>
            </Badge>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Write your solution here..."
            className="min-h-[400px] font-mono text-sm"
            disabled={isSubmitting}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !code.trim()}
              className="flex items-center space-x-2"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              <span>{isSubmitting ? 'Running...' : 'Submit & Run'}</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={isSubmitting}
              className="flex items-center space-x-2"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset</span>
            </Button>
          </div>

          {question?.time_limit_seconds && (
            <Badge variant="secondary">
              Time Limit: {question.time_limit_seconds}s
            </Badge>
          )}
        </div>

        {/* Submission Result */}
        {lastResult && (
          <Alert className={getVerdictColor(lastResult.verdict)}>
            <div className="flex items-start space-x-2">
              {getVerdictIcon(lastResult.verdict)}
              <div className="flex-1">
                <AlertDescription>
                  <div className="font-medium capitalize mb-2">
                    {lastResult.verdict.replace('_', ' ')}
                  </div>
                  
                  {lastResult.score !== undefined && (
                    <div className="text-sm mb-2">
                      Score: {Math.round(lastResult.score * 100)}%
                    </div>
                  )}

                  {lastResult.executionTime && (
                    <div className="text-sm mb-2">
                      Execution Time: {lastResult.executionTime}ms
                    </div>
                  )}

                  {lastResult.feedback && (
                    <div className="text-sm mb-2">
                      {lastResult.feedback}
                    </div>
                  )}

                  {lastResult.error && (
                    <div className="text-sm mb-2 font-mono bg-black bg-opacity-10 p-2 rounded">
                      {lastResult.error}
                    </div>
                  )}

                  {lastResult.testResults && (
                    <div className="mt-3">
                      <div className="text-sm font-medium mb-2">Test Results:</div>
                      <div className="space-y-2">
                        {lastResult.testResults.map((test: any, index: number) => (
                          <div key={index} className="flex items-center space-x-2 text-sm">
                            {test.passed ? (
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            ) : (
                              <XCircle className="h-3 w-3 text-red-500" />
                            )}
                            <span>Test {index + 1}: {test.passed ? 'Passed' : 'Failed'}</span>
                            {!test.passed && test.errorMessage && (
                              <span className="text-red-600">({test.errorMessage})</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {lastResult.nextHintSuggestion && (
                    <div className="mt-3 p-2 bg-blue-50 rounded">
                      <div className="text-sm">
                        💡 Consider requesting hint level {lastResult.nextHintSuggestion} for guidance
                      </div>
                    </div>
                  )}
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}