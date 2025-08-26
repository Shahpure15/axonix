import { useState } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  const { login } = useAuthStore();
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [networkError, setNetworkError] = useState('');
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
    mode: 'onBlur',
  });

  // Prevent default form submission and use react-hook-form
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(onSubmit)(e);
  };

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setEmailError('');
    setPasswordError('');
    setNetworkError('');
    clearErrors();
    try {
      await login(data.email, data.password);
      // Only redirect after successful login
      router.push('/dashboard');
    } catch (err: any) {
      setValue('password', '', { shouldValidate: false });
      const msg = err.message?.toLowerCase() || '';
      if (msg.includes('user not found') || msg.includes('no user found') || msg.includes('email not found') || msg.includes('account not found')) {
        setEmailError('This email address is not registered. Please check your email or sign up for a new account.');
      } else if (msg.includes('invalid') || msg.includes('credentials') || msg.includes('password') || msg.includes('incorrect')) {
        setPasswordError('The password you entered is incorrect. Please try again.');
      } else if (msg.includes('network') || msg.includes('fetch')) {
        setNetworkError('Connection error. Please check your internet and try again.');
      } else {
        setNetworkError('Login failed. Please check your credentials and try again.');
      }
      setTimeout(() => {
        const passwordInput = document.getElementById('password');
        if (passwordInput) passwordInput.focus();
      }, 100);
    } finally {
      setIsSubmitting(false);
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

  // Clear field errors when user types
  const handleEmailChange = () => {
    if (emailError) setEmailError('');
    if (networkError) setNetworkError('');
  };
  const handlePasswordChange = () => {
    if (passwordError) setPasswordError('');
    if (networkError) setNetworkError('');
  };

  const isFormDisabled = isSubmitting;

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
                aria-invalid={!!(errors.email || emailError)}
                aria-describedby={errors.email ? 'email-error' : emailError ? 'email-field-error' : undefined}
                className={`transition-colors ${errors.email || emailError ? 'border-red-500 focus:border-red-500' : ''}`}
                {...register('email', {
                  onChange: handleEmailChange
                })}
              />
              {errors.email && (
                <p id="email-error" className="text-sm text-red-600 font-medium" role="alert">
                  {errors.email.message}
                </p>
              )}
              {emailError && (
                <p id="email-field-error" className="text-sm text-red-600 font-medium" role="alert">
                  {emailError}
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
                aria-invalid={!!(errors.password || passwordError)}
                aria-describedby={errors.password ? 'password-error' : passwordError ? 'password-field-error' : undefined}
                className={`transition-colors ${errors.password || passwordError ? 'border-red-500 focus:border-red-500' : ''}`}
                {...register('password', {
                  onChange: handlePasswordChange
                })}
              />
              {errors.password && (
                <p id="password-error" className="text-sm text-red-600 font-medium" role="alert">
                  {errors.password.message}
                </p>
              )}
              {passwordError && (
                <p id="password-field-error" className="text-sm text-red-600 font-medium" role="alert">
                  {passwordError}
                </p>
              )}
            </div>

            {/* Network/General Error Message */}
            {networkError && (
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
                  {networkError}
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