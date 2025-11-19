'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

interface FAQItem {
    question: string;
    answer: string | React.ReactNode;
}

interface CollapsibleFAQProps {
    title?: string;
    className?: string;
    showIcon?: boolean;
    variant?: 'default' | 'compact' | 'detailed';
}

export default function CollapsibleFAQ({
    title = "Frequently Asked Questions",
    className = "",
    showIcon = true,
    variant = 'default'
}: CollapsibleFAQProps) {
    const [openItems, setOpenItems] = useState<Set<number>>(new Set());

    const toggleItem = (index: number) => {
        const newOpenItems = new Set(openItems);
        if (openItems.has(index)) {
            newOpenItems.delete(index);
        } else {
            newOpenItems.add(index);
        }
        setOpenItems(newOpenItems);
    };

    const getFaqData = () => {
        // For landing page - more conversion focused
        if (variant === 'compact') {
            return [
                {
                    question: "How much does it cost?",
                    answer: "Your first interview is free! After that, you get 2 free credits daily, or purchase credits starting at $0.10 each. No credit card required to get started."
                },
                {
                    question: "What makes Ainterview different?",
                    answer: "Our AI is trained specifically on your target job and company, creating hyper-personalized interviews that mirror real hiring processes."
                },
                {
                    question: "Can I try it free?",
                    answer: "Yes! You get 5 free credits when you sign up, plus 2 additional free credits every day to continue practicing."
                },
                {
                    question: "How accurate is the feedback?",
                    answer: "Our AI is trained on thousands of successful interview responses and provides detailed, actionable feedback to help you improve."
                }
            ];
        }

        // For about page - more detailed and comprehensive
        if (variant === 'detailed') {
            return [
                {
                    question: "What makes Ainterview different from other interview prep tools?",
                    answer: "Ainterview uses AI specifically trained on your target job and company, providing hyper-personalized interview practice. Unlike generic question banks, our AI understands the specific role requirements and company culture you're interviewing for."
                },
                {
                    question: "How does the AI personalization work?",
                    answer: "Our AI analyzes the job posting, company information, and your background to generate relevant questions and provide contextually appropriate feedback. It learns from successful interview patterns to help you prepare more effectively."
                },
                {
                    question: "What types of questions will I be asked?",
                    answer: "You'll encounter behavioral questions, situational questions, and role-specific inquiries tailored to the job and company. The AI adapts based on the job requirements and industry standards."
                },
                {
                    question: "How much time should I dedicate to practice?",
                    answer: "Even 15-20 minutes of focused practice can be beneficial. However, regular practice (2-3 times per week) yields the best results in building confidence and improving your responses."
                },
                {
                    question: "Can I practice for multiple companies?",
                    answer: "Absolutely! Create separate interview sessions for each company you're applying to. Each session will generate different questions based on the specific job and company culture."
                }
            ];
        }

        // Default comprehensive FAQ
        return [
            {
                question: "What makes Ainterview different from other interview prep tools?",
                answer: "Ainterview uses AI specifically trained on your target job and company, providing hyper-personalized interview practice. Unlike generic question banks, our AI understands the specific role requirements and company culture you're interviewing for."
            },
            {
                question: "How many credits do I need for a full interview?",
                answer: "A standard 5-question interview costs 5 credits, and a 10-question interview costs 10 credits. You also get 2 free credits daily, plus your initial 5 credits when you register."
            },
            {
                question: "How accurate is the AI feedback?",
                answer: "Our AI uses advanced language models trained on thousands of successful interview responses. While it's highly accurate, it's designed to be a guide for improvement rather than a definitive assessment. Use it to identify patterns and areas for development."
            },
            {
                question: "Can I use Ainterview for any type of interview?",
                answer: "Ainterview currently focuses on behavioral and general interview questions. It's excellent for roles requiring communication skills, problem-solving, and cultural fit assessment. Technical role interviews may need additional preparation for role-specific questions."
            },
            {
                question: "Do unused credits expire?",
                answer: "No, purchased credits do not expire. You can use them anytime. Free daily credits must be claimed each day and cannot be accumulated."
            },
            {
                question: "Can I use Ainterview on mobile devices?",
                answer: "Ainterview is a Progressive Web App (PWA) that works on mobile browsers. For the best experience, we recommend using a desktop computer, but mobile access is available."
            },
            {
                question: "What if I don't want to use voice recording?",
                answer: "Voice recording is optional. You can always type your answers in the text area. The AI provides the same quality feedback for both voice and text responses."
            },
            {
                question: "How long should my answers be?",
                answer: "Aim for 1-3 minutes when speaking or 100-300 words when typing. The AI evaluates content quality over length, so focus on providing comprehensive, relevant responses."
            },
            {
                question: "How is my data protected?",
                answer: "We use industry-standard encryption and security measures. Your personal information and interview responses are stored securely and never shared with third parties."
            },
            {
                question: "How do I get the best results from Ainterview?",
                answer: (
                    <ol className="space-y-1">
                        <li>1. Complete your profile with detailed, accurate information</li>
                        <li>2. Research the company and role thoroughly</li>
                        <li>3. Practice regularly, not just before interviews</li>
                        <li>4. Review feedback carefully and implement suggestions</li>
                        <li>5. Use practice mode to focus on weak areas</li>
                    </ol>
                )
            }
        ];
    };

    const faqData = getFaqData();

    const getCardPadding = () => {
        switch (variant) {
            case 'compact':
                return 'p-4';
            case 'detailed':
                return 'p-8';
            default:
                return 'p-6';
        }
    };

    const getTextSize = () => {
        switch (variant) {
            case 'compact':
                return {
                    title: 'text-lg',
                    question: 'text-base',
                    answer: 'text-sm'
                };
            case 'detailed':
                return {
                    title: 'text-3xl',
                    question: 'text-xl',
                    answer: 'text-lg'
                };
            default:
                return {
                    title: 'text-2xl',
                    question: 'text-lg',
                    answer: 'text-base'
                };
        }
    };

    const textSize = getTextSize();

    return (
        <Card className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700 ${className}`}>
            <div className={getCardPadding()}>
                <div className="flex items-center gap-3 mb-6">
                    {showIcon && (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-green-700 to-lime-600 text-white">
                            <HelpCircle className="h-6 w-6" />
                        </div>
                    )}
                    <h2 className={`font-bold text-gray-900 dark:text-white ${textSize.title}`}>
                        {title}
                    </h2>
                </div>

                <div className="space-y-4">
                    {faqData.map((item, index) => (
                        <div
                            key={index}
                            className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden"
                        >
                            <Button
                                variant="ghost"
                                onClick={() => toggleItem(index)}
                                className="w-full justify-between p-4 h-auto text-left hover:bg-gray-50 dark:hover:bg-gray-700/50"
                            >
                                <span className={`font-semibold text-gray-900 dark:text-white ${textSize.question} pr-4`}>
                                    {item.question}
                                </span>
                                {openItems.has(index) ? (
                                    <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
                                ) : (
                                    <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                                )}
                            </Button>

                            {openItems.has(index) && (
                                <div className="px-4 pb-4 pt-0">
                                    <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                                        <div className={`text-gray-600 dark:text-gray-300 ${textSize.answer} leading-relaxed`}>
                                            {item.answer}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-8 text-center">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Have more questions? Visit our comprehensive help center.
                    </p>
                    <Button
                        variant="outline"
                        onClick={() => window.open('/help', '_blank')}
                        className="inline-flex items-center gap-2"
                    >
                        Visit Help Center
                    </Button>
                </div>
            </div>
        </Card>
    );
}