"use client";

import React, { useState } from 'react';
import { Clock, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import AuthModal from '@/components/auth/auth-modal';

const Navbar = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'sign-in' | 'sign-up'>('sign-in');

  const openSignInModal = () => {
    setAuthMode('sign-in');
    setIsAuthModalOpen(true);
  };

  const openSignUpModal = () => {
    setAuthMode('sign-up');
    setIsAuthModalOpen(true);
  };

  const closeModal = () => {
    setIsAuthModalOpen(false);
    // Don't reset authMode here - let the modal handle its own state
  };
  
  return (
      <>
        <nav className="w-full border-b border-gray-200 shadow-sm bg-white px-6 py-4 fixed z-50">
          <div className="flex items-center justify-between max-w-[1600px] mx-auto">
            {/* Logo Section */}
            <div className="flex items-center space-x-2">
                <Clock className="h-6 w-6 text-blue-600" />
                <span className="text-xl font-bold text-blue-600">MinuteMate</span>
            </div>

            {/* Navigation Links */}
            <div className="flex items-center space-x-8">
              <a 
                href="/browse-experts" 
                className="text-gray-800 hover:text-blue-600 font-base transition-colors"
              >
                Browse Experts
              </a>
              
              <div className="relative group">
                <button className="flex items-center space-x-1 text-gray-800 hover:text-blue-600 font-base transition-colors">
                  <span>Get Matched</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
              
              <a 
                href="/how-it-works" 
                className="text-gray-800 hover:text-blue-600 font-base transition-colors"
              >
                How It Works
              </a>
              
              <a 
                href="/pricing" 
                className="text-gray-800 hover:text-blue-600 font-base transition-colors"
              >
                Pricing
              </a>
            </div>

            {/* Toggle Switch (Placeholder for now) */}
            <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full">
              <span className="text-sm font-medium text-blue-600">For Clients</span>
              <div className="w-10 h-5 bg-blue-600 rounded-full relative cursor-pointer">
                <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform"></div>
              </div>
              <span className="text-sm font-medium text-gray-500">For Experts</span>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-3">
                <Button 
                  variant="ghost" 
                  className="text-gray-800 hover:text-blue-600 cursor-pointer"
                  onClick={openSignInModal}
                >
                  Sign In
                </Button>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                  onClick={openSignUpModal}
                >
                  Get Started
                </Button>
              </div>
          </div>
        </nav>

        {/* Auth Modal */}
        <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeModal}
        initialMode={authMode}
      />
    </>
  );
};

export default Navbar;