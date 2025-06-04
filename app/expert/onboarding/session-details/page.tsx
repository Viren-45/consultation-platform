// app/expert/onboarding/session-details/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SessionDetailsOnboarding, { SessionDetailsData } from '@/components/onboarding/steps/session-details';
import { getCurrentUser, updateOnboardingStatus } from '@/lib/auth';

export default function SessionDetailsOnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [initialData, setInitialData] = useState<Partial<SessionDetailsData>>({});
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

        // Check if user has completed previous step (availability)
        // if (user.onboarding_step < 4) {
        //   router.push('/expert/onboarding/availability');
        //   return;
        // }

        // Load existing session details if any
        await loadSessionDetails(user.id);

      } catch (error) {
        console.error('Error loading user data:', error);
        router.push('/sign-in');
      } finally {
        setInitialLoading(false);
      }
    };

    loadUserData();
  }, [router]);

  const loadSessionDetails = async (userId: string) => {
    try {
      // Fetch existing availability settings from our database
      const response = await fetch(`/api/expert/availability?user_id=${userId}`);
      
      if (response.ok) {
        const data = await response.json();
        const availability = data.availability;
        
        if (availability) {
          setInitialData({
            sessionPrice: availability.session_price || 75,
            isFreeSession: availability.session_price === 0,
            sessionDuration: availability.session_duration || 30,
            sessionTitle: availability.title || 'Expert Consultation',
            sessionDescription: availability.description || 'Professional consultation session to help solve your specific challenges and provide expert guidance.',
          });
        }
      } else {
        console.warn('No existing session details found, using defaults');
        // Set default values
        setInitialData({
          sessionPrice: 75,
          isFreeSession: false,
          sessionDuration: 30,
          sessionTitle: 'Expert Consultation',
          sessionDescription: 'Professional consultation session to help solve your specific challenges and provide expert guidance.',
        });
      }
    } catch (error) {
      console.error('Error loading session details:', error);
      
      // Set default values on error
      setInitialData({
        sessionPrice: 75,
        isFreeSession: false,
        sessionDuration: 30,
        sessionTitle: 'Expert Consultation',
        sessionDescription: 'Professional consultation session to help solve your specific challenges and provide expert guidance.',
      });
    }
  };

  const handleSubmit = async (data: SessionDetailsData) => {
    if (!userId) return;

    setLoading(true);

    try {
      // Update session details in expert_availability table
      const updatePayload = {
        user_id: userId,
        session_duration: data.sessionDuration,
        session_price: data.isFreeSession ? 0 : data.sessionPrice,
        title: data.sessionTitle,
        description: data.sessionDescription,
      };

      console.log('Updating session details:', updatePayload);

      const response = await fetch('/api/expert/availability', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save session details');
      }

      // Update onboarding step to 5 (next step)
      const stepUpdateSuccess = await updateOnboardingStatus(userId, 5);
      
      if (!stepUpdateSuccess) {
        console.warn('Failed to update onboarding progress, but continuing...');
      }

      console.log('Session details saved successfully');

      // Navigate to next step
      router.push('/expert/onboarding/processing');
      
    } catch (error) {
      console.error('Error saving session details:', error);
      alert(error instanceof Error ? error.message : 'An error occurred while saving your session details');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading session details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <SessionDetailsOnboarding
          initialData={initialData}
          onSubmit={handleSubmit}
          isLoading={loading}
        />
      </div>
    </div>
  );
}