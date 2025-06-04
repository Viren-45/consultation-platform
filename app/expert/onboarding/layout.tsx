// app/expert/onboarding/layout.tsx
import React from 'react';
import OnboardingHeader from '@/components/onboarding/layout/onboarding-header';

interface OnboardingLayoutProps {
  children: React.ReactNode;
}

export default function OnboardingLayoutWrapper({ children }: OnboardingLayoutProps) {
  return (
    <>
      <OnboardingHeader />
      <main className="mt-20">
        {children}
      </main>
    </>
  );
}