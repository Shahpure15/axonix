import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/lib/auth';
import { userStorage, UserData } from '@/lib/userData';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';

export default function OnboardingPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkOnboardingAccess = async () => {
      if (!isAuthenticated) {
        router.push('/');
        return;
      }

      // Get current user data
      const userData = await userStorage.getCurrentUser();
      setCurrentUser(userData);

      if (userData) {
        // Check if user has already completed onboarding
        if (userData.onboarding_status === 'completed') {
          console.log('User has completed onboarding, redirecting to dashboard');
          router.push('/dashboard');
          return;
        }
      }

      setIsLoading(false);
    };

    checkOnboardingAccess();
  }, [isAuthenticated, router]);

  if (!isAuthenticated || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (currentUser?.onboarding_status === 'completed') {
    return null; // Redirecting to dashboard
  }

  return <OnboardingWizard />;
}