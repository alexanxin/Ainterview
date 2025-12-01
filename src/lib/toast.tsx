'use client';

// Temporarily disabled Sonner due to DOM manipulation issues
// import { toast } from 'sonner';

export const useToast = () => {
  const success = (message: string) => {
    // Temporarily using console.log instead of toast to avoid DOM issues
    console.log('✅ Success:', message);
  };

  const error = (message: string) => {
    console.error('❌ Error:', message);
  };

  const info = (message: string) => {
    console.info('ℹ️ Info:', message);
  };

  const warning = (message: string) => {
    console.warn('⚠️ Warning:', message);
  };

  return {
    success,
    error,
    info,
    warning,
  };
};
