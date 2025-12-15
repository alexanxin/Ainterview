'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast';
import { getCompanyByUserId } from '@/lib/database';
import { createJobPost } from '../../actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Briefcase, MapPin, DollarSign, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import type { Company } from '@/types/b2b-types';

export default function NewJobPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const { success, error } = useToast();
    const [company, setCompany] = useState<Company | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        requirements: '',
        responsibilities: '',
        location: '',
        job_type: 'Remote',
        credit_cost_per_applicant: 1
    });

    useEffect(() => {
        const checkAccess = async () => {
            if (authLoading) return;

            if (!user) {
                router.push('/auth?redirect=/b2b/jobs/new');
                return;
            }

            try {
                const companyData = await getCompanyByUserId(user.id);
                if (!companyData) {
                    error('You must be a company admin to post jobs.');
                    router.push('/dashboard');
                    return;
                }
                setCompany(companyData);
            } catch (err) {
                console.error('Error checking company access:', err);
                error('Failed to verify permissions.');
            } finally {
                setLoading(false);
            }
        };

        checkAccess();
    }, [user, authLoading, router, error]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!company || !user) return;

        setSubmitting(true);
        try {
            await createJobPost(company.id, {
                ...formData,
                posted_by: user.id
            });
            success('Job posted successfully!');
            router.push('/b2b/dashboard');
        } catch (err) {
            console.error('Error creating job post:', err);
            error('Failed to create job post. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading || authLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col bg-gradient-to-br from-green-50 to-lime-50 dark:from-gray-900/20 dark:to-gray-950">
            <main className="flex-1 p-4">
                <div className="container mx-auto max-w-3xl py-8">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="mb-6 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </Button>

                    <Card className="dark:bg-gray-800 border-green-200 dark:border-green-900/30 shadow-lg">
                        <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50">
                            <CardTitle className="text-2xl flex items-center gap-2 text-gray-900 dark:text-white">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                    <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                Post a New Job
                            </CardTitle>
                            <CardDescription className="text-gray-600 dark:text-gray-400 ml-12">
                                Create a new AI-powered job posting to find your next great hire.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="title" className="text-gray-700 dark:text-gray-300">Job Title</Label>
                                    <Input
                                        id="title"
                                        name="title"
                                        placeholder="e.g. Senior Software Engineer"
                                        required
                                        value={formData.title}
                                        onChange={handleChange}
                                        className="dark:bg-gray-900 dark:border-gray-700"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="location" className="text-gray-700 dark:text-gray-300">Location</Label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                                            <Input
                                                id="location"
                                                name="location"
                                                className="pl-9 dark:bg-gray-900 dark:border-gray-700"
                                                placeholder="e.g. New York, NY or Remote"
                                                required
                                                value={formData.location}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="job_type" className="text-gray-700 dark:text-gray-300">Job Type</Label>
                                        <Select
                                            value={formData.job_type}
                                            onValueChange={(val) => handleSelectChange('job_type', val)}
                                        >
                                            <SelectTrigger className="dark:bg-gray-900 dark:border-gray-700">
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Remote">Remote</SelectItem>
                                                <SelectItem value="On-site">On-site</SelectItem>
                                                <SelectItem value="Hybrid">Hybrid</SelectItem>
                                                <SelectItem value="Contract">Contract</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description" className="text-gray-700 dark:text-gray-300">Job Description</Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        placeholder="Describe the role and responsibilities..."
                                        className="min-h-[150px] dark:bg-gray-900 dark:border-gray-700"
                                        required
                                        value={formData.description}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="requirements" className="text-gray-700 dark:text-gray-300">Requirements</Label>
                                        <Textarea
                                            id="requirements"
                                            name="requirements"
                                            placeholder="List keys skills..."
                                            className="min-h-[120px] dark:bg-gray-900 dark:border-gray-700"
                                            value={formData.requirements}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="responsibilities" className="text-gray-700 dark:text-gray-300">Responsibilities</Label>
                                        <Textarea
                                            id="responsibilities"
                                            name="responsibilities"
                                            placeholder="Day-to-day tasks..."
                                            className="min-h-[120px] dark:bg-gray-900 dark:border-gray-700"
                                            value={formData.responsibilities}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-800">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="credit_cost_per_applicant" className="text-gray-700 dark:text-gray-300">Credits Per Applicant</Label>
                                            <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full dark:bg-green-900/30 dark:text-green-300">Default: 1</span>
                                        </div>
                                        <Input
                                            id="credit_cost_per_applicant"
                                            name="credit_cost_per_applicant"
                                            type="number"
                                            min="1"
                                            value={formData.credit_cost_per_applicant}
                                            onChange={handleChange}
                                            className="dark:bg-gray-900 dark:border-gray-700"
                                        />
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Credits deducted from company balance when viewing a full application.</p>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.back()}
                                        className="mr-4"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="bg-blue-600 hover:bg-blue-700 text-white min-w-[150px]"
                                        disabled={submitting}
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                Post Job
                                            </>
                                        )}
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
