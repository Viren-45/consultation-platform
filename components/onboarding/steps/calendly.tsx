// components/onboarding/steps/availability.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Add this import
import { 
  ChevronRight,
  Calendar,
  CheckCircle,
  ExternalLink,
  AlertCircle,
  Zap,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/auth';

export interface CalendlyData {
  calendlyConnected: boolean;
  calendlyUrl?: string;
  calendlyUsername?: string;
}

interface CalendlyOnboardingProps {
  initialData?: Partial<CalendlyData>;
  onSubmit: (data: CalendlyData) => void;
  isLoading?: boolean;
}

const CalendlyOnboarding = ({ 
  initialData, 
  onSubmit, 
  isLoading = false 
}: CalendlyOnboardingProps) => {
  const router = useRouter(); // Add router
  const [calendlyConnected, setCalendlyConnected] = useState(
    initialData?.calendlyConnected || false
  );
  const [calendlyUrl, setCalendlyUrl] = useState(
    initialData?.calendlyUrl || ''
  );
  const [calendlyUsername, setCalendlyUsername] = useState(
    initialData?.calendlyUsername || ''
  );

  const handleCalendlyConnect = async () => {
    // Get current user first
    const user = await getCurrentUser();
    if (!user) {
      alert('Please log in first');
      return;
    }
    
    // Redirect to Calendly OAuth
    window.location.href = `/api/auth/calendly-oauth?user_id=${user.id}`;
  };

  const handleCalendlyDisconnect = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        alert('Please log in first');
        return;
      }
      
      const response = await fetch(`/api/calendly/integration?user_id=${user.id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Update local state
        setCalendlyConnected(false);
        setCalendlyUrl('');
        setCalendlyUsername('');
        
        // IMPORTANT: Clean up the URL by removing query parameters
        // This removes calendly_connected=true from the URL
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.delete('calendly_connected');
        currentUrl.searchParams.delete('error');
        
        // Update URL without page reload
        router.replace(currentUrl.pathname);
        
        console.log('Calendly disconnected successfully');
      } else {
        throw new Error('Failed to disconnect');
      }
    } catch (error) {
      console.error('Error disconnecting Calendly:', error);
      alert('Failed to disconnect Calendly. Please try again.');
    }
  };

  const handleSubmit = () => {
    // Validate Calendly connection
    if (!calendlyConnected) {
      alert('Please connect your Calendly account before continuing.');
      return;
    }

    const submitData: CalendlyData = {
      calendlyConnected,
      calendlyUrl,
      calendlyUsername,
    };
    
    onSubmit(submitData);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100/60 border border-blue-200/40">
          <div className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
            STEP 2 OF 6
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">
          Set Your Availability
        </h1>
        <p className="text-lg text-gray-600">
          Connect your Calendly account to manage your consultation availability and start accepting bookings.
        </p>
      </div>

      {/* Calendly Integration Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
          <div className="p-2 rounded-lg bg-blue-50">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Calendar Integration</h2>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-6 border border-blue-200/50">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center border border-blue-200/50">
                {/* Calendly Logo/Icon */}
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="#3B82F6" strokeWidth="2" fill="none"/>
                  <path d="M12 6v6l4 2" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">Calendly</h3>
                {calendlyConnected && (
                  <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                    <CheckCircle className="w-3 h-3" />
                    Connected
                  </div>
                )}
              </div>
              
              <p className="text-gray-600 mb-4">
                Connect your Calendly account to automatically sync your availability and allow clients to book consultations directly through our platform.
              </p>

              {calendlyConnected ? (
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-medium text-gray-900">Calendar Connected</p>
                          <p className="text-sm text-gray-500">
                            {calendlyUsername && `@${calendlyUsername}`}
                          </p>
                          {calendlyUrl && (
                            <p className="text-sm text-blue-600">
                              {calendlyUrl}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleCalendlyDisconnect}
                        className="text-red-600 border-red-200 hover:bg-red-50 cursor-pointer"
                      >
                        Disconnect
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-lg p-3">
                    <Zap className="w-4 h-4" />
                    <span>Your calendar is ready to accept bookings!</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Button
                    type="button"
                    onClick={handleCalendlyConnect}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 cursor-pointer"
                  >
                    <Calendar className="w-4 h-4" />
                    Connect Calendly Account
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                  
                  <div className="flex items-start gap-2 text-sm text-amber-700 bg-amber-50 rounded-lg p-3">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Calendly integration is required to accept client bookings and manage your schedule.</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4">What happens after connecting?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Instant Setup</p>
              <p className="text-xs text-gray-600">No approval process - start immediately</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Perfect for Consultations</p>
              <p className="text-xs text-gray-600">Optimized for 15-30 minute sessions</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Professional Experience</p>
              <p className="text-xs text-gray-600">Automated confirmations and reminders</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Real-time Availability</p>
              <p className="text-xs text-gray-600">Prevents double bookings automatically</p>
            </div>
          </div>
        </div>
      </div>

      {/* Save and Continue Button */}
      <div className="pt-6">
        <Button
          type="button"
          size="lg"
          onClick={handleSubmit}
          disabled={isLoading || !calendlyConnected}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 h-auto cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : 'Save and Continue'}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
        {!calendlyConnected && (
          <p className="text-sm text-gray-500 mt-2">
            Connect your Calendly account to continue
          </p>
        )}
      </div>
    </div>
  );
};

export default CalendlyOnboarding;