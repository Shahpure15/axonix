import { ReactNode, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuthStore } from '@/lib/auth';
import { optimizeScrollBehavior } from '@/lib/scroll-utils';
import { axonixColors, getAxonixGradient } from '@/lib/brand-colors';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  Book,
  BookOpen,
  BarChart3,
  Calendar,
  Settings,
  LogOut,
  Brain,
  Clock,
  Menu,
  Map,
  Zap,
  Heart,
  ShoppingBag,
  User,
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'Roadmap', href: '/roadmap', icon: Map },
  { name: 'Learn', href: '/learn', icon: Brain },
  { name: 'Review', href: '/review', icon: Clock },
  { name: 'Library', href: '/library', icon: BookOpen },
  { name: 'Pet House', href: '/pet-house', icon: Heart },
  { name: 'Marketplace', href: '/marketplace', icon: ShoppingBag },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const mainContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  // Optimize scroll performance on main content
  useEffect(() => {
    if (mainContentRef.current) {
      optimizeScrollBehavior(mainContentRef.current);
    }
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  const Sidebar = ({ className = '' }: { className?: string }) => (
    <div className={`flex flex-col bg-gradient-to-b from-axonix-100/90 via-axonix-200/80 to-axonix-300/70 backdrop-blur-lg ${className}`}>
      <div className="flex items-center px-6 py-4 border-b border-axonix-400/30 bg-axonix-100/60">
        <div className="flex items-center space-x-2">
          <div className="relative axonix-logo">
            <Zap className="h-8 w-8 text-axonix-700" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-axonix-800 rounded-full animate-pulse shadow-sm"></div>
          </div>
          <span className="text-xl font-bold text-axonix-800 axonix-text-shadow">
            Axonix
          </span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = router.pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 border axonix-focus ${
                isActive
                  ? 'axonix-nav-active text-white shadow-lg shadow-axonix-700/40 border-axonix-800/60 transform scale-[1.02] axonix-glow-strong'
                  : 'text-axonix-800 hover:text-axonix-900 hover:bg-gradient-to-r hover:from-axonix-100/80 hover:to-axonix-200/60 hover:shadow-md hover:border-axonix-500/50 border-transparent hover:scale-[1.01] axonix-shimmer'
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
              {isActive && (
                <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse shadow-sm"></div>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-axonix-400/30 bg-gradient-to-r from-axonix-200/70 to-axonix-300/60 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10 ring-2 ring-axonix-600/50 ring-offset-2 ring-offset-axonix-200">
            <AvatarImage src={user.avatar_url} alt={user.name || user.email} />
            <AvatarFallback className="bg-gradient-to-br from-axonix-600 to-axonix-800 text-white font-semibold">
              {(user.name || user.email).charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-axonix-900">
              {user.name || user.email}
            </p>
            {user.preferences?.experience_level && (
              <Badge variant="secondary" className="text-xs bg-axonix-300/80 text-axonix-800 border border-axonix-500/50">
                {user.preferences.experience_level}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gradient-to-br from-axonix-100 via-axonix-200 to-axonix-300">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-col md:w-64 md:border-r border-axonix-400/30 md:shadow-xl shadow-axonix-200/20 axonix-glow">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild className="md:hidden">
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-4 left-4 z-50 bg-gradient-to-r from-axonix-200/95 to-axonix-300/90 backdrop-blur-sm hover:from-axonix-300/95 hover:to-axonix-400/90 border border-axonix-500/50 shadow-lg shadow-axonix-200/20"
          >
            <Menu className="h-6 w-6 text-axonix-700" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64 border-r border-axonix-400/30 bg-gradient-to-b from-axonix-100/95 via-axonix-200/90 to-axonix-300/80 backdrop-blur-lg">
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-axonix-400/30 bg-gradient-to-r from-axonix-200/90 via-axonix-100/95 to-axonix-300/80 backdrop-blur-lg px-6 py-4 shadow-lg shadow-axonix-200/10 axonix-gradient-overlay">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 md:w-0"></div>
              <h1 className="text-2xl font-bold text-axonix-800 axonix-text-shadow">
                {navigation.find(item => item.href === router.pathname)?.name || 'Dashboard'}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-white/20">
                    <Avatar className="h-8 w-8 ring-2 ring-purple-300">
                      <AvatarImage src={user.avatar_url} alt={user.name || user.email} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-400 to-purple-600 text-white">
                        {(user.name || user.email).charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-white/95 backdrop-blur-lg border border-axonix-300/50 shadow-xl shadow-axonix-200/20" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none text-axonix-800">
                        {user.name || user.email}
                      </p>
                      <p className="text-xs leading-none text-axonix-600">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-axonix-300/50" />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer hover:bg-axonix-50 border-b border-transparent hover:border-axonix-200/50">
                      <User className="mr-2 h-4 w-4 text-axonix-600" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer hover:bg-axonix-50 border-b border-transparent hover:border-axonix-200/50">
                      <Settings className="mr-2 h-4 w-4 text-axonix-600" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-axonix-300/50" />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer hover:bg-axonix-50 border-b border-transparent hover:border-axonix-200/50">
                    <LogOut className="mr-2 h-4 w-4 text-axonix-600" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main 
          ref={mainContentRef}
          className="flex-1 overflow-auto p-6 will-change-scroll bg-gradient-to-br from-axonix-100/30 via-axonix-200/20 to-axonix-300/30"
        >
          <div className="relative">
            {/* Colorful background decorations */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-axonix-400 to-axonix-600 rounded-full blur-xl"></div>
              <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-axonix-500 to-axonix-700 rounded-full blur-lg"></div>
              <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-gradient-to-br from-axonix-300 to-axonix-500 rounded-full blur-2xl"></div>
              <div className="absolute bottom-40 right-1/3 w-28 h-28 bg-gradient-to-br from-axonix-600 to-axonix-800 rounded-full blur-xl"></div>
            </div>
            <div className="relative z-10">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}