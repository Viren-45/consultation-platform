"use client";

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SignInForm from './sign-in-form';
import SignUpForm from './sign-up-form';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'sign-in' | 'sign-up';
}

const AuthModal = ({ isOpen, onClose, initialMode = 'sign-in' }: AuthModalProps) => {
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>(initialMode);

  // Reset mode to initialMode whenever the modal opens or initialMode changes
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 h-8 w-8 p-0 hover:bg-gray-100 cursor-pointer"
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Modal Content */}
        <div className="p-8 pt-12">
          {mode === 'sign-in' ? (
            <SignInForm onSwitchToSignUp={() => setMode('sign-up')} />
          ) : (
            <SignUpForm onSwitchToSignIn={() => setMode('sign-in')} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;