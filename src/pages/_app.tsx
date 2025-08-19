import '@/styles/globals.css'
import '@/styles/axonix-theme.css'
import '@/styles/axonix-enhanced-theme.css'
import type { AppProps } from 'next/app'
import { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/auth'
import { getAxonixGradient } from '@/lib/brand-colors'

// Loading spinner component with Axonix branding
function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-axonix-50 via-axonix-100 to-axonix-200">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-axonix-200 border-t-axonix-700 will-change-transform"></div>
          <div className="absolute inset-0 rounded-full bg-axonix-600/20 animate-pulse"></div>
        </div>
        <p className="text-axonix-800 font-medium axonix-text-shadow">Loading Axonix...</p>
      </div>
    </div>
  )
}

export default function App({ Component, pageProps }: AppProps) {
  const [isHydrated, setIsHydrated] = useState(false)
  const { isLoading } = useAuthStore()

  // Prevent hydration mismatch by waiting for client-side hydration
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Show loading during hydration or auth loading
  if (!isHydrated || isLoading) {
    return <LoadingSpinner />
  }

  return <Component {...pageProps} />
}
