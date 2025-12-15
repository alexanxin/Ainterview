'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { useToast } from '@/lib/toast';
import { supabase } from '@/lib/supabase';
import { CheckCircle, Loader2 } from 'lucide-react';

interface B2BSignupSheetProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
    redirectUrl?: string;
    submitButtonText?: string;
    successTitle?: string;
    successDescription?: string;
}

export default function B2BSignupSheet({
    children,
    title = "Create Employer Account",
    description = "Enter your work email to get started. We'll send you a secure login link.",
    redirectUrl = "/b2b/create",
    submitButtonText = "Send Magic Link",
    successTitle = "Check your email",
    successDescription = "Click the link in your email to continue."
}: B2BSignupSheetProps) {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const { success: toastSuccess, error } = useToast();
    const [isEmailSent, setIsEmailSent] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const { error: signInError } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${redirectUrl}`,
                },
            });

            if (signInError) throw signInError;

            setIsEmailSent(true);
            toastSuccess('Magic link sent! Check your email.');
        } catch (err: any) {
            error(err.message || 'Failed to send magic link');
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setIsEmailSent(false);
        setEmail('');
        setIsSheetOpen(false);
    }

    return (
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
                {children}
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md">
                <SheetHeader className="mb-6">
                    <SheetTitle>{title}</SheetTitle>
                    <SheetDescription>
                        {description}
                    </SheetDescription>
                </SheetHeader>

                {!isEmailSent ? (
                    <form onSubmit={handleSignup} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email">Work Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-green-600 to-lime-500"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sending Link...
                                </>
                            ) : (
                                submitButtonText
                            )}
                        </Button>
                    </form>
                ) : (
                    <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center">
                        <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
                            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-500" />
                        </div>
                        <h3 className="text-xl font-semibold">{successTitle}</h3>
                        <p className="text-muted-foreground">
                            We sent a temporary login link to <span className="font-medium text-foreground">{email}</span>.
                            {successDescription}
                        </p>
                        <Button
                            variant="outline"
                            onClick={resetForm}
                            className="mt-4"
                        >
                            Close
                        </Button>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
