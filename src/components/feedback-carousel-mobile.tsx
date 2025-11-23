'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface FeedbackItem {
    id: string;
    question: string;
    answer: string;
    feedback: string;
    suggestions: string[];
    rating: number;
    date: string;
}

interface MobileFeedbackCarouselProps {
    feedbackItems: FeedbackItem[];
    onPracticeClick: (question: string) => void;
}

export default function MobileFeedbackCarousel({ feedbackItems, onPracticeClick }: MobileFeedbackCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const touchStartX = useRef<number>(0);
    const touchEndX = useRef<number>(0);

    const handleNext = () => {
        if (currentIndex < feedbackItems.length - 1 && !isTransitioning) {
            setIsTransitioning(true);
            setCurrentIndex(prev => prev + 1);
            setTimeout(() => setIsTransitioning(false), 300);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0 && !isTransitioning) {
            setIsTransitioning(true);
            setCurrentIndex(prev => prev - 1);
            setTimeout(() => setIsTransitioning(false), 300);
        }
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.targetTouches[0].clientX;
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        touchEndX.current = e.changedTouches[0].clientX;
        handleSwipe();
    };

    const handleSwipe = () => {
        const distance = touchStartX.current - touchEndX.current;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        if (isLeftSwipe && currentIndex < feedbackItems.length - 1) {
            handleNext();
        } else if (isRightSwipe && currentIndex > 0) {
            handlePrev();
        }
    };

    if (feedbackItems.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No feedback items yet
            </div>
        );
    }

    const currentItem = feedbackItems[currentIndex];

    return (
        <div className="relative lg:hidden">
            {/* Progress dots */}
            <div className="flex justify-center mb-4">
                {feedbackItems.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`h-2 w-2 rounded-full mx-1 transition-all ${index === currentIndex
                            ? 'bg-green-600 w-8'
                            : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                    />
                ))}
            </div>

            {/* Carousel container */}
            <div
                className="overflow-hidden relative"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                <div
                    className={`flex transition-transform duration-300 ease-in-out`}
                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                    {feedbackItems.map((item, index) => (
                        <div key={item.id} className="w-full flex-shrink-0 pr-4">
                            <Card className={`dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-lg ${index === currentIndex ? 'ring-2 ring-green-500/20' : ''}`}>
                                <CardHeader className="border-b border-gray-200 dark:border-gray-700 relative">
                                    <CardTitle className="text-gray-900 dark:text-white text-lg">
                                        {item.question}
                                    </CardTitle>
                                    <div className="absolute top-4 right-4">
                                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${item.rating >= 8
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                            : item.rating >= 6
                                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                            }`}>
                                            {item.rating}/10
                                        </span>
                                    </div>
                                </CardHeader>

                                <CardContent className="p-4">
                                    <details className="mb-4">
                                        <summary className="cursor-pointer font-semibold text-gray-700 dark:text-gray-300 mb-2 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                                            Your Answer
                                        </summary>
                                        <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl border border-gray-200 dark:border-gray-600">
                                            <p className="text-gray-900 dark:text-gray-200 text-sm leading-relaxed">
                                                {item.answer}
                                            </p>
                                        </div>
                                    </details>

                                    <details className="mb-4">
                                        <summary className="cursor-pointer font-semibold text-gray-700 dark:text-gray-300 mb-2 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                                            AI Feedback
                                        </summary>
                                        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-xl border border-green-200 dark:border-green-700">
                                            <p className="text-gray-900 dark:text-gray-200 text-sm leading-relaxed">
                                                {item.feedback}
                                            </p>
                                        </div>
                                    </details>

                                    {item.suggestions && item.suggestions.length > 0 && (
                                        <details className="mb-4">
                                            <summary className="cursor-pointer font-semibold text-gray-700 dark:text-gray-300 mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                                Improvement Suggestions
                                            </summary>
                                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-200 dark:border-blue-700">
                                                <ul className="space-y-2">
                                                    {item.suggestions.map((suggestion, idx) => (
                                                        <li key={idx} className="flex items-start">
                                                            <span className="mr-2 text-blue-500 dark:text-blue-400 text-xs">•</span>
                                                            <span className="text-gray-900 dark:text-gray-200 text-sm">{suggestion}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </details>
                                    )}

                                    <div className="flex justify-center mt-4">
                                        <Button
                                            onClick={() => onPracticeClick(item.question)}
                                            className="bg-gradient-to-r from-green-600 to-lime-500 hover:opacity-90 text-white px-6 py-2 min-h-[44px]"
                                        >
                                            Practice Similar Question
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation arrows */}
            {currentIndex > 0 && (
                <Button
                    onClick={handlePrev}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 shadow-lg"
                    size="sm"
                    disabled={isTransitioning}
                    aria-label="Previous feedback item"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
            )}

            {currentIndex < feedbackItems.length - 1 && (
                <Button
                    onClick={handleNext}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 shadow-lg"
                    size="sm"
                    disabled={isTransitioning}
                    aria-label="Next feedback item"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            )}
        </div>
    );
}
