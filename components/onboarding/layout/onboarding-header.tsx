// components/onboarding/layout/onboarding-header.tsx
"use client";

import React from 'react';
import { Clock, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOutUser } from '@/lib/auth';

const OnboardingHeader = () => {
  const router = useRouter();

  const handleSignOut = async () => {
    const result = await signOutUser();
    if (result.success) {
      router.push('/sign-in');
    } else {
      console.error('Sign out error:', result.error);
    }
  };

  return (
    <header className="w-full border-b border-gray-200 shadow-sm bg-white px-6 py-4 fixed top-0 z-50">
      <div className="flex items-center justify-between max-w-[1600px] mx-auto">
        {/* Logo Section */}
        <Link href="/" className="flex items-center space-x-2">
          <Clock className="h-6 w-6 text-blue-600" />
          <span className="text-xl font-bold text-blue-600">MinuteMate</span>
        </Link>

        {/* Logout Button */}
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className="flex items-center space-x-2 text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </Button>
      </div>
    </header>
  );
};

export default OnboardingHeader;