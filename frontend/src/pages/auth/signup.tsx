import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/lib/auth';
import SignupForm from '@/components/auth/SignupForm';

export default function SignupPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/onboarding');
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return null; // or a loading spinner
  }

  return <SignupForm />;
}