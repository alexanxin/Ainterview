'use client';

import { Button } from '@/components/ui/button';
import { User, Menu, Home, FileText, Users, Settings, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function Navigation() {
  const [open, setOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();
  
  // Use the context inside this component but handle errors gracefully
  const authContext = useAuth();
  const { user, signOut } = authContext;

  useEffect(() => {
    // Mark that auth check is complete to prevent SSR issues
    setAuthChecked(true);
  }, []);

  const navItems = [
    { name: 'Home', icon: Home, href: '/' },
    { name: 'Practice', icon: FileText, href: '/interview' },
    { name: 'Dashboard', icon: Users, href: '/dashboard' },
    { name: 'Profile', icon: User, href: '/profile' },
    { name: 'Test API', icon: FileText, href: '/test-api' },
  ];

  const handleNavigation = (href: string) => {
    router.push(href);
    setOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    setOpen(false);
  };

  // Show nothing until auth is checked to prevent context errors
  if (!authChecked) {
    return (
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <div className="mr-2 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <span className="font-bold">AI</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Ainterview
            </h1>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div 
          className="flex items-center cursor-pointer"
          onClick={() => router.push('/')}
        >
          <div className="mr-2 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-700 to-lime-600 text-white">
            <span className="font-bold">AI</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Ainterview
          </h1>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => (
            <Button
              key={item.name}
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2"
              onClick={() => router.push(item.href)}
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
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
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
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}