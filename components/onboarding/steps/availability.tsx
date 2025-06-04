// components/onboarding/steps/availability.tsx
"use client";

import { useState } from 'react';
import { 
  ChevronRight,
  Calendar,
  ExternalLink,
  AlertCircle,
  RefreshCw,
  Settings,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/auth';

export interface AvailabilityData {
  hasActiveEventTypes: boolean;
  schedulingUrl?: string;
}

interface AvailabilityOnboardingProps {
  initialData?: Partial<AvailabilityData>;
  onSubmit: (data: AvailabilityData) => void;
  isLoading?: boolean;
}

const AvailabilityOnboarding = ({ 
  initialData, 
  onSubmit, 
  isLoading = false 
}: AvailabilityOnboardingProps) => {
  const [availabilityData, setAvailabilityData] = useState<AvailabilityData>({
    hasActiveEventTypes: initialData?.hasActiveEventTypes || false,
    schedulingUrl: initialData?.schedulingUrl || '',
  });
  const [refreshing, setRefreshing] = useState(false);

  const handleConfigureHours = () => {
    // Open Calendly dashboard in new tab
    window.open('https://calendly.com/app/availability', '_blank');
  };

  const handleRefreshAvailability = async () => {
    setRefreshing(true);
    try {
      const user = await getCurrentUser();
      if (!user) {
        alert('Please log in first');
        return;
      }
      
      // Fetch latest availability data from Calendly API
      const response = await fetch(`/api/calendly/availability?user_id=${user.id}`);
      
      if (response.ok) {
        const data = await response.json();
        setAvailabilityData({
          hasActiveEventTypes: data.hasActiveEventTypes,
          schedulingUrl: data.schedulingUrl,
        });
        
        // Trigger iframe reload by updating src
        const iframe = document.getElementById('calendly-widget') as HTMLIFrameElement;
        if (iframe && data.schedulingUrl) {
          iframe.src = `${data.schedulingUrl}?embed_domain=${window.location.hostname}&embed_type=Inline&hide_gdpr_banner=1`;
        }
      } else {
        throw new Error('Failed to refresh availability');
      }
    } catch (error) {
      console.error('Error refreshing availability:', error);
      alert('Failed to refresh availability. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleSubmit = () => {
    // Validate that user has availability configured
    if (!availabilityData.hasActiveEventTypes) {
      alert('Please configure your availability in Calendly before continuing.');
      return;
    }

    onSubmit(availabilityData);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100/60 border border-blue-200/40">
          <div className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
            STEP 3 OF 6
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">
          Set Your Availability
        </h1>
        <p className="text-lg text-gray-600">
          Configure your consultation hours to start accepting bookings from clients.
        </p>
      </div>

      {/* Calendar Widget Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
          <div className="p-2 rounded-lg bg-blue-50">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Your Availability Calendar</h2>
        </div>

        {availabilityData.hasActiveEventTypes && availabilityData.schedulingUrl ? (
          <div className="space-y-4">
            {/* Info Message */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900 mb-1">
                    Preview of Your Availability
                  </p>
                  <p className="text-sm text-blue-700">
                    The blue dots show days when you're available for bookings. This is exactly what clients will see when scheduling with you.
                  </p>
                </div>
              </div>
            </div>

            {/* Calendly Embed Widget - Read Only */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden relative">
              <iframe
                id="calendly-widget"
                src={`${availabilityData.schedulingUrl}?embed_domain=${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}&embed_type=Inline&hide_gdpr_banner=1`}
                width="100%"
                height="800"
                frameBorder="0"
                title="Calendly Scheduling Preview"
                className="w-full pointer-events-none"
              />
              {/* Overlay to prevent interaction */}
              <div 
                className="absolute inset-0 bg-transparent cursor-not-allowed"
                title="This is a preview - use 'Configure Hours' to make changes"
              />
              {/* Floating preview indicator */}
              <div className="absolute top-4 right-4 bg-gray-800 text-white text-xs px-3 py-1 rounded-full shadow-lg z-10">
                Preview Only
              </div>
            </div>

            {/* Footer Message */}
            <div className="text-center">
              <p className="text-sm text-gray-500">
                This is a preview only. To make changes to your availability, use the "Configure Hours" button below.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl p-8 border border-amber-200/50 text-center">
            <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center border border-amber-200/50 mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              No Availability Configured
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              You need to set up your availability in Calendly before clients can book consultations with you.
            </p>
            <div className="space-y-3 text-sm text-gray-700 max-w-md mx-auto">
              <div className="text-left">
                <strong>Quick setup:</strong>
              </div>
              <ul className="text-left space-y-1 ml-4 text-gray-600">
                <li>• Click "Configure Hours" below</li>
                <li>• Set your available days and times</li>
                <li>• Create event types for consultations</li>
                <li>• Return here and click "Refresh"</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Configuration Controls */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Manage Your Hours</h3>
            <p className="text-sm text-gray-600">
              Configure your availability in Calendly. Changes will appear here automatically.
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="button"
            onClick={handleConfigureHours}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 justify-center"
          >
            <Settings className="w-4 h-4" />
            Configure Hours
            <ExternalLink className="w-4 h-4" />
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={handleRefreshAvailability}
            disabled={refreshing}
            className="flex items-center gap-2 justify-center"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh Calendar'}
          </Button>
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700">
            💡 <strong>Tip:</strong> You can always update your availability later through your expert dashboard.
          </p>
        </div>
      </div>

      {/* Save and Continue Button */}
      <div className="pt-6">
        <Button
          type="button"
          size="lg"
          onClick={handleSubmit}
          disabled={isLoading || !availabilityData.hasActiveEventTypes}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 h-auto cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : 'Save and Continue'}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
        {!availabilityData.hasActiveEventTypes && (
          <p className="text-sm text-gray-500 mt-2">
            Configure your availability in Calendly to continue
          </p>
        )}
      </div>
    </div>
  );
};

export default AvailabilityOnboarding;