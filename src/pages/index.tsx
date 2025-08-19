import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, BookOpen, Target, Users, Brain } from 'lucide-react';
import Link from 'next/link';
import { getAxonixGradient, axonixColors } from '@/lib/brand-colors';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Redirect authenticated users to dashboard
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return null; // Redirecting...
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-axonix-100 via-axonix-200 to-axonix-300">
      {/* Navigation */}
      <nav className="bg-gradient-to-r from-axonix-100/95 via-axonix-200/90 to-axonix-300/85 backdrop-blur-lg border-b border-axonix-400/30 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Zap className="h-8 w-8 text-axonix-700" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-axonix-600 rounded-full animate-pulse"></div>
              </div>
              <span className="text-xl font-bold text-axonix-800">
                Axonix
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="ghost" className="text-axonix-800 hover:bg-axonix-300/70 border border-transparent hover:border-axonix-500/50">Login</Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-gradient-to-r from-axonix-700 to-axonix-800 hover:from-axonix-800 hover:to-axonix-900 text-white shadow-lg shadow-axonix-700/30 border border-axonix-800/50">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center relative">
          {/* Floating elements for gamified feel */}
          <div className="absolute top-10 left-1/4 w-6 h-6 bg-purple-400/30 rounded-full animate-bounce delay-75"></div>
          <div className="absolute top-20 right-1/3 w-4 h-4 bg-purple-500/40 rounded-full animate-bounce delay-150"></div>
          <div className="absolute bottom-10 left-1/3 w-8 h-8 bg-purple-300/20 rounded-full animate-bounce delay-300"></div>
          
          <h1 className="text-5xl font-bold mb-6 relative z-10">
            <span className="bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 bg-clip-text text-transparent">
              Level Up Your Skills with
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-800 via-purple-600 to-purple-500 bg-clip-text text-transparent">
              AI-Powered Learning
            </span>
          </h1>
          <p className="text-xl text-purple-700 mb-8 max-w-3xl mx-auto relative z-10">
            Transform your learning journey with AI-powered adaptive tutoring that evolves with your progress.
            Experience gamified learning like never before.
          </p>
          <div className="flex justify-center space-x-4 relative z-10">
            <Link href="/auth/signup">
              <Button size="lg" className="px-8 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-xl">
                Start Your Journey
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" size="lg" className="px-8 py-3 border-purple-300 text-purple-700 hover:bg-purple-50">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <Card className="bg-white/80 backdrop-blur-md border-purple-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-500 rounded-lg flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-purple-800">AI-Powered Learning</CardTitle>
              <CardDescription className="text-purple-600">
                Experience adaptive tutoring that evolves with your learning style and pace.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/80 backdrop-blur-md border-purple-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-purple-800">Gamified Progress</CardTitle>
              <CardDescription className="text-purple-600">
                Level up your skills with achievement systems, progress tracking, and rewards.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/80 backdrop-blur-md border-purple-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-purple-800">Smart Analytics</CardTitle>
              <CardDescription className="text-purple-600">
                Get personalized insights and recommendations based on your learning patterns.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">Built for Developer Growth</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-4xl font-bold text-blue-600">5-Level</div>
              <div className="text-gray-600">Hint System</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-indigo-600">10+</div>
              <div className="text-gray-600">Programming Domains</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600">SM-2</div>
              <div className="text-gray-600">Algorithm</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600">Real-time</div>
              <div className="text-gray-600">Code Execution</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-md border-t border-purple-200/30 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Zap className="h-6 w-6 text-purple-600" />
              <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                Axonix
              </span>
            </div>
            <p className="text-purple-600">&copy; 2025 Axonix. Empowering learners through intelligent, gamified education.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
