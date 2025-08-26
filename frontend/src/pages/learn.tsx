import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/lib/auth';
import { useSession } from '@/hooks/useSession';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import LearningSession from '@/components/learning/LearningSession';
import WorqhatWorkflow from '@/components/learning/WorqhatWorkflow';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Target, 
  Clock, 
  TrendingUp,
  Play,
  BookOpen,
  Map,
  Zap
} from 'lucide-react';

const SESSION_MODES = [
  {
    value: 'diagnostic',
    label: 'Diagnostic Assessment',
    description: 'Evaluate your current knowledge level',
    icon: TrendingUp,
    duration: '15-20 minutes',
    color: 'text-blue-500',
  },
  {
    value: 'learning',
    label: 'Learning Session',
    description: 'Learn new concepts with practice',
    icon: Brain,
    duration: '30-45 minutes',
    color: 'text-green-500',
  },
  {
    value: 'practice',
    label: 'Practice Session',
    description: 'Reinforce skills with coding problems',
    icon: Target,
    duration: '20-30 minutes',
    color: 'text-purple-500',
  },
  {
    value: 'review',
    label: 'Review Session',
    description: 'Review concepts using spaced repetition',
    icon: Clock,
    duration: '10-15 minutes',
    color: 'text-orange-500',
  },
];

const DOMAINS = [
  { value: 'cpp', label: 'C++ & Data Structures' },
  { value: 'system-design', label: 'System Design' },
  { value: 'cybersecurity', label: 'Cybersecurity' },
  { value: 'devops', label: 'DevOps' },
  { value: 'web-dev', label: 'Web Development' },
  { value: 'mobile-dev', label: 'Mobile Development' },
];

