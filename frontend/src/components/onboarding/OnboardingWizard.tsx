import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/lib/auth';

// Domain definitions - moved here to avoid dependency on userStorage
const DOMAINS = [
  { id: 'javascript', name: 'JavaScript', description: 'Modern ES6+, async/await, frameworks' },
  { id: 'python', name: 'Python', description: 'Data structures, algorithms, web frameworks' },
  { id: 'react', name: 'React', description: 'Components, hooks, state management' },
  { id: 'nodejs', name: 'Node.js', description: 'Backend development, APIs, databases' },
  { id: 'algorithms', name: 'Algorithms', description: 'Problem solving, data structures' },
  { id: 'databases', name: 'Databases', description: 'SQL, NoSQL, database design' },
  { id: 'webdev', name: 'Web Development', description: 'HTML, CSS, responsive design' },
  { id: 'devops', name: 'DevOps', description: 'CI/CD, containerization, cloud platforms' },
];

const onboardingSchema = z.object({
  domains: z.array(z.string()).min(1, 'Please select at least one domain'),
  experience_level: z.enum(['beginner', 'intermediate', 'advanced']),
  preferred_study_time: z.string(),
  timezone: z.string(),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

const EXPERIENCE_LEVELS = [
  { value: 'beginner', label: 'Beginner', description: '0-2 years of programming experience' },
  { value: 'intermediate', label: 'Intermediate', description: '2-5 years, comfortable with basic concepts' },
  { value: 'advanced', label: 'Advanced', description: '5+ years, looking to deepen expertise' },
];

const STUDY_TIMES = [
  { value: '06:00', label: '6:00 AM - Early morning' },
  { value: '09:00', label: '9:00 AM - Morning' },
  { value: '12:00', label: '12:00 PM - Lunch break' },
  { value: '18:00', label: '6:00 PM - After work' },
  { value: '21:00', label: '9:00 PM - Evening' },
  { value: '23:00', label: '11:00 PM - Late night' },
];

export default function OnboardingWizard() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, tokens, refreshAuth } = useAuthStore();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [selectedExperienceLevel, setSelectedExperienceLevel] = useState<string>('');
  const [selectedStudyTime, setSelectedStudyTime] = useState<string>('');
  const [selectedTimezone, setSelectedTimezone] = useState<string>(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );

  // Debug auth state
  useEffect(() => {
    console.log('🔍 Onboarding - Auth State:', { 
      isLoading, 
      isAuthenticated, 
      hasUser: !!user, 
      userId: user?.user_id,
      userEmail: user?.email,
      hasToken: !!tokens?.access_token
    });
  }, [isLoading, isAuthenticated, user, tokens]);

  // Handle auth state and redirects
  useEffect(() => {
    // If still loading, don't do anything
    if (isLoading) return;

    // If not authenticated, check if we have a token and try to refresh
    if (!isAuthenticated) {
      const storedToken = localStorage.getItem('access_token');
      if (storedToken) {
        console.log('🔄 Token found but not authenticated, refreshing auth...');
        refreshAuth();
      } else {
        console.log('❌ No token found, redirecting to signup');
        router.push('/auth/signup');
      }
    }
  }, [isLoading, isAuthenticated, refreshAuth, router]);

  // Show loading while auth state is loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated || !user) {
    return null;
  }

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      domains: [],
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  });

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const onSubmit = async (data: OnboardingFormData) => {
    // Basic validation check
    if (selectedDomains.length === 0) {
      console.error('Validation failed: No domains selected');
      return;
    }
    if (!selectedExperienceLevel) {
      console.error('Validation failed: No experience level selected');
      return;
    }
    if (!selectedStudyTime) {
      console.error('Validation failed: No study time selected');
      return;
    }
    if (!selectedTimezone) {
      console.error('Validation failed: No timezone selected');
      return;
    }

    setIsSubmitting(true);
    try {
      // Ensure we have user data and token
      if (!user?.user_id || !tokens?.access_token) {
        throw new Error('No user session found. Please sign up first.');
      }

      console.log('💾 Saving onboarding data to backend...', { 
        userId: user.user_id,
        userEmail: user.email,
        domains: selectedDomains.length,
        experience_level: selectedExperienceLevel,
        preferred_study_time: selectedStudyTime,
        timezone: selectedTimezone
      });

      // Send onboarding data to backend
      const response = await fetch('http://localhost:5000/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokens.access_token}`,
        },
        body: JSON.stringify({
          userId: user.user_id,
          domains: selectedDomains,
          experience_level: selectedExperienceLevel,
          preferred_study_time: selectedStudyTime,
          timezone: selectedTimezone,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to save onboarding data');
      }

      if (!result.success) {
        throw new Error(result.message || 'Failed to save onboarding data');
      }

      console.log('✅ Onboarding data saved successfully:', result);

      // Initialize learning progress
      try {
        const progressResponse = await fetch('http://localhost:5000/api/progress/initialize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokens.access_token}`,
          },
          body: JSON.stringify({
            domains: selectedDomains,
            experienceLevel: selectedExperienceLevel,
          }),
        });

        const progressResult = await progressResponse.json();
        if (progressResult.success) {
          console.log('✅ Learning progress initialized:', progressResult);
        }
      } catch (progressError) {
        console.error('❌ Failed to initialize learning progress:', progressError);
        // Don't block the flow if this fails
      }

      // Show success animation
      setIsSuccess(true);
      
      // Redirect to dashboard after showing success
      setTimeout(() => {
        console.log('🎯 Redirecting to dashboard...');
        router.push('/dashboard');
      }, 2000);
      
    } catch (error) {
      console.error('❌ Failed to save onboarding data:', error);
      alert(`Failed to save onboarding data: ${(error as Error).message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDomainToggle = (domainId: string) => {
    const newDomains = selectedDomains.includes(domainId)
      ? selectedDomains.filter(id => id !== domainId)
      : [...selectedDomains, domainId];
    
    setSelectedDomains(newDomains);
    // Update form value for validation
    setValue('domains', newDomains);
  };

  const handleExperienceLevelChange = (value: string) => {
    setSelectedExperienceLevel(value);
    // Update form value for validation
    setValue('experience_level', value as any);
  };

  const handleStudyTimeChange = (value: string) => {
    setSelectedStudyTime(value);
    // Update form value for validation
    setValue('preferred_study_time', value);
  };

  const handleTimezoneChange = (value: string) => {
    setSelectedTimezone(value);
    // Update form value for validation
    setValue('timezone', value);
  };

  const nextStep = (e?: React.MouseEvent) => {
    e?.preventDefault();
    
    // Validation before moving to next step
    if (step === 1 && selectedDomains.length === 0) {
      return; // Don't proceed if no domains selected
    }
    if (step === 2 && !selectedExperienceLevel) {
      return; // Don't proceed if no experience level selected
    }
    if (step === 3 && (!selectedStudyTime || !selectedTimezone)) {
      return; // Don't proceed if study time or timezone not selected
    }
    
    if (step < totalSteps) setStep(step + 1);
  };

  const prevStep = (e?: React.MouseEvent) => {
    e?.preventDefault();
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Step {step} of {totalSteps}
            </p>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          {step === 1 && (
            <CardContent className="space-y-6">
              <div className="text-center space-y-2">
                <CardTitle>Welcome to SocraticWingman!</CardTitle>
                <CardDescription>
                  Let's personalize your learning experience. Which domains interest you?
                </CardDescription>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DOMAINS.map((domain) => (
                  <div
                    key={domain.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedDomains.includes(domain.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleDomainToggle(domain.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedDomains.includes(domain.id)}
                        onChange={() => handleDomainToggle(domain.id)}
                        className="mt-1 h-4 w-4 rounded border-input focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      />
                      <div>
                        <h3 className="font-medium">{domain.name}</h3>
                        <p className="text-sm text-muted-foreground">{domain.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {errors.domains && (
                <p className="text-sm text-red-500">{errors.domains.message}</p>
              )}

              <div className="flex justify-end">
                <Button 
                  type="button" 
                  onClick={nextStep} 
                  disabled={selectedDomains.length === 0}
                >
                  Continue
                </Button>
              </div>
            </CardContent>
          )}

          {step === 2 && (
            <CardContent className="space-y-6">
              <div className="text-center space-y-2">
                <CardTitle>What's your experience level?</CardTitle>
                <CardDescription>
                  This helps us adjust the difficulty and pace of your learning
                </CardDescription>
              </div>

              <div className="space-y-4">
                {EXPERIENCE_LEVELS.map((level) => (
                  <div key={level.value} className="flex items-center space-x-2 p-4 border rounded-lg">
                    <input
                      type="radio"
                      id={level.value}
                      name="experience-level"
                      value={level.value}
                      checked={selectedExperienceLevel === level.value}
                      onChange={(e) => handleExperienceLevelChange(e.target.value)}
                      className="h-4 w-4 border-input focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    />
                    <div className="flex-1">
                      <Label htmlFor={level.value} className="font-medium cursor-pointer">
                        {level.label}
                      </Label>
                      <p className="text-sm text-muted-foreground">{level.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={prevStep}>
                  Back
                </Button>
                <Button 
                  type="button" 
                  onClick={nextStep}
                  disabled={!selectedExperienceLevel}
                >
                  Continue
                </Button>
              </div>
            </CardContent>
          )}

          {step === 3 && (
            <CardContent className="space-y-6">
              <div className="text-center space-y-2">
                <CardTitle>When do you prefer to study?</CardTitle>
                <CardDescription>
                  We'll send you personalized reminders at your preferred time
                </CardDescription>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="study-time">Preferred Study Time</Label>
                  <select
                    id="study-time"
                    value={selectedStudyTime}
                    onChange={(e) => handleStudyTimeChange(e.target.value)}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select your preferred study time</option>
                    {STUDY_TIMES.map((time) => (
                      <option key={time.value} value={time.value}>
                        {time.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <select
                    id="timezone"
                    value={selectedTimezone}
                    onChange={(e) => handleTimezoneChange(e.target.value)}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="Europe/London">Greenwich Mean Time (GMT)</option>
                    <option value="Europe/Paris">Central European Time (CET)</option>
                    <option value="Asia/Tokyo">Japan Standard Time (JST)</option>
                    <option value="Asia/Shanghai">China Standard Time (CST)</option>
                    <option value="Asia/Kolkata">India Standard Time (IST)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={prevStep}>
                  Back
                </Button>
                <Button 
                  type="button" 
                  onClick={nextStep}
                  disabled={!selectedStudyTime || !selectedTimezone}
                >
                  Continue
                </Button>
              </div>
            </CardContent>
          )}

          {step === 4 && (
            <CardContent className="space-y-6">
              <div className="text-center space-y-2">
                <CardTitle>You're all set!</CardTitle>
                <CardDescription>
                  Ready to start your adaptive learning journey? Let's begin with a quick diagnostic to understand your current knowledge.
                </CardDescription>
              </div>

              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="font-semibold mb-2">What happens next?</h3>
                <ul className="space-y-2 text-sm">
                  <li>• We'll start with a diagnostic assessment (10-15 minutes)</li>
                  <li>• Based on your performance, we'll create a personalized learning plan</li>
                  <li>• You'll practice with our Socratic hint system that guides you to solutions</li>
                  <li>• Our spaced repetition system will help you retain knowledge long-term</li>
                </ul>
              </div>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={prevStep}>
                  Back
                </Button>
                <Button 
                  type="button" 
                  onClick={() => onSubmit({} as any)}
                  disabled={isSubmitting || isSuccess}
                  className={`transition-all duration-500 ${
                    isSuccess 
                      ? 'bg-green-600 hover:bg-green-600' 
                      : isSubmitting 
                        ? 'bg-blue-600' 
                        : 'bg-primary hover:bg-primary/90'
                  }`}
                >
                  {isSuccess ? (
                    <span className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Success! Redirecting...
                    </span>
                  ) : isSubmitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 718-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </span>
                  ) : 'Start Learning'}
                </Button>
              </div>
            </CardContent>
          )}
        </form>
      </Card>
    </div>
  );
}
