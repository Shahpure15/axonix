import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/lib/auth';
import { analyticsApi, srsApi } from '@/lib/api';
import { userStorage, getDomainById, UserData } from '@/lib/userData';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Clock, 
  TrendingUp, 
  Calendar,
  Flame,
  BookOpen,
  Award,
  AlertCircle,
  Play,
  Map,
  Heart,
  ShoppingBag,
  User,
  Target
} from 'lucide-react';
import Link from 'next/link';

// Dynamically import heavy components
const DashboardLayout = dynamic(() => import('@/components/dashboard/DashboardLayout'), {
  loading: () => <div className="animate-pulse bg-gray-200 h-screen w-full" />,
});

// Loading component for dashboard content
function DashboardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-lg will-change-transform" />
        ))}
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {[1, 2].map((i) => (
          <div key={i} className="h-64 bg-gray-200 rounded-lg will-change-transform" />
        ))}
      </div>
    </div>
  );
}

interface DashboardStats {
  streakDays: number;
  totalHoursLearned: number;
  masteryProgress: { topic: string; score: number; }[];
  dueItems: number;
  recentSessions: any[];
  weeklyGoal: { current: number; target: number; };
}

export default function Dashboard() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [pendingTests, setPendingTests] = useState<string[]>([]);
  const [completedTests, setCompletedTests] = useState<string[]>([]);
  const [userDomains, setUserDomains] = useState<string[]>([]);
  const [allTestsCompleted, setAllTestsCompleted] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // All useEffect hooks go here first, before any early returns
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated]);

  // Show loading while auth is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render dashboard content if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const loadDashboardData = async () => {
    try {
      console.log('Loading dashboard data...');
      
      // Get current user from auth store
      if (!user || !user.user_id) {
        console.log('No user found in auth store, redirecting to login');
        router.push('/auth/login');
        return;
      }

      const currentUserId = user.user_id;

      // Load user data from our API
      try {
        const userData = await userStorage.getCurrentUser();
        if (!userData) {
          console.log('User data not found, using auth store data');
          // Create basic user data from auth store if file doesn't exist yet
          setCurrentUser({
            id: user.user_id,
            email: user.email,
            password: '', // We don't store passwords in frontend
            name: user.name,
            onboardingCompleted: false,
            onboarding_status: 'not_started',
            createdAt: (user.created_at || new Date()).toISOString(),
            lastLogin: new Date().toISOString()
          });
        } else {
          console.log('Current user data from API:', userData);
          setCurrentUser(userData);
        }
      } catch (userError) {
        console.error('Error loading user data:', userError);
        console.log('User not found, redirecting to login');
        router.push('/auth/login');
        return;
      }

      // Check onboarding status from separate file
      try {
        const onboardingResponse = await fetch(`/api/onboarding?userId=${currentUserId}`);
        if (onboardingResponse.ok) {
          const onboardingResult = await onboardingResponse.json();
          console.log('Onboarding data found:', onboardingResult.data);
          
          // Store user's selected domains
          const selectedDomains = onboardingResult.data.domains || [];
          setUserDomains(selectedDomains);
          console.log('User selected domains:', selectedDomains);
          
          // Get diagnostic test data
          const diagnosticResponse = await fetch(`/api/diagnostic?userId=${currentUserId}`);
          if (diagnosticResponse.ok) {
            const diagnosticResult = await diagnosticResponse.json();
            console.log('Diagnostic test data:', diagnosticResult.data);
            
            // Get pending and completed tests
            const pendingTestIds = diagnosticResult.data
              .filter((test: any) => !test.completed)
              .map((test: any) => test.domainId);
            
            const completedTestIds = diagnosticResult.data
              .filter((test: any) => test.completed)
              .map((test: any) => test.domainId);
            
            console.log('⏳ Pending diagnostic tests:', pendingTestIds);
            console.log('✅ Completed diagnostic tests:', completedTestIds);
            
            setPendingTests(pendingTestIds);
            setCompletedTests(completedTestIds);
            
            // Check if all tests are completed
            const allCompleted = pendingTestIds.length === 0 && selectedDomains.length > 0;
            setAllTestsCompleted(allCompleted);
            console.log('🎉 All tests completed?', allCompleted);
          }
        } else {
          console.log('❌ No onboarding data found');
          setPendingTests([]);
          setCompletedTests([]);
          setUserDomains([]);
          setAllTestsCompleted(false);
        }
      } catch (error) {
        console.log('⚠️ Could not load onboarding/diagnostic data:', error);
        setPendingTests([]);
        setCompletedTests([]);
        setUserDomains([]);
        setAllTestsCompleted(false);
      }

      const [progress, dueItems] = await Promise.all([
        analyticsApi.getProgress(),
        srsApi.getDueItems(),
      ]);

      setStats({
        streakDays: progress.streakDays || 0,
        totalHoursLearned: progress.totalHoursLearned || 0,
        masteryProgress: progress.masteryVectors || [],
        dueItems: dueItems?.length || 0,
        recentSessions: progress.recentSessions || [],
        weeklyGoal: progress.weeklyGoal || { current: 0, target: 5 },
      });
      
      console.log('Dashboard data loaded successfully');
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleStartLearning = async () => {
    console.log('🚀 handleStartLearning clicked');
    
    // Check if user has completed onboarding
    if (!currentUser) {
      console.log('❌ No current user found - redirecting to login');
      router.push('/auth/login');
      return;
    }

    const currentUserId = localStorage.getItem('currentUserId');
    if (!currentUserId) {
      console.log('❌ No user ID found - redirecting to login');
      router.push('/auth/login');
      return;
    }

    // Check onboarding status from separate file
    try {
      const onboardingResponse = await fetch(`/api/onboarding?userId=${currentUserId}`);
      
      if (!onboardingResponse.ok) {
        console.log('❌ Onboarding not completed - redirecting to onboarding');
        router.push('/onboarding');
        return;
      }

      const onboardingResult = await onboardingResponse.json();
      console.log('✅ Onboarding completed:', onboardingResult.data);

      // Check diagnostic tests
      console.log('📊 Pending tests:', pendingTests);

      if (pendingTests.length > 0) {
        // If there are pending tests, redirect to the first one
        const firstDomain = pendingTests[0];
        console.log(`🎯 Starting diagnostic test for domain: ${firstDomain}`);
        router.push(`/diagnostic-test?domain=${firstDomain}`);
      } else {
        // No pending tests, go to normal learning session
        console.log('🎓 No pending tests, redirecting to /learn');
        router.push('/learn');
      }
    } catch (error) {
      console.error('Failed to check onboarding status:', error);
      console.log('❌ Error checking onboarding - redirecting to onboarding');
      router.push('/onboarding');
    }
  };

  // Show loading state
  if (isLoading || !isAuthenticated) {
    return (
      <DashboardLayout>
        <DashboardSkeleton />
      </DashboardLayout>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 min-h-screen will-change-auto">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 will-change-transform">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name || 'Learner'}! 👋
          </h2>
          <p className="text-gray-600">
            Ready to continue your learning journey? Let's see what's waiting for you today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Learning Streak</CardTitle>
              <Flame className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.streakDays || 0}</div>
              <p className="text-xs text-muted-foreground">
                days in a row
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Due Reviews</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.dueItems || 0}</div>
              <p className="text-xs text-muted-foreground">
                items to review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hours Learned</CardTitle>
              <BookOpen className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(stats?.totalHoursLearned || 0)}</div>
              <p className="text-xs text-muted-foreground">
                total hours
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weekly Goal</CardTitle>
              <Target className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.weeklyGoal.current || 0}/{stats?.weeklyGoal.target || 5}
              </div>
              <Progress 
                value={(stats?.weeklyGoal.current || 0) / (stats?.weeklyGoal.target || 5) * 100} 
                className="h-2 mt-2"
              />
            </CardContent>
          </Card>
        </div>

        {/* Pending Diagnostic Tests - Only show if there are pending tests */}
        {currentUser && !allTestsCompleted && pendingTests.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                <CardTitle>Diagnostic Tests</CardTitle>
              </div>
              <CardDescription>
                {pendingTests.length > 0 
                  ? "Complete these diagnostic tests to unlock your personalized learning paths"
                  : "Great! You've completed all diagnostic tests. Your learning paths are ready."
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingTests.length > 0 ? (
                <div className="grid gap-3">
                  {pendingTests.map((domainId) => {
                    const domain = getDomainById(domainId);
                    if (!domain) return null;
                    
                    return (
                      <div 
                        key={domainId} 
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <Brain className="h-8 w-8 text-blue-500" />
                          <div>
                            <h3 className="font-medium">{domain.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {domain.description}
                            </p>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          className="bg-blue-600 hover:bg-blue-700"
                          onClick={() => router.push(`/diagnostic-test?domain=${domainId}`)}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Start Test
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Brain className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">All Tests Completed!</h3>
                  <p className="text-gray-600 mb-4">
                    You've completed all diagnostic tests for your selected domains.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button onClick={() => router.push('/roadmap')}>
                      <Map className="mr-2 h-4 w-4" />
                      View Roadmap
                    </Button>
                    <Button variant="outline" onClick={() => router.push('/learn')}>
                      Start Learning
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Show message if user hasn't completed onboarding */}
        {currentUser && !currentUser.onboardingCompleted && (
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                <CardTitle>Complete Your Setup</CardTitle>
              </div>
              <CardDescription>
                Finish your onboarding to unlock personalized learning paths
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Almost There!</h3>
                <p className="text-gray-600 mb-4">
                  Complete your learning preferences to get started with diagnostic tests.
                </p>
                <Button onClick={() => router.push('/onboarding')}>
                  Continue Setup
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Jump into your learning activities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full justify-start" 
                size="lg"
                onClick={(e) => {
                  e.preventDefault();
                  console.log('Start Learning button clicked!');
                  handleStartLearning();
                }}
              >
                <Brain className="mr-2 h-5 w-5" />
                Start Learning Session
              </Button>

              <Button asChild variant="outline" className="w-full justify-start" size="lg">
                <Link href="/roadmap">
                  <Map className="mr-2 h-5 w-5" />
                  View Learning Roadmap
                </Link>
              </Button>
              
              {stats?.dueItems > 0 && (
                <Button asChild variant="outline" className="w-full justify-start" size="lg">
                  <Link href="/review">
                    <Clock className="mr-2 h-5 w-5" />
                    Review Due Items ({stats.dueItems})
                  </Link>
                </Button>
              )}

              <Button asChild variant="outline" className="w-full justify-start" size="lg">
                <Link href="/pet-house">
                  <Heart className="mr-2 h-5 w-5" />
                  Pet House
                </Link>
              </Button>

              <Button asChild variant="outline" className="w-full justify-start" size="lg">
                <Link href="/marketplace">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Marketplace
                </Link>
              </Button>

              <Button asChild variant="outline" className="w-full justify-start" size="lg">
                <Link href="/library">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Course Library
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Comprehensive Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Domain Progress</CardTitle>
              <CardDescription>
                Your mastery in selected learning domains
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {userDomains.length > 0 ? (
                userDomains.map((domainId) => {
                  const domain = getDomainById(domainId);
                  if (!domain) return null;
                  
                  // Mock progress data - in real app, this would come from API
                  const mockProgress = {
                    completed: Math.floor(Math.random() * 80) + 10,
                    total: 100,
                    streak: Math.floor(Math.random() * 15) + 1,
                    lastSession: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
                  };
                  
                  const progressPercentage = (mockProgress.completed / mockProgress.total) * 100;
                  
                  return (
                    <div key={domainId} className="space-y-3 p-4 bg-gradient-to-r from-axonix-50 to-axonix-100 rounded-lg border border-axonix-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-axonix-600 to-axonix-800 rounded-lg flex items-center justify-center">
                            <Brain className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-axonix-800">{domain.name}</h4>
                            <p className="text-sm text-axonix-600">
                              {mockProgress.completed}/{mockProgress.total} concepts
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            <Flame className="h-4 w-4 text-orange-500" />
                            <span className="text-sm font-medium text-axonix-700">{mockProgress.streak} day streak</span>
                          </div>
                          <p className="text-xs text-axonix-600">
                            Last: {mockProgress.lastSession.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-axonix-600">Progress</span>
                          <span className="font-medium text-axonix-800">{Math.round(progressPercentage)}%</span>
                        </div>
                        <Progress value={progressPercentage} className="h-3 bg-axonix-200" />
                      </div>
                      
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs border-axonix-300 text-axonix-700">
                          Level {Math.floor(progressPercentage / 20) + 1}
                        </Badge>
                        {progressPercentage > 80 && (
                          <Badge className="text-xs bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                            Nearly Mastered
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Complete your first diagnostic to see domain progress</p>
                  <Button asChild className="mt-4">
                    <Link href="/learn?mode=diagnostic">
                      Start Diagnostic
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest learning sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.recentSessions.length > 0 ? (
              <div className="space-y-4">
                {stats.recentSessions.slice(0, 5).map((session, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium capitalize">{session.session_type} Session</p>
                      <p className="text-sm text-muted-foreground">
                        {session.domain} • {new Date(session.started_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={session.completion_score > 0.8 ? 'default' : 'secondary'}>
                        {Math.round(session.completion_score * 100)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent activity yet</p>
                <p className="text-sm">Start your first learning session to see your progress here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}