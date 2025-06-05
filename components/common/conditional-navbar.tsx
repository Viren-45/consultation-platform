"use client";

import { usePathname } from 'next/navigation';
import Navbar from '@/components/common/navbar';

const ConditionalNavbar = () => {
  const pathname = usePathname();
  
  // Hide navbar on these routes
  const hideNavbarRoutes = [
    '/get-started',
    '/sign-up',
    '/sign-in',
    '/confirm-email',
    '/expert/onboarding/profile',
    '/expert/onboarding/calendly',
    '/expert/onboarding/availability',
    '/expert/onboarding/session-details',
    '/expert/onboarding/processing',
  ];
  
  // Check if current path should hide navbar
  const shouldHideNavbar = hideNavbarRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  if (shouldHideNavbar) {
    return null;
  }
  
  return <Navbar />;
};

export default ConditionalNavbar;