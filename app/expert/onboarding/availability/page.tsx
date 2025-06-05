// app/expert/onboarding/availability/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AvailabilityOnboarding, { AvailabilityData } from '@/components/onboarding/steps/availability';
import { getCurrentUser, updateOnboardingStatus } from '@/lib/auth';

export default function AvailabilityOnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [initialData, setInitialData] = useState<Partial<AvailabilityData>>({});
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

        // Check if user has completed previous step (Calendly connection)
        // if (user.onboarding_step < 3) {
        //   router.push('/expert/onboarding/calendly');
        //   return;
        // }

        // Load simplified availability data
        await loadAvailabilityData(user.id);

      } catch (error) {
        console.error('Error loading user data:', error);
        router.push('/sign-in');
      } finally {
        setInitialLoading(false);
      }
    };

    loadUserData();
  }, [router]);

  const loadAvailabilityData = async (userId: string) => {
    try {
      // Fetch current availability status from simplified API
      const availabilityResponse = await fetch(`/api/calendly/fetch-availability?user_id=${userId}`);
      
      if (availabilityResponse.ok) {
        const availabilityData = await availabilityResponse.json();
        
        setInitialData({
          hasActiveEventTypes: availabilityData.hasActiveEventTypes || false,
          schedulingUrl: availabilityData.schedulingUrl || '',
        });
      } else {
        // Handle case where Calendly integration might be missing
        const errorData = await availabilityResponse.json();
        console.warn('Failed to load availability:', errorData.error);
        
        // Check if it's a missing integration issue
        if (availabilityResponse.status === 404) {
          // Redirect back to Calendly connection step
          router.push('/expert/onboarding/calendly?error=integration_missing');
          return;
        }
        
        // Set empty state for other errors
        setInitialData({
          hasActiveEventTypes: false,
          schedulingUrl: '',
        });
      }
    } catch (error) {
      console.error('Error loading availability data:', error);
      
      // Set empty state on error
      setInitialData({
        hasActiveEventTypes: false,
        schedulingUrl: '',
      });
    }
  };

  const handleSubmit = async (data: AvailabilityData) => {
    if (!userId) return;

    setLoading(true);

    try {
      // Validate that user has active event types
      if (!data.hasActiveEventTypes) {
        throw new Error('Please configure your availability in Calendly before continuing.');
      }

      // Simple validation check - just verify Calendly integration is working
      const validationResponse = await fetch(`/api/calendly/fetch-availability?user_id=${userId}`);
      
      if (!validationResponse.ok) {
        throw new Error('Unable to verify your Calendly integration. Please try refreshing.');
      }

      const validationData = await validationResponse.json();
      
      if (!validationData.hasActiveEventTypes) {
        throw new Error('No active event types found. Please configure your availability in Calendly.');
      }

      // Update onboarding step to 4 (next step - pricing/expertise)
      const stepUpdateSuccess = await updateOnboardingStatus(userId, 4);
      
      if (!stepUpdateSuccess) {
        console.warn('Failed to update onboarding progress, but continuing...');
      }

      console.log('Availability validation passed, proceeding to next step');

      // Navigate to next step (pricing/expertise configuration)
      router.push('/expert/onboarding/session-details'); // or whatever your next step is

    } catch (error) {
      console.error('Error validating availability:', error);
      alert(error instanceof Error ? error.message : 'An error occurred while validating your availability settings');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading your calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <AvailabilityOnboarding
          initialData={initialData}
          onSubmit={handleSubmit}
          isLoading={loading}
        />
      </div>
    </div>
  );
}