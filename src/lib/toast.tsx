'use client';

import { toast } from 'sonner';

export const useToast = () => {
  const success = (message: string) => {
    toast.success(message, {
      style: {
        background: '#1F2937', // gray-800 (card background)
        color: '#10B981', // green-500 (text color)
        border: '1px solid #374151', // gray-700
      },
      unstyled: false,
      duration: 4000, // Show for 4 seconds
      position: 'top-right', // Position to avoid stacking conflicts
    });
  };

  const error = (message: string) => {
    toast.error(message, {
      style: {
        background: '#1F2937', // gray-800 (card background)
        color: '#EF4444', // red-500 (text color)
        border: '1px solid #374151', // gray-700
      },
      unstyled: false,
      duration: 6000, // Show errors longer (6 seconds) since they need attention
      position: 'top-right',
    });
  };

  const info = (message: string) => {
    toast(message, {
      style: {
        background: '#1F2937', // gray-800 (card background)
        color: '#3B82F6', // blue-500 (text color)
        border: '1px solid #374151', // gray-700
      },
      unstyled: false,
      duration: 3000, // Show info messages for 3 seconds
      position: 'top-right',
    });
  };

  const warning = (message: string) => {
    toast.warning(message, {
      style: {
        background: '#1F2937', // gray-800 (card background)
        color: '#F59E0B', // amber-500 (text color)
        border: '1px solid #374151', // gray-700
      },
      unstyled: false,
      duration: 5000, // Show warnings for 5 seconds
      position: 'top-right',
    });
  };

  return {
    success,
    error,
    info,
    warning,
  };
};