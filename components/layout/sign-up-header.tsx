"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Clock } from 'lucide-react';
import Link from 'next/link';

const SignUpHeader = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userType, setUserType] = useState<'client' | 'expert'>('client');

  useEffect(() => {
    const type = searchParams.get('type') as 'client' | 'expert';
    if (type) {
      setUserType(type);
    }
  }, [searchParams]);

  const handleToggle = () => {
    const newType = userType === 'client' ? 'expert' : 'client';
    setUserType(newType);
    router.push(`/sign-up?type=${newType}`);
  };

  return (
    <header className="w-full bg-white/80 backdrop-blur-sm">
      <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <Clock className="h-6 w-6 text-blue-600" />
          <span className="text-xl font-bold text-blue-600">MinuteMate</span>
        </Link>

        {/* Toggle Switch */}
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            {userType === 'client' 
              ? 'Looking to offer expertise?' 
              : 'Looking for consulting?'
            }
          </span>
          <button
            onClick={handleToggle}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors cursor-pointer"
          >
            {userType === 'client' ? 'Apply as expert' : 'Apply as client'}
          </button>
        </div>
      </div>
    </header>
  );
};

export default SignUpHeader;