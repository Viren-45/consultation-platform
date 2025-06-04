// app/expert/onboarding/availability/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import CalendlyOnboarding, { CalendlyData } from '@/components/onboarding/steps/calendly';
import { getCurrentUser, updateOnboardingStatus } from '@/lib/auth';

export default function AvailabilityOnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [initialData, setInitialData] = useState<Partial<CalendlyData>>({});
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

        // Check if user just connected Calendly (from OAuth callback)
        const calendlyConnected = searchParams.get('calendly_connected') === 'true';
        
        // Check current Calendly integration status
        const response = await fetch(`/api/calendly/integration?user_id=${user.id}`);
        if (response.ok) {
          const integrationData = await response.json();
          
          setInitialData({
            calendlyConnected: integrationData.connected || calendlyConnected,
            calendlyUrl: integrationData.integration?.schedulingUrl || '',
            calendlyUsername: integrationData.integration?.username || '',
          });
        } else {
          // If API call fails, use URL params
          setInitialData({
            calendlyConnected: calendlyConnected,
            calendlyUrl: calendlyConnected ? 'https://calendly.com/your-username' : '',
            calendlyUsername: '',
          });
        }

        // Handle OAuth error states
        const error = searchParams.get('error');
        if (error) {
          console.error('OAuth error:', error);
          // TODO: Show error toast based on error type
          switch (error) {
            case 'oauth_failed':
              alert('Failed to connect to Calendly. Please try again.');
              break;
            case 'callback_failed':
              alert('Something went wrong during the connection process. Please try again.');
              break;
            case 'missing_params':
              alert('Authentication failed. Please try connecting again.');
              break;
            default:
              alert('An error occurred while connecting to Calendly.');
          }
        }

      } catch (error) {
        console.error('Error loading user data:', error);
        router.push('/sign-in');
      } finally {
        setInitialLoading(false);
      }
    };

    loadUserData();
  }, [router, searchParams]);

  const handleSubmit = async (data: CalendlyData) => {
    if (!userId) return;

    setLoading(true);

    try {
      // Validate that Calendly is connected
      if (!data.calendlyConnected) {
        throw new Error('Please connect your Calendly account before continuing.');
      }

      // Save availability data to expert_availability table
      const availabilityResponse = await fetch('/api/expert/calendly', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          calendly_connected: data.calendlyConnected,
          calendly_url: data.calendlyUrl,
          calendly_username: data.calendlyUsername,
          // Default values for now - can be customized later
          session_duration: 30,
          session_price: 75.00,
          title: "Expert Consultation",
          description: "Professional consultation session",
          is_active: true,
        }),
      });

      if (!availabilityResponse.ok) {
        const errorData = await availabilityResponse.json();
        throw new Error(errorData.error || 'Failed to save availability settings');
      }

      // Update onboarding step to 3 (next step)
      const stepUpdateSuccess = await updateOnboardingStatus(userId, 3);
      
      if (!stepUpdateSuccess) {
        throw new Error('Failed to update onboarding progress');
      }

      // Navigate to next step
      router.push('/expert/onboarding/availability');
      
    } catch (error) {
      console.error('Error saving availability:', error);
      alert(error instanceof Error ? error.message : 'An error occurred while saving your availability settings');
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <CalendlyOnboarding
          initialData={initialData}
          onSubmit={handleSubmit}
          isLoading={loading}
        />
      </div>
    </div>
  );
}