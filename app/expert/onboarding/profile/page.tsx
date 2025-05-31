// app/expert/onboarding/profile/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProfileOnboarding from '@/components/onboarding/profile';
import { getCurrentUser, getUserProfile, updateOnboardingStatus } from '@/lib/auth';
import { ONBOARDING_STEPS } from '@/lib/onboarding-steps';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  professionalHeadline: string;
  bio: string;
}

export default function ProfileOnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [initialData, setInitialData] = useState<Partial<ProfileFormData>>({});
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = await getCurrentUser();
        
        if (!user) {
          router.push('/sign-in');
          return;
        }

        setUserId(user.id);
        
        const profile = await getUserProfile(user.id);
        
        setInitialData({
          firstName: profile?.first_name || user.user_metadata?.first_name || '',
          lastName: profile?.last_name || user.user_metadata?.last_name || '',
          email: user.email || '',
          professionalHeadline: profile?.professional_headline || '',
          bio: profile?.bio || '',
        });
      } catch (error) {
        console.error('Error loading user data:', error);
        router.push('/sign-in');
      } finally {
        setInitialLoading(false);
      }
    };

    loadUserData();
  }, [router]);

  const handleSubmit = async (data: ProfileFormData) => {
    if (!userId) return;
    
    setLoading(true);

    try {
      // TODO: Update user profile in database with form data
      console.log('Updating profile with data:', data);

      // Update onboarding step
      await updateOnboardingStatus(userId, ONBOARDING_STEPS.expertise);

      // Navigate to next step
      router.push('/expert/onboarding/expertise');
    } catch (error) {
      console.error('Error updating profile:', error);
      // TODO: Show error toast
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ProfileOnboarding
      initialData={initialData}
      onSubmit={handleSubmit}
      isLoading={loading}
    />
  );
}