export default function LearnPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { currentSession, startSession, isActive } = useSession();
  const [selectedMode, setSelectedMode] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('');
  const [userDomains, setUserDomains] = useState<string[]>([]);
  const [isStarting, setIsStarting] = useState(false);
  const [showWorkflow, setShowWorkflow] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    // Load user's selected domains from onboarding data
    const loadUserDomains = async () => {
      const currentUserId = localStorage.getItem('currentUserId');
      if (!currentUserId) return;

      try {
        const onboardingResponse = await fetch(`/api/onboarding?userId=${currentUserId}`);
        if (onboardingResponse.ok) {
          const onboardingResult = await onboardingResponse.json();
          const selectedDomains = onboardingResult.data.domains || [];
          setUserDomains(selectedDomains);
          console.log('🎯 User selected domains for learning:', selectedDomains);
          
          // Set default domain if none selected
          if (!selectedDomain && selectedDomains.length > 0) {
            setSelectedDomain(selectedDomains[0]);
          }
        }
      } catch (error) {
        console.log('⚠️ Could not load user domains:', error);
        // Fallback to all domains if can't load user data
        setUserDomains(['cpp', 'system-design', 'cybersecurity', 'devops', 'web-dev', 'mobile-dev']);
      }
    };

    loadUserDomains();

    // Get mode and domain from query params
    const { mode, domain } = router.query;
    if (mode && typeof mode === 'string') {
      setSelectedMode(mode);
    }
    if (domain && typeof domain === 'string') {
      setSelectedDomain(domain);
    }

    // Set default domain from user preferences (keeping existing logic as fallback)
    if (!selectedDomain && user?.preferences?.domains?.length > 0) {
      setSelectedDomain(user.preferences.domains[0]);
    }
  }, [router.query, user, isAuthenticated, selectedDomain]);

  const handleStartSession = async () => {
    if (!selectedMode || !selectedDomain) return;

    setIsStarting(true);
    try {
      console.log('🚀 Starting WorqHat workflow session');
      setShowWorkflow(true);
    } catch (error) {
      console.error('Failed to start session:', error);
    } finally {
      setIsStarting(false);
    }
  };

  const handleWorkflowComplete = async (results: any) => {
    console.log('📊 Workflow completed with results:', results);
    
    try {
      // Start the traditional session
      await startSession(selectedDomain, selectedMode);
      
      // Store workflow results for the session
      sessionStorage.setItem('workflowResults', JSON.stringify(results));
      
      setShowWorkflow(false);
      
      // Navigate to learning session
      router.push('/session');
    } catch (error) {
      console.error('Failed to start session after workflow:', error);
      // Fallback to results page or dashboard
      router.push('/dashboard');
    }
  };

  const handleWorkflowCancel = () => {
    setShowWorkflow(false);
    setIsStarting(false);
  };

  // If there's an active session, show the session interface
  if (isActive && currentSession) {
    return (
      <DashboardLayout>
        <LearningSession sessionId={currentSession.session_id} />
      </DashboardLayout>
    );
  }

  // If workflow is active, show the WorqHat workflow
  if (showWorkflow && user && selectedMode && selectedDomain) {
    return (
      <DashboardLayout>
        <WorqhatWorkflow
          userId={user.user_id}
          learningMode={selectedMode as 'diagnostic' | 'learning' | 'practice' | 'review'}
          domain={selectedDomain}
          userLevel={user.preferences?.experience_level || 'intermediate'}
          onComplete={handleWorkflowComplete}
          onCancel={handleWorkflowCancel}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
  <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold flex items-center space-x-2">
            <Brain className="h-8 w-8 text-socratic-wingman-700" />
            <span className="text-socratic-wingman-800">AI-Powered Learning</span>
            <Badge className="bg-gradient-to-r from-socratic-wingman-600 to-socratic-wingman-700 text-white border-0">
              WorqHat
            </Badge>
          </h1>
          <p className="text-socratic-wingman-600">
            Choose your learning mode and domain to begin your adaptive learning journey
          </p>
        </div>

        {/* Session Mode Selection */}
        <Card className="bg-gradient-to-br from-axonix-100/95 to-axonix-200/90 backdrop-blur-lg border border-axonix-400/50 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-axonix-200/80 to-axonix-300/70 rounded-t-lg border-b border-axonix-400/30">
            <CardTitle className="text-axonix-800">Choose Learning Mode</CardTitle>
            <CardDescription className="text-axonix-600">
              Select the type of learning session you want to start
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SESSION_MODES.map((mode) => (
                <div
                  key={mode.value}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                    selectedMode === mode.value
                      ? 'border-axonix-600 bg-axonix-200/50 shadow-lg shadow-axonix-600/20 scale-[1.02]'
                      : 'border-axonix-300/50 hover:border-axonix-400/50 hover:bg-axonix-100/30 hover:scale-[1.01]'
                  }`}
                  onClick={() => setSelectedMode(mode.value)}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full bg-axonix-200/60 ${mode.color}`}>
                      <mode.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-axonix-800">{mode.label}</h3>
                      <p className="text-sm text-axonix-600 mb-2">
                        {mode.description}
                      </p>
                      <Badge variant="secondary" className="text-xs bg-axonix-300/80 text-axonix-800 border border-axonix-500/50">
                        {mode.duration}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Domain Selection */}
        <Card className="bg-gradient-to-br from-axonix-100/95 to-axonix-200/90 backdrop-blur-lg border border-axonix-400/50 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-axonix-200/80 to-axonix-300/70 rounded-t-lg border-b border-axonix-400/30">
            <CardTitle className="text-axonix-800">Choose Domain</CardTitle>
            <CardDescription className="text-axonix-600">
              Select the subject area you want to focus on
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <Select value={selectedDomain} onValueChange={setSelectedDomain}>
              <SelectTrigger className="w-full border-axonix-400/50 focus:border-axonix-600 bg-white/80">
                <SelectValue placeholder="Select a domain" />
              </SelectTrigger>
              <SelectContent>
                {DOMAINS.filter(domain => userDomains.includes(domain.value)).map((domain) => (
                  <SelectItem key={domain.value} value={domain.value}>
                    {domain.label}
                  </SelectItem>
                ))}
                {/* Show message if no domains are available */}
                {userDomains.length === 0 && (
                  <div className="p-2 text-sm text-axonix-600 text-center">
                    Complete onboarding to see your domains
                  </div>
                )}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Session Preview */}
        {selectedMode && selectedDomain && (
          <Card className="bg-gradient-to-br from-axonix-100/95 to-axonix-200/90 backdrop-blur-lg border border-axonix-400/50 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-axonix-200/80 to-axonix-300/70 rounded-t-lg border-b border-axonix-400/30">
              <CardTitle className="flex items-center space-x-2 text-axonix-800">
                <BookOpen className="h-5 w-5" />
                <span>Session Preview</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-axonix-600">Mode:</span>
                  <Badge className="bg-gradient-to-r from-axonix-600 to-axonix-700 text-white border-0">
                    {SESSION_MODES.find(m => m.value === selectedMode)?.label}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-axonix-600">Domain:</span>
                  <Badge variant="outline" className="border-axonix-400/50 text-axonix-700">
                    {DOMAINS.filter(d => userDomains.includes(d.value)).find(d => d.value === selectedDomain)?.label || selectedDomain}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-axonix-600">Duration:</span>
                  <span className="text-sm text-axonix-700">
                    {SESSION_MODES.find(m => m.value === selectedMode)?.duration}
                  </span>
                </div>

                <div className="pt-4 border-t">
                  <Button
                    onClick={handleStartSession}
                    disabled={isStarting}
                    className="w-full bg-gradient-to-r from-axonix-700 to-axonix-800 hover:from-axonix-800 hover:to-axonix-900 text-white shadow-lg"
                    size="lg"
                  >
                    {isStarting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating Workflow...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-4 w-4" />
                        Start AI-Powered Session
                        <Badge variant="secondary" className="ml-2 bg-white/20 text-white border-0">
                          WorqHat
                        </Badge>
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-axonix-600 text-center mt-2">
                    Personalized by WorqHat AI • Adaptive Learning Experience
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Selection State */}
        {(!selectedMode || !selectedDomain) && (
          <Card className="bg-gradient-to-br from-axonix-100/95 to-axonix-200/90 backdrop-blur-lg border border-axonix-400/50 shadow-xl">
            <CardContent className="text-center py-12">
              <Brain className="h-16 w-16 mx-auto mb-4 text-axonix-400 opacity-50" />
              <h3 className="text-lg font-medium mb-2 text-axonix-800">Ready to Learn?</h3>
              <p className="text-axonix-600 mb-6">
                Select a learning mode and domain above to get started
              </p>
              <div className="flex justify-center">
                <Button variant="outline" onClick={() => router.push('/roadmap')} className="border-axonix-400/50 text-axonix-700 hover:bg-axonix-100/30">
                  <Map className="mr-2 h-4 w-4" />
                  View Learning Roadmap
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}