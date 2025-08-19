import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useHintLadder } from '@/hooks/useSession';
import { 
  Lightbulb, 
  AlertTriangle, 
  Database, 
  Code2, 
  TestTube,
  Lock,
  CheckCircle 
} from 'lucide-react';

const HINT_LEVELS = [
  {
    level: 1,
    name: 'Restate & Examples',
    description: 'Problem clarification with input/output examples',
    icon: Lightbulb,
    color: 'text-blue-500',
  },
  {
    level: 2,
    name: 'Edge Cases',
    description: 'Important constraints and edge cases to consider',
    icon: AlertTriangle,
    color: 'text-yellow-500',
  },
  {
    level: 3,
    name: 'Data Structure',
    description: 'Suggested data structures or patterns',
    icon: Database,
    color: 'text-green-500',
  },
  {
    level: 4,
    name: 'Pseudocode',
    description: 'High-level algorithm outline',
    icon: Code2,
    color: 'text-purple-500',
  },
  {
    level: 5,
    name: 'Unit Tests',
    description: 'Test cases to validate your solution',
    icon: TestTube,
    color: 'text-red-500',
  },
];

interface HintLadderProps {
  questionId: string;
  onHintRequested?: (level: number, content: string) => void;
}

export default function HintLadder({ questionId, onHintRequested }: HintLadderProps) {
  const {
    hintsUsed,
    requestHint,
    getAvailableHintLevel,
    canRequestHint,
    getHintStatus,
    totalHintsUsed,
  } = useHintLadder();

  const [requestingHint, setRequestingHint] = useState<number | null>(null);
  const [hintContents, setHintContents] = useState<Record<number, string>>({});

  const handleRequestHint = async (level: number) => {
    if (!canRequestHint(level)) return;

    setRequestingHint(level);
    try {
      const hintContent = await requestHint(level);
      setHintContents(prev => ({ ...prev, [level]: hintContent }));
      onHintRequested?.(level, hintContent);
    } catch (error) {
      console.error('Failed to request hint:', error);
    } finally {
      setRequestingHint(null);
    }
  };

  const getScorePenalty = () => {
    return totalHintsUsed * 10; // 10% penalty per hint used
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              <span>Hint Ladder</span>
            </CardTitle>
            <CardDescription>
              Get progressive hints to guide you to the solution
            </CardDescription>
          </div>
          <div className="text-right">
            <Badge variant={totalHintsUsed > 0 ? 'destructive' : 'secondary'}>
              {totalHintsUsed}/5 hints used
            </Badge>
            {totalHintsUsed > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                -{getScorePenalty()}% score penalty
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {totalHintsUsed === 0 && (
          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertDescription>
              <strong>Socratic Learning:</strong> Try to solve the problem yourself first. 
              Hints are available when you need guidance, but using them will reduce your score.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          {HINT_LEVELS.map((hintLevel) => {
            const status = getHintStatus(hintLevel.level);
            const isUsed = status === 'used';
            const isAvailable = status === 'available';
            const isLocked = status === 'locked';
            const isRequesting = requestingHint === hintLevel.level;

            return (
              <div key={hintLevel.level} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      isUsed ? 'bg-green-100' : 
                      isAvailable ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      {isUsed ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : isLocked ? (
                        <Lock className="h-4 w-4 text-gray-400" />
                      ) : (
                        <hintLevel.icon className={`h-4 w-4 ${hintLevel.color}`} />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">
                        Level {hintLevel.level}: {hintLevel.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {hintLevel.description}
                      </p>
                    </div>
                  </div>

                  {isAvailable && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRequestHint(hintLevel.level)}
                      disabled={isRequesting}
                    >
                      {isRequesting ? 'Loading...' : 'Get Hint'}
                    </Button>
                  )}

                  {isUsed && (
                    <Badge variant="secondary">Used</Badge>
                  )}

                  {isLocked && (
                    <Badge variant="outline">Locked</Badge>
                  )}
                </div>

                {/* Show hint content if used */}
                {isUsed && hintContents[hintLevel.level] && (
                  <div className="ml-12 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <div className="text-sm">
                      {hintContents[hintLevel.level]}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {totalHintsUsed > 0 && (
          <Alert className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Remember:</strong> The goal is to develop independent problem-solving skills. 
              Try to implement the solution based on the hints you've received.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}