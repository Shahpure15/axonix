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
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [loginError, setLoginError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    clearErrors,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur', // Validate on blur for better UX
  });

  // Additional safeguard: wrapper to prevent any form default behavior
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🛡️ Form submission intercepted, calling react-hook-form handler');
    handleSubmit(onSubmit)(e);
  };

  const onSubmit = async (data: LoginFormData, event?: React.FormEvent) => {
    // Explicitly prevent any form submission default behavior
    if (event) {
      event.preventDefault();
    }
    
    console.log('🚀 Form submitted, preventing default behavior');
    setIsSubmitting(true);
    setLoginError('');
    clearErrors();

    try {
      console.log('🔄 Attempting login for:', data.email);
      
      // Call auth store login method
      await login(data.email, data.password);
      
      console.log('✅ Login successful, redirecting to dashboard...');
      
      // On successful login, redirect to dashboard
      router.push('/dashboard');
      
    } catch (err: any) {
      console.error('❌ Login failed:', err);
      console.log('📧 Preserving email field:', data.email);
      
      // Clear only the password field for security
      setValue('password', '', { shouldValidate: false });
      
      // Set specific error message based on the error type
      if (err.message?.toLowerCase().includes('invalid') || 
          err.message?.toLowerCase().includes('credentials') ||
          err.message?.toLowerCase().includes('password')) {
        setLoginError('Incorrect email or password');
      } else if (err.message?.toLowerCase().includes('user not found') ||
                 err.message?.toLowerCase().includes('email')) {
        setLoginError('No account found with this email address');
      } else if (err.message?.toLowerCase().includes('network') ||
                 err.message?.toLowerCase().includes('fetch')) {
        setLoginError('Connection error. Please check your internet and try again');
      } else {
        // Generic fallback error message
        setLoginError('Incorrect email or password');
      }
      
      console.log('🔴 Error set:', loginError || 'Incorrect email or password');
      
      // Focus back on password field for retry
      setTimeout(() => {
        const passwordInput = document.getElementById('password');
        if (passwordInput) {
          passwordInput.focus();
        }
      }, 100);
      
    } finally {
      setIsSubmitting(false);
      console.log('✅ Form submission completed');
    }
  };

  const handleGoogleLogin = () => {
    if (isSubmitting) return;
    window.location.href = '/api/auth/google';
  };

  const handleLinkedInLogin = () => {
    if (isSubmitting) return;
    window.location.href = '/api/auth/linkedin';
  };

  // Clear login error when user starts typing
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (loginError) {
      setLoginError('');
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (loginError) {
      setLoginError('');
    }
  };

  const isFormDisabled = isLoading || isSubmitting;

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
          <form onSubmit={handleFormSubmit} className="space-y-4" noValidate>
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                disabled={isFormDisabled}
                aria-invalid={!!(errors.email || loginError)}
                aria-describedby={errors.email ? 'email-error' : loginError ? 'login-error' : undefined}
                className={`transition-colors ${
                  errors.email || loginError ? 'border-red-500 focus:border-red-500' : ''
                }`}
                {...register('email', {
                  onChange: handleEmailChange
                })}
              />
              {errors.email && (
                <p id="email-error" className="text-sm text-red-600 font-medium" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                disabled={isFormDisabled}
                aria-invalid={!!(errors.password || loginError)}
                aria-describedby={errors.password ? 'password-error' : loginError ? 'login-error' : undefined}
                className={`transition-colors ${
                  errors.password || loginError ? 'border-red-500 focus:border-red-500' : ''
                }`}
                {...register('password', {
                  onChange: handlePasswordChange
                })}
              />
              {errors.password && (
                <p id="password-error" className="text-sm text-red-600 font-medium" role="alert">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Login Error Message */}
            {loginError && (
              <div 
                id="login-error" 
                className="p-3 bg-red-50 border border-red-200 rounded-md"
                role="alert"
                aria-live="polite"
              >
                <p className="text-sm text-red-600 font-medium flex items-center">
                  <svg 
                    className="mr-2 h-4 w-4 text-red-500" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                  {loginError}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full transition-all duration-200"
              disabled={isFormDisabled}
            >
              {isFormDisabled ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Social Login Divider */}
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

          {/* Social Login Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={handleGoogleLogin}
              disabled={isFormDisabled}
              className="transition-all duration-200"
            >
              <Icons.google className="mr-2 h-4 w-4" />
              Google
            </Button>
            <Button
              variant="outline"
              onClick={handleLinkedInLogin}
              disabled={isFormDisabled}
              className="transition-all duration-200"
            >
              <Icons.linkedin className="mr-2 h-4 w-4" />
              LinkedIn
            </Button>
          </div>

          {/* Footer Links */}
          <div className="text-center text-sm space-y-2">
            <div>
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link 
                href="/auth/signup" 
                className="text-primary hover:underline font-medium transition-colors"
              >
                Sign up
              </Link>
            </div>
            <div>
              <Link 
                href="/auth/forgot-password" 
                className="text-muted-foreground hover:underline transition-colors"
              >
                Forgot your password?
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}