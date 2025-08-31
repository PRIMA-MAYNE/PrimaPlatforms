import React, { useEffect } from 'react';
import { clearAuthData, handleAuthError } from '@/lib/auth-utils';
import { toast } from '@/hooks/use-toast';

interface AuthErrorBoundaryProps {
  children: React.ReactNode;
}

export const AuthErrorBoundary: React.FC<AuthErrorBoundaryProps> = ({ children }) => {
  useEffect(() => {
    // Listen for unhandled promise rejections that might be auth-related
    const handleRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason;

      if (error && typeof error === 'object' && (error as any).message) {
        if (handleAuthError(error)) {
          event.preventDefault(); // Prevent the error from being logged

          toast({
            title: 'Session expired',
            description: 'Please sign in again to continue.',
            variant: 'destructive',
          });

          // Refresh the page to clear any stale state
          setTimeout(() => {
            window.location.href = '/signin';
          }, 2000);
        }
      }
    };

    // Listen for auth-related errors in console
    const originalError = console.error;
    console.error = (...args: any[]) => {
      const message = args.map(String).join(' ');
      if (message.includes('Invalid Refresh Token') || message.includes('AuthApiError')) {
        clearAuthData();
        toast({
          title: 'Authentication error',
          description: 'Your session has expired. Please sign in again.',
          variant: 'destructive',
        });
        return; // Don't log the error
      }
      originalError.apply(console, args as any);
    };

    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('unhandledrejection', handleRejection);
      console.error = originalError;
    };
  }, []);

  return <>{children}</>;
};

export default AuthErrorBoundary;
