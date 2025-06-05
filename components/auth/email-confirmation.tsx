// components/auth/email-confirmation.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Mail, 
  CheckCircle, 
  RefreshCw, 
  AlertCircle,
  ArrowRight 
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/auth';
import supabase from '@/lib/supabase-client';

interface EmailConfirmationProps {
  email?: string;
  userType?: 'client' | 'expert';
}

const EmailConfirmation = ({ email, userType }: EmailConfirmationProps) => {
  const router = useRouter();
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [autoCheckCount, setAutoCheckCount] = useState(0);

  // Auto-check confirmation status every 5 seconds (limited attempts)
  useEffect(() => {
    if (autoCheckCount >= 12) return; // Stop after 1 minute

    const interval = setInterval(async () => {
      setAutoCheckCount(prev => prev + 1);
      await checkConfirmationStatus(false); // Silent check
    }, 5000);

    return () => clearInterval(interval);
  }, [autoCheckCount]);

  const handleResendEmail = async () => {
    if (!email) {
      setResendError('Email address not available. Please try signing up again.');
      return;
    }

    setIsResending(true);
    setResendError(null);
    setResendSuccess(false);

    try {
      const response = await fetch('/api/auth/resend-confirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (result.success) {
        setResendSuccess(true);
        // Reset auto-check counter to give more time
        setAutoCheckCount(0);
      } else {
        setResendError(result.error || 'Failed to resend confirmation email');
      }
    } catch (error) {
      console.error('Error resending confirmation:', error);
      setResendError('An unexpected error occurred. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const checkConfirmationStatus = async (showLoading = true) => {
    if (showLoading) setIsCheckingStatus(true);
    
    try {
      await supabase.auth.refreshSession();
      const user = await getCurrentUser();
      
      if (user?.email_confirmed_at) {
        console.log('Email confirmed! Redirecting user...');
        
        // Redirect based on user type
        const redirectTo = userType === 'expert' 
          ? '/expert/onboarding/profile' 
          : '/';
          
        router.push(redirectTo);
        return;
      }
      
      if (showLoading) {
        // Show feedback for manual check
        setResendError('Email not yet confirmed. Please check your email and click the confirmation link.');
      }
    } catch (error) {
      console.error('Error checking confirmation status:', error);
      if (showLoading) {
        setResendError('Error checking confirmation status. Please try again.');
      }
    } finally {
      if (showLoading) setIsCheckingStatus(false);
    }
  };

  const handleBackToSignIn = () => {
    router.push('/sign-in');
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Check your email
          </h1>
          <p className="text-gray-600 text-lg">
            We've sent a confirmation link to
          </p>
          {email && (
            <p className="text-blue-600 font-semibold mt-1">
              {email}
            </p>
          )}
        </div>

        {/* Confirmation card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          {/* Instructions */}
          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-blue-600 text-sm font-semibold">1</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Check your inbox</p>
                <p className="text-sm text-gray-600">
                  Look for an email from us with the subject "Confirm your email"
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-blue-600 text-sm font-semibold">2</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Click the confirmation link</p>
                <p className="text-sm text-gray-600">
                  This will verify your email and activate your account
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-blue-600 text-sm font-semibold">3</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Return to complete setup</p>
                <p className="text-sm text-gray-600">
                  {userType === 'expert' 
                    ? 'Complete your expert onboarding to start earning'
                    : 'Start connecting with experts for your challenges'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {resendSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-green-700 font-medium">Email sent successfully!</p>
                <p className="text-green-600 text-sm">
                  Check your inbox for the new confirmation email.
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {resendError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-red-700 text-sm">{resendError}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => checkConfirmationStatus(true)}
              disabled={isCheckingStatus}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              {isCheckingStatus ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  I've confirmed my email
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>

            <Button
              onClick={handleResendEmail}
              disabled={isResending}
              variant="outline"
              className="w-full h-12 border-gray-200 hover:bg-gray-50"
            >
              {isResending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Resend confirmation email
                </>
              )}
            </Button>
          </div>

          {/* Help Text */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-3">
                Don't see the email? Check your spam folder or try a different email address.
              </p>
              <button
                onClick={handleBackToSignIn}
                className="text-blue-600 hover:text-blue-500 font-medium text-sm"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        </div>

        {/* Auto-check indicator */}
        {autoCheckCount < 12 && (
          <div className="text-center mt-6">
            <p className="text-xs text-gray-500">
              Automatically checking for confirmation...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailConfirmation;