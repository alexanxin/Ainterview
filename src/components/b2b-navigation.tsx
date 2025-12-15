'use client';

import { Button } from '@/components/ui/button';
import { User, Menu, BarChart3, FileText, LogOut, Zap, MessageSquare, ChevronDown, LayoutDashboard } from 'lucide-react';
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
import B2BSignupSheet from '@/components/b2b-signup-sheet';

// Dynamically import modal components to prevent hydration issues
const Sheet = dynamic(() => import('@/components/ui/sheet').then(mod => mod.Sheet), { ssr: false });
const SheetContent = dynamic(() => import('@/components/ui/sheet').then(mod => mod.SheetContent), { ssr: false });
const SheetHeader = dynamic(() => import('@/components/ui/sheet').then(mod => mod.SheetHeader), { ssr: false });
const SheetTitle = dynamic(() => import('@/components/ui/sheet').then(mod => mod.SheetTitle), { ssr: false });
const SheetTrigger = dynamic(() => import('@/components/ui/sheet').then(mod => mod.SheetTrigger), { ssr: false });

export default function B2BNavigation() {
    const [open, setOpen] = useState(false);
    const [companyName, setCompanyName] = useState<string>('');
    const router = useRouter();

    const { user, signOut } = useAuth();

    useEffect(() => {
        const fetchCompanyInfo = async () => {
            if (user) {
                try {
                    const company = await getCompanyByUserId(user.id);
                    if (company) {
                        setCompanyName(company.company_name);
                    }
                } catch (error) {
                    console.error('Error fetching company info:', error);
                }
            }
        };

        fetchCompanyInfo();
    }, [user]);

    const navItems = [
        {
            name: 'Dashboard',
            icon: LayoutDashboard,
            href: '/b2b/dashboard',
        },
        {
            name: 'Job Posts',
            icon: FileText,
            href: '/b2b/job-posts',
        },
        {
            name: 'Applications',
            icon: MessageSquare,
            href: '/b2b/responses',
        },
        {
            name: 'Buy Credits',
            icon: Zap,
            href: '/b2b/credits/purchase',
        },
    ];

    const handleNavigation = (href: string) => {
        router.push(href);
        setOpen(false);
    };

    const handleSignOut = async () => {
        await signOut();
        setOpen(false);
        router.push('/');
    };

    return (
        <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80 sticky top-0 z-50">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <div className="flex items-center space-x-6">
                    <div
                        className="flex items-center cursor-pointer"
                        onClick={() => router.push('/b2b/dashboard')}
                    >
                        <img src="/logo.png" alt="Ainterview Logo" className="mr-2 h-10 w-10" />
                        <div className="flex flex-col">
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-none">
                                Ainterview
                            </h1>
                            <span className="text-xs font-semibold text-green-600 dark:text-green-400 tracking-wider">
                                BUSINESS
                            </span>
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    {user ? (
                        <nav className="hidden md:flex items-center space-x-1">
                            {navItems.map((item) => (
                                <Button
                                    key={item.name}
                                    variant="ghost"
                                    size="sm"
                                    className="flex items-center space-x-2 hover:bg-[#78cd001c]"
                                    onClick={() => router.push(item.href)}
                                >
                                    <item.icon className="h-4 w-4" />
                                    <span>{item.name}</span>
                                </Button>
                            ))}
                        </nav>
                    ) : null}
                </div>

                <div className="flex items-center space-x-4">
                    {!user && (
                        <div className="hidden md:block">
                            <B2BSignupSheet
                                title="Sign In to Business Account"
                                description="Enter your email to receive a secure login link."
                                redirectUrl="/b2b/dashboard"
                                submitButtonText="Send Login Link"
                                successTitle="Check your email"
                                successDescription="Click the login link in your email to access your dashboard."
                            >
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="mr-2"
                                >
                                    Sign In
                                </Button>
                            </B2BSignupSheet>
                            <B2BSignupSheet>
                                <Button
                                    size="sm"
                                    className="bg-gradient-to-r from-green-600 to-lime-500 text-gray-900 hover:opacity-90"
                                >
                                    Get Started
                                </Button>
                            </B2BSignupSheet>
                        </div>
                    )}
                    {/* Credits Display */}
                    {user && <CreditDisplay className="hidden md:flex" showTopUpButton={false} />}

                    {/* User/Company Dropdown */}
                    {user && (
                        <div className="hidden md:block">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="flex items-center space-x-2 hover:bg-[#78cd001c]"
                                    >
                                        <User className="h-4 w-4" />
                                        <span>{companyName || 'Company Account'}</span>
                                        <ChevronDown className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuItem
                                        onClick={() => router.push('/profile')}
                                        className="cursor-pointer"
                                    >
                                        <User className="mr-2 h-4 w-4" />
                                        <span>Personal Profile</span>
                                    </DropdownMenuItem>
                                    <div className="border-t my-1" />
                                    <DropdownMenuItem
                                        onClick={handleSignOut}
                                        className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Sign Out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}

                    {/* Mobile Menu Trigger */}
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
                                    Business Menu
                                </SheetTitle>
                            </SheetHeader>

                            {user && (
                                <div className="mt-4 px-4">
                                    <CreditDisplay showTopUpButton={true} />
                                </div>
                            )}

                            <div className="flex flex-col space-y-2 mt-6">
                                {user ? (
                                    <>
                                        {navItems.map((item) => (
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

                                        <div className="border-t my-2" />

                                        <Button
                                            variant="ghost"
                                            className="justify-start hover:bg-[#78cd001c]"
                                            onClick={() => handleNavigation('/profile')}
                                        >
                                            <User className="mr-2 h-4 w-4" />
                                            Personal Profile
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            className="justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                            onClick={handleSignOut}
                                        >
                                            <LogOut className="mr-2 h-4 w-4" />
                                            Sign Out
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <B2BSignupSheet
                                            title="Sign In to Business Account"
                                            description="Enter your email to receive a secure login link."
                                            redirectUrl="/b2b/dashboard"
                                            submitButtonText="Send Login Link"
                                        >
                                            <Button
                                                variant="ghost"
                                                className="justify-start w-full"
                                            >
                                                Sign In
                                            </Button>
                                        </B2BSignupSheet>
                                        <B2BSignupSheet>
                                            <Button
                                                className="bg-gradient-to-r from-green-600 to-lime-500 text-gray-900 hover:opacity-90 justify-start w-full"
                                            >
                                                Get Started
                                            </Button>
                                        </B2BSignupSheet>
                                    </>
                                )}
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}
