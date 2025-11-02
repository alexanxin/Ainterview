'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Navigation from '@/components/navigation';

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    bio: 'Senior software engineer with 5+ years of experience in web development and AI integration.',
    experience: 'Senior Developer at TechCorp\n• Led development of AI-powered tools\n• Improved system efficiency by 40%\n\nSoftware Engineer at StartupXYZ\n• Developed core product features\n• Reduced load times by 30%',
    education: 'M.S. Computer Science, Stanford University\nB.S. Software Engineering, UC Berkeley',
    skills: 'JavaScript, TypeScript, React, Node.js, Python, AI/ML, System Design',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Profile updated:', formData);
    alert('Profile updated successfully!');
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-green-50 to-lime-50 dark:from-gray-900/20 dark:to-gray-950">
      <Navigation />
      <main className="flex-1 p-4">
        <div className="container mx-auto max-w-4xl py-8">
          <Card className="shadow-xl dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                My Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-gray-700 dark:text-gray-300">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-gray-700 dark:text-gray-300">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-gray-700 dark:text-gray-300">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    className="min-h-[100px] dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience" className="text-gray-700 dark:text-gray-300">Experience</Label>
                  <Textarea
                    id="experience"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className="min-h-[150px] dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="education" className="text-gray-700 dark:text-gray-300">Education</Label>
                  <Textarea
                    id="education"
                    name="education"
                    value={formData.education}
                    onChange={handleChange}
                    className="min-h-[100px] dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skills" className="text-gray-700 dark:text-gray-300">Skills</Label>
                  <Textarea
                    id="skills"
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    className="dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit">Save Profile</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}