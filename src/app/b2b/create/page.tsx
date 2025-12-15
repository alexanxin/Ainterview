'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Globe, Users, Briefcase } from 'lucide-react';
import { useToast } from '@/lib/toast';
import { createCompany } from '../actions';
import { getCompanyByUserId } from '@/lib/database';

import { supabase } from '@/lib/supabase';

export default function CreateCompanyPage() {
    const router = useRouter();
    const { success, error } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isChecking, setIsChecking] = useState(true);
    const [formData, setFormData] = useState({
        company_name: '',
        website_url: '',
        industry: '',
        company_size: '',
        company_description: ''
    });

    useEffect(() => {
        const checkExistingCompany = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const company = await getCompanyByUserId(user.id);
                    if (company) {
                        // Redirect immediately if they already have a company
                        router.push('/b2b/dashboard');
                        return;
                    }
                }
            } catch (error) {
                console.error("Error checking company:", error);
            } finally {
                setIsChecking(false);
            }
        };
        checkExistingCompany();
    }, [router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        if (!formData.company_name) {
            error('Company name is required');
            setIsLoading(false);
            return;
        }

        try {
            // Get current user ID from client-side auth
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                error('You must be logged in to create a company profile');
                // Redirect to login or show auth modal if exists
                setIsLoading(false);
                return;
            }

            const result = await createCompany(user.id, {
                company_name: formData.company_name,
                website_url: formData.website_url,
                industry: formData.industry,
                company_size: formData.company_size,
                company_description: formData.company_description
            });

            if (result.success) {
                success('Company profile created successfully!');
                // Small delay to let the toast show
                setTimeout(() => {
                    router.push('/b2b/dashboard');
                    router.refresh();
                }, 1000);
            } else {
                error(result.error || 'Failed to create company profile');
            }
        } catch (err) {
            console.error('Error creating company:', err);
            error('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    if (isChecking) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-green-50 to-lime-50 dark:from-gray-900/20 dark:to-gray-950">
                <div className="flex flex-col items-center space-y-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
                    <p className="text-gray-600 dark:text-gray-400 animate-pulse">Checking account status...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col bg-gradient-to-br from-green-50 to-lime-50 dark:from-gray-900/20 dark:to-gray-950">
            <main className="flex-1 p-4 flex items-center justify-center">
                <div className="container max-w-2xl py-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Setup Your Company Profile</h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Create a company profile to start posting jobs and interviewing candidates with AI.
                        </p>
                    </div>

                    <Card className="shadow-lg dark:bg-gray-800 border-green-200 dark:border-green-900/30">
                        <CardHeader>
                            <CardTitle>Company Details</CardTitle>
                            <CardDescription>
                                Tell us about your company. This information will be visible to candidates.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="company_name" className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Building2 className="h-4 w-4" /> Company Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="company_name"
                                        name="company_name"
                                        placeholder="Acme Inc."
                                        value={formData.company_name}
                                        onChange={handleChange}
                                        className="dark:bg-gray-700 dark:text-white"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="website_url" className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                            <Globe className="h-4 w-4" /> Website URL
                                        </Label>
                                        <Input
                                            id="website_url"
                                            name="website_url"
                                            placeholder="https://acme.com"
                                            value={formData.website_url}
                                            onChange={handleChange}
                                            className="dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="company_size" className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                            <Users className="h-4 w-4" /> Company Size
                                        </Label>
                                        <Select
                                            value={formData.company_size}
                                            onValueChange={(value) => handleSelectChange('company_size', value)}
                                        >
                                            <SelectTrigger className="dark:bg-gray-700 dark:text-white">
                                                <SelectValue placeholder="Select size" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1-10">1-10 employees</SelectItem>
                                                <SelectItem value="11-50">11-50 employees</SelectItem>
                                                <SelectItem value="51-200">51-200 employees</SelectItem>
                                                <SelectItem value="201-500">201-500 employees</SelectItem>
                                                <SelectItem value="500+">500+ employees</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="industry" className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Briefcase className="h-4 w-4" /> Industry
                                    </Label>
                                    <Select
                                        value={formData.industry}
                                        onValueChange={(value) => handleSelectChange('industry', value)}
                                    >
                                        <SelectTrigger className="dark:bg-gray-700 dark:text-white">
                                            <SelectValue placeholder="Select industry" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Technology">Technology</SelectItem>
                                            <SelectItem value="Finance">Finance</SelectItem>
                                            <SelectItem value="Healthcare">Healthcare</SelectItem>
                                            <SelectItem value="Education">Education</SelectItem>
                                            <SelectItem value="Retail">Retail</SelectItem>
                                            <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                                            <SelectItem value="Media">Media</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="company_description" className="text-gray-700 dark:text-gray-300">Description</Label>
                                    <Textarea
                                        id="company_description"
                                        name="company_description"
                                        placeholder="Briefly describe what your company does..."
                                        value={formData.company_description}
                                        onChange={handleChange}
                                        className="min-h-[100px] dark:bg-gray-700 dark:text-white"
                                    />
                                </div>

                                <div className="pt-4">
                                    <Button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-green-600 to-lime-500 text-gray-900 hover:opacity-90 transition-all shadow-lg hover:shadow-xl font-semibold"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Creating Profile...' : 'Create Company Profile'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
