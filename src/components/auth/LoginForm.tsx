import { useState } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Icons } from '@/components/ui/icons';
import { useAuthStore } from '@/lib/auth';
import Link from 'next/link';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [error, setError] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError('');
      await login(data.email, data.password);
      
      // Check if user needs onboarding after successful login
      const currentUserId = localStorage.getItem('currentUserId');
      if (currentUserId) {
        const response = await fetch(`/api/users?userId=${currentUserId}`);
        if (response.ok) {
          const userData = await response.json();
          
          // Redirect based on onboarding status
          if (!userData.user.onboardingCompleted) {
            console.log('User needs onboarding, redirecting...');
            router.push('/onboarding');
          } else {
            console.log('User onboarding complete, redirecting to dashboard...');
            router.push('/dashboard');
          }
          return;
        } else {
          // User data not found
          setError('User data not found. Please try logging in again.');
          localStorage.removeItem('currentUserId');
          return;
        }
      }
      
      // No user ID found
      setError('Session expired. Please log in again.');
      router.push('/auth/login');
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Handle specific error cases
      if (err.message?.includes('Invalid') || err.message?.includes('not found')) {
        setError('User not found. Please check your credentials or sign up.');
      } else if (err.message?.includes('password') || err.message?.includes('credentials')) {
        setError('Invalid credentials. Please check your email and password.');
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
    }
  };

  const handleGoogleLogin = () => {
    // Implement Google OAuth login
    window.location.href = '/api/auth/google';
  };

  const handleLinkedInLogin = () => {
    // Implement LinkedIn OAuth login  
    window.location.href = '/api/auth/linkedin';
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center">
            Sign in to continue your learning journey
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                {...register('email')}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
                className={errors.password ? 'border-red-500' : ''}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <Icons.google className="mr-2 h-4 w-4" />
              Google
            </Button>
            <Button
              variant="outline"
              onClick={handleLinkedInLogin}
              disabled={isLoading}
            >
              <Icons.linkedin className="mr-2 h-4 w-4" />
              LinkedIn
            </Button>
          </div>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link href="/auth/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>

          <div className="text-center text-sm">
            <Link href="/auth/forgot-password" className="text-muted-foreground hover:underline">
              Forgot your password?
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}