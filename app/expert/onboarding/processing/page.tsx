// app/expert/onboarding/processing/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CheckCircle,
  FileText,
  Brain,
  Database,
  Loader,
  AlertCircle,
  Sparkles,
  Clock,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/auth';

interface ProcessingStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  icon: React.ComponentType<any>;
}

export default function ProcessingPage() {
  const router = useRouter();
  const [steps, setSteps] = useState<ProcessingStep[]>([
    {
      id: 'download',
      title: 'Downloading LinkedIn PDF',
      description: 'Retrieving your profile document',
      status: 'pending',
      icon: FileText,
    },
    {
      id: 'extract',
      title: 'Extracting Profile Data',
      description: 'Analyzing your experience and skills',
      status: 'pending',
      icon: Brain,
    },
    {
      id: 'save',
      title: 'Creating Expert Profile',
      description: 'Setting up your consultation profile',
      status: 'pending',
      icon: Database,
    },
    {
      id: 'complete',
      title: 'Finalizing Setup',
      description: 'Completing your onboarding',
      status: 'pending',
      icon: Sparkles,
    },
  ]);

  const [currentStep, setCurrentStep] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const initializeProcessing = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          router.push('/sign-in');
          return;
        }

        setUserId(user.id);

        // Check if user completed previous steps
        // if (user.onboarding_step < 5) {
        //   router.push('/expert/onboarding/session-details');
        //   return;
        // }

        // Start processing automatically
        await startProcessing(user.id);

      } catch (error) {
        console.error('Error initializing processing:', error);
        setError('Failed to initialize processing. Please try again.');
      }
    };

    initializeProcessing();
  }, [router]);

  const startProcessing = async (userId: string) => {
    setProcessing(true);
    setError(null);

    try {
      // Step 1: Download PDF
      await processStep(0, 'download', 'processing');
      
      // Step 2: Extract data (this is the longest step)
      await processStep(1, 'extract', 'processing');
      
      // Step 3: Save to database
      await processStep(2, 'save', 'processing');
      
      // Call the actual processing API during step 2 (extract)
      const response = await fetch('/api/expert/process-linkedin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Processing failed');
      }

      const result = await response.json();
      setSuccessData(result.data);

      // Complete steps 2 and 3 now that API call succeeded
      await processStep(1, 'extract', 'completed');
      await processStep(2, 'save', 'completed');
      
      // Step 4: Finalize
      await processStep(3, 'complete', 'processing');
      await new Promise(resolve => setTimeout(resolve, 1000));
      await processStep(3, 'complete', 'completed');

      // Wait a moment to show completion, then redirect
      await new Promise(resolve => setTimeout(resolve, 2000));
      router.push('/expert/dashboard');

    } catch (error) {
      console.error('Processing error:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      
      // Mark current step as error
      setSteps(prev => prev.map((step, index) => 
        index === currentStep 
          ? { ...step, status: 'error' }
          : step
      ));
    } finally {
      setProcessing(false);
    }
  };

  const processStep = async (stepIndex: number, stepId: string, targetStatus: 'processing' | 'completed') => {
    setCurrentStep(stepIndex);
    
    if (targetStatus === 'processing') {
      // Mark current step as processing
      setSteps(prev => prev.map((step, index) => ({
        ...step,
        status: index === stepIndex ? 'processing' : 
                index < stepIndex ? 'completed' : 'pending'
      })));
      
      // Add a small delay for visual feedback
      await new Promise(resolve => setTimeout(resolve, 500));
    } else if (targetStatus === 'completed') {
      // Mark current step as completed
      setSteps(prev => prev.map((step, index) => ({
        ...step,
        status: index <= stepIndex ? 'completed' : 'pending'
      })));
    }
  };

  const handleRetry = () => {
    if (userId) {
      // Reset all steps and try again
      setSteps(prev => prev.map(step => ({ ...step, status: 'pending' })));
      setCurrentStep(0);
      setError(null);
      startProcessing(userId);
    }
  };

  const getStepIcon = (step: ProcessingStep) => {
    const IconComponent = step.icon;
    
    if (step.status === 'completed') {
      return <CheckCircle className="w-6 h-6 text-green-600" />;
    } else if (step.status === 'processing') {
      return <Loader className="w-6 h-6 text-blue-600 animate-spin" />;
    } else if (step.status === 'error') {
      return <AlertCircle className="w-6 h-6 text-red-600" />;
    } else {
      return <IconComponent className="w-6 h-6 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-2xl mx-auto p-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Brain className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Setting Up Your Expert Profile
          </h1>
          <p className="text-lg text-gray-600">
            We're analyzing your LinkedIn profile to create your consultation profile. 
            This usually takes about 30 seconds.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="space-y-6 mb-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                {getStepIcon(step)}
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold ${
                  step.status === 'completed' ? 'text-green-700' :
                  step.status === 'processing' ? 'text-blue-700' :
                  step.status === 'error' ? 'text-red-700' :
                  'text-gray-500'
                }`}>
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {step.description}
                </p>
                {step.status === 'processing' && (
                  <div className="mt-3">
                    <div className="w-64 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-1000 ease-out"
                        style={{ 
                          width: step.id === 'extract' ? '45%' : '75%',
                          animation: step.id === 'extract' ? 'pulse 2s infinite' : 'none'
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {step.id === 'extract' ? 'AI analyzing your profile...' : 'Processing...'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Success Message */}
        {successData && !error && (
          <div className="bg-green-50 rounded-lg p-6 border border-green-200 mb-6">
            <div className="flex items-start gap-4">
              <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
              <div>
                <h3 className="font-semibold text-green-800 mb-2">
                  Profile Created Successfully!
                </h3>
                <p className="text-green-700 mb-3">
                  Welcome aboard, {successData.name}! Your expert profile is ready.
                </p>
                <div className="text-sm text-green-600">
                  <p><strong>Title:</strong> {successData.title}</p>
                  <p><strong>Company:</strong> {successData.company}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 rounded-lg p-6 border border-red-200 mb-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-red-600 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-800 mb-2">
                  Processing Failed
                </h3>
                <p className="text-red-700 mb-4">
                  {error}
                </p>
                <Button
                  onClick={handleRetry}
                  className="bg-red-600 hover:bg-red-700 text-white"
                  disabled={processing}
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Processing Info */}
        {processing && !error && (
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <div className="flex items-center gap-3 text-blue-700">
              <Clock className="w-5 h-5" />
              <span className="font-medium">Processing in progress...</span>
            </div>
            <p className="text-blue-600 text-sm mt-2">
              Please don't close this window. We're extracting your professional information 
              to help match you with the right clients.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 mt-8">
          <p>This process helps us understand your expertise to connect you with relevant clients.</p>
        </div>

      </div>
    </div>
  );
}