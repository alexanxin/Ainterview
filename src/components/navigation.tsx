'use client';

import { Button } from '@/components/ui/button';
import { User, Menu, Home, FileText, LogOut, LogIn, BarChart3, Info, MessageSquare, HelpCircle } from 'lucide-react';
import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import CreditDisplay from '@/components/credit-display';
import { handleCreditCheckAndRedirect } from '@/lib/credit-service';

export default function Navigation() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // Use the context inside this component but handle errors gracefully
  const authContext = useAuth();
  const { user, signOut } = authContext;

  const navItems = [
    // { name: 'Home', icon: Home, href: '/' },

    { name: 'Start Interview', icon: FileText, href: '/interview' },
    { name: 'Feedback & Practice', icon: MessageSquare, href: '/feedback' },
    { name: 'Dashboard', icon: BarChart3, href: '/dashboard' },
    { name: 'About', icon: Info, href: '/about' },
    { name: 'Help', icon: HelpCircle, href: '/help' },
    // Profile link will be conditionally rendered when user is authenticated
  ];

  const handleNavigation = async (href: string) => {
    // For other navigation, proceed normally
    router.push(href);
    setOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    setOpen(false);
  };

  const handleSignIn = () => {
    router.push('/auth');
    setOpen(false);
  };

  // The auth context should handle SSR issues, so we can render immediately

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div
          className="flex items-center cursor-pointer"
          onClick={() => router.push('/')}
        >
          <img src="/logo.png" alt="Ainterview Logo" className="mr-2 h-10 w-10" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Ainterview
          </h1>
          <CreditDisplay className="ml-4" showTopUpButton={true} />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-4">
          {navItems.map((item) => (
            <Button
              key={item.name}
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2"
              onClick={async () => {
                router.push(item.href);
              }}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Button>
          ))}
          {user && (
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2"
              onClick={() => router.push('/profile')}
            >
              <User className="h-4 w-4" />
              <span>Profile</span>
            </Button>
          )}
          {user ? (
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              <span></span>
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2"
              onClick={handleSignIn}
            >
              <LogIn className="h-4 w-4" />
              <span>Sign In</span>
            </Button>
          )}
        </nav>

        {/* Mobile Menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="dark:bg-gray-900">
            <SheetHeader>
              <SheetTitle className="text-left text-gray-900 dark:text-white">
                Ainterview Menu
              </SheetTitle>
            </SheetHeader>
            <div className="flex flex-col space-y-2 mt-6">
              <div className="flex items-center justify-between mb-4">
                <CreditDisplay showTopUpButton={true} />
              </div>
              {navItems.map((item) => (
                <Button
                  key={item.name}
                  variant="ghost"
                  className="justify-start"
                  onClick={() => handleNavigation(item.href)}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Button>
              ))}
              {user && (
                <Button
                  variant="ghost"
                  className="justify-start"
                  onClick={() => handleNavigation('/profile')}
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Button>
              )}
              {user ? (
                <Button
                  variant="ghost"
                  className="justify-start"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  className="justify-start"
                  onClick={handleSignIn}
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}