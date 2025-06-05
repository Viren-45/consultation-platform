// app/auth/callback/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { getRedirectUrlAfterConfirmation } from '@/lib/email-confirmation';
import { getCurrentUser } from '@/lib/auth';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Processing auth callback...');

        // Check for error parameters
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        if (error) {
          console.error('Auth callback error:', error, errorDescription);
          setStatus('error');
          setMessage(errorDescription || 'Email confirmation failed. Please try again.');
          return;
        }

        // Wait a moment for auth state to update
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Get current user to check confirmation status
        const user = await getCurrentUser();

        if (!user) {
          console.error('No user found after callback');
          setStatus('error');
          setMessage('Authentication failed. Please try signing in again.');
          return;
        }

        if (!user.email_confirmed_at) {
          console.error('User email still not confirmed');
          setStatus('error');
          setMessage('Email confirmation incomplete. Please check your email again.');
          return;
        }

        // Email is confirmed, determine redirect URL
        console.log('Email confirmed successfully, determining redirect...');
        const redirectUrl = await getRedirectUrlAfterConfirmation(user.id);

        setStatus('success');
        setMessage('Email confirmed successfully! Redirecting...');

        // Redirect after a short delay to show success message
        setTimeout(() => {
          router.push(redirectUrl);
        }, 2000);

      } catch (error) {
        console.error('Error processing auth callback:', error);
        setStatus('error');
        setMessage('An unexpected error occurred. Please try again.');
      }
    };

    handleAuthCallback();
  }, [router, searchParams]);

  const handleRetrySignIn = () => {
    router.push('/sign-in');
  };

  const handleBackToConfirmation = () => {
    router.push('/confirm-email');
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
          
          {/* Loading State */}
          {status === 'loading' && (
            <>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Loader className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                Confirming your email...
              </h1>
              <p className="text-gray-600">
                Please wait while we verify your email address.
              </p>
            </>
          )}

          {/* Success State */}
          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                Email Confirmed!
              </h1>
              <p className="text-gray-600 mb-4">
                {message}
              </p>
              <div className="animate-pulse">
                <div className="w-32 h-2 bg-green-200 rounded mx-auto"></div>
              </div>
            </>
          )}

          {/* Error State */}
          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                Confirmation Failed
              </h1>
              <p className="text-gray-600 mb-6">
                {message}
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={handleRetrySignIn}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  Try Signing In
                </button>
                <button
                  onClick={handleBackToConfirmation}
                  className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  Request New Confirmation Email
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}