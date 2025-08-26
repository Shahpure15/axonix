import '@/styles/globals.css'
import '@/styles/socratic-wingman-theme.css'
import '@/styles/socratic-wingman-enhanced-theme.css'
import type { AppProps } from 'next/app'
import { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/auth'
// import { getSocraticWingmanGradient } from '@/lib/brand-colors' // No such export, removed to fix error

// Loading spinner component with Socratic Wingman branding
function LoadingSpinner() {
  return (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-socratic-wingman-50 via-socratic-wingman-100 to-socratic-wingman-200">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-socratic-wingman-200 border-t-socratic-wingman-700 will-change-transform"></div>
          <div className="absolute inset-0 rounded-full bg-socratic-wingman-600/20 animate-pulse"></div>
        </div>
  <p className="text-socratic-wingman-800 font-medium socratic-wingman-text-shadow">Loading Socratic Wingman...</p>
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
