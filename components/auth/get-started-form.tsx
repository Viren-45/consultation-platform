// components/auth/get-started-form.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Briefcase, 
  ArrowRight, 
  Check,
  Clock,
  Zap,
  Globe,
  TrendingUp,
  Shield
} from 'lucide-react';

const GetStartedForm = () => {
  const [selectedType, setSelectedType] = useState<'client' | 'expert' | null>(null);
  const router = useRouter();

  const handleCreateAccount = () => {
    if (selectedType) {
      router.push(`/sign-up?type=${selectedType}`);
    }
  };

  const userTypes = [
    {
      id: 'client',
      title: "Join as a Client",
      subtitle: "Book expert consultations for your business challenges",
      icon: Users,
      features: [
        { icon: Shield, text: "Access verified experts" },
        { icon: Clock, text: "Quick 15-30 min sessions" },
        { icon: Zap, text: "Book instantly when needed" }
      ]
    },
    {
      id: 'expert',
      title: "Join as an Expert",
      subtitle: "Share your expertise and earn with micro-consultations",
      icon: Briefcase,
      features: [
        { icon: TrendingUp, text: "Set your own rates" },
        { icon: Globe, text: "Reach global clients" },
        { icon: Clock, text: "Flexible schedule control" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose your <span className="text-blue-600">path</span>
          </h1>
          
          <p className="text-lg text-gray-600 max-w-lg mx-auto">
            Join thousands of professionals connecting through micro-consultations
          </p>
        </div>

        {/* Selection Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {userTypes.map((type) => {
            const IconComponent = type.icon;
            const isSelected = selectedType === type.id;
            
            return (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id as 'client' | 'expert')}
                className={`relative text-left p-6 rounded-2xl border-2 transition-all duration-200 hover:shadow-lg cursor-pointer ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                {/* Selection indicator */}
                <div className="absolute top-6 right-6">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-500' 
                      : 'border-gray-300'
                  }`}>
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                </div>

                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  isSelected 
                    ? 'bg-blue-500' 
                    : 'bg-gray-100'
                }`}>
                  <IconComponent className={`w-6 h-6 ${
                    isSelected ? 'text-white' : 'text-gray-600'
                  }`} />
                </div>

                {/* Content */}
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {type.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {type.subtitle}
                  </p>
                </div>

                {/* Features */}
                <div className="space-y-2">
                  {type.features.map((feature, index) => {
                    const FeatureIcon = feature.icon;
                    return (
                      <div key={index} className="flex items-center gap-2">
                        <FeatureIcon className={`w-4 h-4 ${
                          isSelected ? 'text-blue-600' : 'text-gray-500'
                        }`} />
                        <span className="text-sm text-gray-700">
                          {feature.text}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </button>
            );
          })}
        </div>

        {/* Create Account Button */}
        <div className="text-center">
          <button
            onClick={handleCreateAccount}
            disabled={!selectedType}
            className={`inline-flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all duration-200 ${
              selectedType
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md cursor-pointer'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Create Account
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <p className="mt-4 text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => router.push('/login')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default GetStartedForm;