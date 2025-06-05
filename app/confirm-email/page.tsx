// app/confirm-email/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import EmailConfirmation from '@/components/auth/email-confirmation';
import { getCurrentUser } from '@/lib/auth';

export default function ConfirmEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState<string | null>(null);
  const [userType, setUserType] = useState<'client' | 'expert' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserAndLoadData = async () => {
      try {
        // Get email and user type from URL params (passed from signup)
        const emailParam = searchParams.get('email');
        const typeParam = searchParams.get('type') as 'client' | 'expert';
        
        setEmail(emailParam);
        setUserType(typeParam);

        // Check if user is already confirmed
        const user = await getCurrentUser();
        
        if (user?.email_confirmed_at) {
          console.log('User already confirmed, redirecting...');
          
          // User is already confirmed, redirect appropriately
          const redirectTo = typeParam === 'expert' 
            ? '/expert/onboarding/profile' 
            : '/';
            
          router.push(redirectTo);
          return;
        }

        // If no email in params and no current user, redirect to sign up
        if (!emailParam && !user?.email) {
          console.log('No email found, redirecting to get started');
          router.push('/get-started');
          return;
        }

        // Use current user email if no param email
        if (!emailParam && user?.email) {
          setEmail(user.email);
        }

      } catch (error) {
        console.error('Error checking user confirmation status:', error);
        // On error, redirect to sign in
        router.push('/sign-in');
      } finally {
        setLoading(false);
      }
    };

    checkUserAndLoadData();
  }, [router, searchParams]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <EmailConfirmation 
      email={email || undefined}
      userType={userType || undefined}
    />
  );
}