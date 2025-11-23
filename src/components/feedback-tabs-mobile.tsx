'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, TrendingUp, BarChart3 } from 'lucide-react';

interface MobileFeedbackTabsProps {
    activeTab: 'sessions' | 'feedback' | 'insights';
    onTabChange: (tab: 'sessions' | 'feedback' | 'insights') => void;
}

export default function MobileFeedbackTabs({ activeTab, onTabChange }: MobileFeedbackTabsProps) {
    return (
        <Card className="lg:hidden fixed bottom-0 left-0 right-0 z-50 rounded-none border-t border-l-0 border-r-0 border-b-0 bg-white/95 backdrop-blur-sm dark:bg-gray-900/95 dark:border-gray-700 safe-area-inset-bottom">
            <div className="flex">
                <Button
                    variant={activeTab === 'sessions' ? 'default' : 'ghost'}
                    className={`flex-1 flex-col h-16 gap-1 rounded-none border-0 ${activeTab === 'sessions'
                            ? 'bg-gradient-to-t from-green-600 to-lime-500 text-white'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                    onClick={() => onTabChange('sessions')}
                >
                    <FileText className="h-5 w-5" />
                    <span className="text-xs">Sessions</span>
                </Button>

                <Button
                    variant={activeTab === 'feedback' ? 'default' : 'ghost'}
                    className={`flex-1 flex-col h-16 gap-1 rounded-none border-0 ${activeTab === 'feedback'
                            ? 'bg-gradient-to-t from-green-600 to-lime-500 text-white'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                    onClick={() => onTabChange('feedback')}
                >
                    <TrendingUp className="h-5 w-5" />
                    <span className="text-xs">Feedback</span>
                </Button>

                <Button
                    variant={activeTab === 'insights' ? 'default' : 'ghost'}
                    className={`flex-1 flex-col h-16 gap-1 rounded-none border-0 ${activeTab === 'insights'
                            ? 'bg-gradient-to-t from-green-600 to-lime-500 text-white'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                    onClick={() => onTabChange('insights')}
                >
                    <BarChart3 className="h-5 w-5" />
                    <span className="text-xs">Insights</span>
                </Button>
            </div>
        </Card>
    );
}
