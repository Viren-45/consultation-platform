// components/onboarding/steps/session-details.tsx
"use client";

import { useState } from 'react';
import { 
  ChevronRight,
  DollarSign,
  Clock,
  FileText,
  Edit3,
  Heart,
  Info,
  Gift,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

export interface SessionDetailsData {
  sessionPrice: number;
  isFreeSession: boolean;
  sessionDuration: number;
  sessionTitle: string;
  sessionDescription: string;
}

interface SessionDetailsOnboardingProps {
  initialData?: Partial<SessionDetailsData>;
  onSubmit: (data: SessionDetailsData) => void;
  isLoading?: boolean;
}

const SessionDetailsOnboarding = ({ 
  initialData, 
  onSubmit, 
  isLoading = false 
}: SessionDetailsOnboardingProps) => {
  const [sessionPrice, setSessionPrice] = useState(initialData?.sessionPrice || 75);
  const [isFreeSession, setIsFreeSession] = useState(initialData?.isFreeSession || false);
  const [sessionDuration, setSessionDuration] = useState(initialData?.sessionDuration || 30);
  const [sessionTitle, setSessionTitle] = useState(initialData?.sessionTitle || 'Expert Consultation');
  const [sessionDescription, setSessionDescription] = useState(
    initialData?.sessionDescription || 'Professional consultation session to help solve your specific challenges and provide expert guidance.'
  );

  const durationOptions = [15, 30, 45, 60];

  const handleFreeToggle = (isChecked: boolean) => {
    setIsFreeSession(isChecked);
    if (isChecked) {
      setSessionPrice(0);
    } else {
      setSessionPrice(75); // Reset to default
    }
  };

  const handleSubmit = () => {
    // Validation
    if (!sessionTitle.trim()) {
      alert('Please enter a session title');
      return;
    }

    if (!sessionDescription.trim()) {
      alert('Please enter a session description');
      return;
    }

    if (!isFreeSession && sessionPrice <= 0) {
      alert('Please set a session price or enable free sessions');
      return;
    }

    const submitData: SessionDetailsData = {
      sessionPrice: isFreeSession ? 0 : sessionPrice,
      isFreeSession,
      sessionDuration,
      sessionTitle: sessionTitle.trim(),
      sessionDescription: sessionDescription.trim(),
    };
    
    onSubmit(submitData);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100/60 border border-blue-200/40">
          <div className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
            STEP 4 OF 6
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">
          Configure Your Sessions
        </h1>
        <p className="text-lg text-gray-600">
          Set your pricing, duration, and session details. You can always update these later through your dashboard.
        </p>
      </div>

      {/* Pricing Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
          <div className="p-2 rounded-lg bg-green-50">
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Session Pricing</h2>
        </div>

        {/* Free Session Toggle */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-6 border border-blue-200/50">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center border border-blue-200/50">
                <Gift className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">Offer Free Sessions</h3>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFreeSession}
                    onChange={(e) => handleFreeToggle(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <p className="text-gray-600 mb-4">
                Consider offering free consultation sessions to build your reputation, gather testimonials, and help others. 
                Free sessions are a great way to start on our platform and build trust with clients.
              </p>
              <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 rounded-lg p-3">
                <Heart className="w-4 h-4" />
                <span><strong>Impact:</strong> Help professionals grow while building your expert profile</span>
              </div>
            </div>
          </div>
        </div>

        {/* Price Input */}
        {!isFreeSession && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Price (USD)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  min="0"
                  max="200"
                  step="5"
                  value={sessionPrice}
                  onChange={(e) => setSessionPrice(Math.min(200, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="75"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Recommended range: $25-$150 per session
              </p>
            </div>
          </div>
        )}

        {isFreeSession && (
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center gap-2 text-sm text-green-700">
              <Gift className="w-4 h-4" />
              <span><strong>Free Session Enabled</strong> - Your sessions will be offered at no cost</span>
            </div>
          </div>
        )}
      </div>

      {/* Duration Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
          <div className="p-2 rounded-lg bg-blue-50">
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Session Duration</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {durationOptions.map((duration) => (
            <button
              key={duration}
              type="button"
              onClick={() => setSessionDuration(duration)}
              className={`p-4 rounded-lg border-2 text-center transition-all ${
                sessionDuration === duration
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              <div className="font-semibold text-lg">{duration}</div>
              <div className="text-sm">minutes</div>
            </button>
          ))}
        </div>
      </div>

      {/* Session Details Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
          <div className="p-2 rounded-lg bg-purple-50">
            <FileText className="w-5 h-5 text-purple-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Session Details</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Title
            </label>
            <div className="relative">
              <input
                type="text"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Marketing Strategy Consultation"
                maxLength={100}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Edit3 className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {sessionTitle.length}/100 characters
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Description
            </label>
            <textarea
              value={sessionDescription}
              onChange={(e) => setSessionDescription(e.target.value)}
              rows={4}
              className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe what clients can expect from your consultation session..."
              maxLength={500}
            />
            <p className="text-sm text-gray-500 mt-1">
              {sessionDescription.length}/500 characters
            </p>
          </div>
        </div>
      </div>

      {/* Dashboard Notice */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Easy to Update Later</h3>
            <p className="text-sm text-gray-600">
              Don't worry about getting everything perfect right now. You can easily adjust your pricing, 
              session details, and availability anytime through your expert dashboard.
            </p>
          </div>
        </div>
      </div>

      {/* Complete Onboarding Button */}
      <div className="pt-6">
        <Button
          type="button"
          size="lg"
          onClick={handleSubmit}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 h-auto cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Processing...' : 'Complete Onboarding'}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default SessionDetailsOnboarding;