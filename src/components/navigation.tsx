'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Menu, Home, FileText, LogOut, LogIn, BarChart3, Info, MessageSquare, HelpCircle, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getCompanyByUserId } from '@/lib/database';
import CreditDisplay from '@/components/credit-display';


// Dynamically import modal components to prevent hydration issues
const Sheet = dynamic(() => import('@/components/ui/sheet').then(mod => mod.Sheet), { ssr: false });
const SheetContent = dynamic(() => import('@/components/ui/sheet').then(mod => mod.SheetContent), { ssr: false });
const SheetHeader = dynamic(() => import('@/components/ui/sheet').then(mod => mod.SheetHeader), { ssr: false });
const SheetTitle = dynamic(() => import('@/components/ui/sheet').then(mod => mod.SheetTitle), { ssr: false });
const SheetTrigger = dynamic(() => import('@/components/ui/sheet').then(mod => mod.SheetTrigger), { ssr: false });

export default function Navigation() {
  const [open, setOpen] = useState(false);
  const [hasCompanyAccount, setHasCompanyAccount] = useState(false);
  const [companyCheckLoading, setCompanyCheckLoading] = useState(true);
  const router = useRouter();

  // Use the context inside this component but handle errors gracefully
  const authContext = useAuth();
  const { user, signOut } = authContext;

  // Check if user has a company account
  useEffect(() => {
    const checkCompanyAccount = async () => {
      if (user) {
        try {
          const company = await getCompanyByUserId(user.id);
          setHasCompanyAccount(!!company);
        } catch (error) {
          console.error('Error checking company account:', error);
          setHasCompanyAccount(false);
        } finally {
          setCompanyCheckLoading(false);
        }
      } else {
        setHasCompanyAccount(false);
        setCompanyCheckLoading(false);
      }
    };

    checkCompanyAccount();
  }, [user]);

  const navItems = [
    {
      name: 'My Resume',
      icon: FileText,
      href: '/profile',
      description: 'Build and optimize your professional resume'
    },
    {
      name: 'AI Interview Practice',
      icon: MessageSquare,
      href: '/interview',
      description: 'Start personalized mock interviews with AI feedback'
    },
    {
      name: 'Feedback & Practice',
      icon: MessageSquare,
      href: '/feedback',
      description: 'Review AI analysis and practice responses'
    },
    {
      name: 'Progress Analytics',
      icon: BarChart3,
      href: '/dashboard',
      description: 'Track your interview preparation progress'
    },
    {
      name: 'Help',
      icon: HelpCircle,
      href: '/help',
      description: 'Complete user guides and troubleshooting'
    },
  ];

  // About section dropdown items
  const aboutItems = [
    {
      name: 'About Ainterview',
      icon: Info,
      href: '/about',
      description: 'How AI-powered interview prep works'
    },
    {
      name: 'Technology',
      icon: Zap,
      href: '/technology',
      description: 'Secure micropayments for AI coaching'
    },
  ];

  // Additional navigation items for mobile (comparison pages)
  const comparisonItems = [
    {
      name: 'Compare: Ainterview vs Skillora',
      icon: FileText,
      href: '/compare/skillora',
      description: 'AI interview platforms comparison guide'
    },
    {
      name: 'vs Big Interview',
      icon: MessageSquare,
      href: '/compare/big-interview',
      description: 'Professional vs AI interview coaching'
    },
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
        <div className="flex items-center space-x-4">
          <div
            className="flex items-center cursor-pointer"
            onClick={() => router.push('/')}
          >
            <img src="/logo.png" alt="Ainterview Logo" className="mr-2 h-10 w-10" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Ainterview
            </h1>
          </div>

          {/* Credits Display */}
          {user && <CreditDisplay className="hidden md:flex" showTopUpButton={false} />}
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-4">
          {/* My Resume item with floating start here badge */}
          <div className="relative">
            <Button
              key="My Resume"
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2 hover:bg-[#78cd001c]"
              onClick={async () => {
                router.push('/profile');
              }}
            >
              <FileText className="h-4 w-4" />
              <span>My Resume</span>
            </Button>
            {/* Floating badge positioned below */}
            <div className="absolute mt-1 -left-22 top-0 hidden md:block">
              <div className="relative">
                {/* Badge */}
                <Badge className="dark:bg-green-900/20 border dark:border-green-800 text-green-300/50 text-[10px] px-2 py-0 text-nowrap">
                  start here →
                </Badge>
              </div>
            </div>
          </div>
          {/* Other navigation items */}
          {navItems.slice(1).map((item) => (
            <Button
              key={item.name}
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2 hover:bg-[#78cd001c]"
              onClick={async () => {
                router.push(item.href);
              }}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Button>
          ))}

          {/* Show Sign In when user is not logged in, otherwise show unified profile dropdown */}
          {!user ? (
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2 hover:bg-[#78cd001c]"
              onClick={handleSignIn}
            >
              <LogIn className="h-4 w-4" />
              <span>Sign In</span>
            </Button>
          ) : (
            <div className="flex items-center space-x-2">
              {/* Unified Profile/Company Dropdown */}
              <div className="relative">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center space-x-2 hover:bg-[#78cd001c]"
                      disabled={false}
                    >
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-56"
                    onCloseAutoFocus={(e) => e.preventDefault()}
                  >
                    {/* Personal Profile Items */}
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.preventDefault();
                        router.push('/profile');
                      }}
                      className="flex items-center space-x-2 cursor-pointer hover:bg-green-900/30"
                    >
                      <User className="h-4 w-4" />
                      <span>My Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.preventDefault();
                        router.push('/dashboard');
                      }}
                      className="flex items-center space-x-2 cursor-pointer hover:bg-green-900/30"
                    >
                      <BarChart3 className="h-4 w-4" />
                      <span>My Dashboard</span>
                    </DropdownMenuItem>

                    {/* Company Section - Only show if user has company account */}
                    {!companyCheckLoading && hasCompanyAccount && (
                      <>
                        <div className="border-t my-1" />
                        <div className="px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400">Company</div>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.preventDefault();
                            router.push('/b2b/dashboard');
                          }}
                          className="flex items-center space-x-2 cursor-pointer hover:bg-green-900/30"
                        >
                          <BarChart3 className="h-4 w-4" />
                          <span>Company Dashboard</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.preventDefault();
                            router.push('/b2b/job-posts');
                          }}
                          className="flex items-center space-x-2 cursor-pointer hover:bg-green-900/30"
                        >
                          <FileText className="h-4 w-4" />
                          <span>Job Posts</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.preventDefault();
                            router.push('/b2b/responses');
                          }}
                          className="flex items-center space-x-2 cursor-pointer hover:bg-green-900/30"
                        >
                          <MessageSquare className="h-4 w-4" />
                          <span>Applications</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.preventDefault();
                            router.push('/b2b/credits/purchase');
                          }}
                          className="flex items-center space-x-2 cursor-pointer hover:bg-green-900/30"
                        >
                          <Zap className="h-4 w-4" />
                          <span>Buy Credits</span>
                        </DropdownMenuItem>
                      </>
                    )}

                    {/* Sign Out */}
                    <div className="border-t my-1" />
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.preventDefault();
                        handleSignOut();
                      }}
                      className="flex items-center space-x-2 cursor-pointer hover:bg-green-900/30"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
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

            {/* Mobile Credits Display */}
            {user && (
              <div className="mt-4 px-4">
                <CreditDisplay showTopUpButton={true} />
              </div>
            )}

            <div className="flex flex-col space-y-2 mt-6">

              {/* My Resume item with start here badge */}
              <Button
                key="My Resume"
                variant="ghost"
                className="justify-start hover:bg-[#78cd001c]"
                onClick={() => handleNavigation('/profile')}
              >
                <FileText className="mr-2 h-4 w-4" />
                <div className="flex items-center space-x-2">
                  <span>My Resume</span>
                  <Badge className="bg-green-500 text-white text-xs px-1 py-0">
                    start here
                  </Badge>
                </div>
              </Button>

              {/* Other navigation items */}
              {navItems.slice(1).map((item) => (
                <Button
                  key={item.name}
                  variant="ghost"
                  className="justify-start hover:bg-[#78cd001c]"
                  onClick={() => handleNavigation(item.href)}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Button>
              ))}

              {aboutItems.map((item) => (
                <Button
                  key={item.name}
                  variant="ghost"
                  className="justify-start hover:bg-[#78cd001c]"
                  onClick={() => handleNavigation(item.href)}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Button>
              ))}

              {/* Company items for mobile - only show if user has company account */}
              {user && !companyCheckLoading && hasCompanyAccount && (
                <>
                  <div className="border-t my-2" />
                  <Button
                    variant="ghost"
                    className="justify-start hover:bg-[#78cd001c]"
                    onClick={() => handleNavigation('/b2b/dashboard')}
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Company Dashboard
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start hover:bg-[#78cd001c]"
                    onClick={() => handleNavigation('/b2b/job-posts')}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Job Posts
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start hover:bg-[#78cd001c]"
                    onClick={() => handleNavigation('/b2b/responses')}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Applications
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start hover:bg-[#78cd001c]"
                    onClick={() => handleNavigation('/b2b/credits/purchase')}
                  >
                    <Zap className="mr-2 h-4 w-4" />
                    Buy Credits
                  </Button>
                </>
              )}

              {user ? (
                <>
                  <Button
                    variant="ghost"
                    className="justify-start hover:bg-[#78cd001c]"
                    onClick={() => handleNavigation('/profile')}
                  >
                    <User className="mr-2 h-4 w-4" />
                    My Profile
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start hover:bg-[#78cd001c]"
                    onClick={() => handleNavigation('/dashboard')}
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start hover:bg-[#78cd001c]"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button
                  variant="ghost"
                  className="justify-start hover:bg-[#78cd001c]"
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
