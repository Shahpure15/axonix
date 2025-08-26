/**
 * AuthGuard component to protect routes and handle authentication states
 */

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/lib/auth';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean; // true = require auth, false = require no auth (guest only)
  redirectTo?: string; // where to redirect if condition not met
  fallback?: React.ReactNode; // what to show while loading
}

export function AuthGuard({ 
  children, 
  requireAuth = true, 
  redirectTo,
  fallback 
}: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    // Wait for auth state to load before making decisions
    if (isLoading) return;

    if (requireAuth && !isAuthenticated) {
      // User needs to be authenticated but isn't
      router.push(redirectTo || '/auth/login');
    } else if (!requireAuth && isAuthenticated) {
      // User should not be authenticated but is (guest-only pages)
      router.push(redirectTo || '/dashboard');
    }
  }, [isAuthenticated, isLoading, requireAuth, redirectTo, router]);

  // Show loading while auth state is being determined
  if (isLoading) {
    return fallback || (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render children if auth condition is not met
  if (requireAuth && !isAuthenticated) {
    return null; // Redirecting...
  }

  if (!requireAuth && isAuthenticated) {
    return null; // Redirecting...
  }

  // Auth condition is met, render children
  return <>{children}</>;
}

// Convenience wrapper for pages that require authentication
export function ProtectedPage({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <AuthGuard requireAuth={true} fallback={fallback}>
      {children}
    </AuthGuard>
  );
}

// Convenience wrapper for guest-only pages (login, signup, etc.)
export function GuestOnlyPage({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <AuthGuard requireAuth={false} fallback={fallback}>
      {children}
    </AuthGuard>
  );
}
