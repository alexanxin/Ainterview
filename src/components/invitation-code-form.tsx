/*
COMMENTED OUT FOR HACKATHON - INVITATION SYSTEM REMOVED
======================================================

This component is now disabled to allow direct access during the hackathon.
All invitation checking logic has been removed.

To restore after hackathon:
1. Remove this comment block (lines 1-8)
2. Uncomment the import for InvitationCodeService
3. Restore the original validation logic in handleSubmit
4. Test that invitation codes work again

Original component code preserved below:
*/

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { InvitationCodeService, ValidateCodeResult } from "@/lib/invitation-code-service"; // COMMENTED OUT FOR HACKATHON

export default function InvitationCodeForm() {
    const [code, setCode] = useState("");
    const [isValidating, setIsValidating] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [codeInfo, setCodeInfo] = useState<any>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!code.trim()) {
            setError("Please enter an invitation code");
            return;
        }

        setIsValidating(true);
        setError("");
        setSuccess(false);

        try {
            // FOR HACKATHON - Just accept any code to allow direct access
            setSuccess(true);
            setCodeInfo({ code: "HACKATHON_ACCESS" });
            // Store the validation in localStorage for session
            localStorage.setItem('invitationCodeUsed', code.trim().toUpperCase());
            // Give a moment to show success, then refresh to show main app
            setTimeout(() => {
                window.location.reload();
            }, 2000);

            /* ORIGINAL VALIDATION CODE (commented out for hackathon):
            const result: ValidateCodeResult = await InvitationCodeService.validateCode(code);
            if (result.valid) {
                setSuccess(true);
                setCodeInfo(result.codeInfo);
                // Store the validation in localStorage for session
                localStorage.setItem('invitationCodeUsed', code.trim().toUpperCase());
                // Give a moment to show success, then refresh to show main app
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else {
                setError(result.error || "Invalid invitation code");
            }
            */
        } catch (err) {
            setError("An unexpected error occurred");
        } finally {
            setIsValidating(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-lime-50 dark:from-gray-900 dark:to-gray-950 font-sans">
                <div className="w-full max-w-md p-4">
                    <Card className="shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-green-200 dark:border-green-800">
                        <CardContent className="p-8 text-center">
                            <div className="text-6xl mb-4">🎉</div>
                            <h2 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">
                                Welcome to Ainterview!
                            </h2>
                            <p className="text-green-600 dark:text-green-300">
                                Your invitation code has been validated. Redirecting you to the app...
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-lime-50 dark:from-gray-900 dark:to-gray-950 font-sans">
            <div className="w-full max-w-md p-4">
                <Card className="shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-white">
                            <img src="/logo.png" alt="Ainterview Logo" className="h-full w-full p-2" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                            Invitation Required
                        </CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400">
                            Enter your invitation code to access Ainterview
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="code" className="text-gray-700 dark:text-gray-300">
                                    Invitation Code
                                </Label>
                                <Input
                                    id="code"
                                    type="text"
                                    placeholder="ABCD1234"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                                    className="dark:bg-gray-700 dark:text-white text-center text-lg font-mono tracking-wider"
                                    disabled={isValidating}
                                    maxLength={8}
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                                    Enter the 8-character code you received
                                </p>
                            </div>

                            <Button
                                type="submit"
                                className="w-full py-6 text-lg bg-gradient-to-r from-green-600 to-lime-500 text-white hover:opacity-90"
                                disabled={isValidating}
                            >
                                {isValidating ? "Validating..." : "Access Ainterview"}
                            </Button>
                        </form>

                        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
                                Don't have a code?
                            </h4>
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                Ainterview is currently in private beta. Follow us on social media for invitation codes or contact us for access.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

/*
END OF COMMENTED OUT INVITATION FORM COMPONENT
==============================================
To restore after hackathon: Remove this comment block and uncomment the imports/logic as needed.
*/