// app/expert/onboarding/layout.tsx
import React from 'react';

interface OnboardingLayoutProps {
  children: React.ReactNode;
}

export default function OnboardingLayout({ children }: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-2xl mx-auto px-6 py-12">
        {children}
      </main>
    </div>
  );
}