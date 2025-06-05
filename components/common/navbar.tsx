// components/common/navbar.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Clock, ChevronDown, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCurrentUser, signOutUser } from '@/lib/auth';
import supabase from '@/lib/supabase-client';
import Image from 'next/image';

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  user_type: 'client' | 'expert';
  profile_picture_url?: string;
}

const Navbar = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    // Get initial user
    getCurrentUser().then((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchUserProfile(currentUser.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
        if (session?.user) {
          fetchUserProfile(session.user.id);
        } else {
          setUserProfile(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name, user_type, profile_picture_url')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
      } else {
        setUserProfile(data);
        setImageError(false); // Reset image error when profile loads
      }
    } catch (error) {
      console.error('Unexpected error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    const result = await signOutUser();
    if (result.success) {
      router.push('/');
    } else {
      console.error('Sign out error:', result.error);
    }
  };

  const getUserInitial = () => {
    if (userProfile?.first_name) {
      return userProfile.first_name.charAt(0).toUpperCase();
    }
    if (user?.user_metadata?.first_name) {
      return user.user_metadata.first_name.charAt(0).toUpperCase();
    }
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  const getUserName = () => {
    if (userProfile?.first_name && userProfile?.last_name) {
      return `${userProfile.first_name} ${userProfile.last_name}`;
    }
    if (user?.user_metadata?.first_name && user?.user_metadata?.last_name) {
      return `${user.user_metadata.first_name} ${user.user_metadata.last_name}`;
    }
    return user?.email || 'User';
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const renderUserAvatar = () => {
    const hasProfilePicture = userProfile?.profile_picture_url && !imageError;

    if (hasProfilePicture) {
      return (
        <div className="w-8 h-8 rounded-full overflow-hidden shadow-sm">
          <Image
            src={userProfile.profile_picture_url!}
            alt={`${getUserName()}'s profile`}
            width={32}
            height={32}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        </div>
      );
    }

    // Fallback to initial avatar
    return (
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
        {getUserInitial()}
      </div>
    );
  };

  const getUserTypeBadge = () => {
    if (!userProfile?.user_type) return null;

    const badgeColors = {
      client: 'bg-green-100 text-green-700 border-green-200',
      expert: 'bg-blue-100 text-blue-700 border-blue-200'
    };

    return (
      <div className={`px-3 py-1 rounded-full text-xs font-medium border ${badgeColors[userProfile.user_type]}`}>
        {userProfile.user_type === 'client' ? 'Client' : 'Expert'}
      </div>
    );
  };

  return (
    <nav className="w-full border-b border-gray-200 shadow-sm bg-white px-6 py-4 fixed z-50">
      <div className="flex items-center justify-between max-w-[1600px] mx-auto">
        {/* Logo Section */}
        <Link href="/" className="flex items-center space-x-2">
          <Clock className="h-6 w-6 text-blue-600" />
          <span className="text-xl font-bold text-blue-600">MinuteMate</span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center space-x-8">
          <Link 
            href="/browse-experts" 
            className="text-gray-800 hover:text-blue-600 font-base transition-colors"
          >
            Browse Experts
          </Link>
          
          <div className="relative group">
            <button className="flex items-center space-x-1 text-gray-800 hover:text-blue-600 font-base transition-colors">
              <span>Get Matched</span>
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
          
          <Link 
            href="/how-it-works" 
            className="text-gray-800 hover:text-blue-600 font-base transition-colors"
          >
            How It Works
          </Link>
          
          <Link 
            href="/pricing" 
            className="text-gray-800 hover:text-blue-600 font-base transition-colors"
          >
            Pricing
          </Link>
        </div>

        {/* User Type Badge - only shown when user is logged in */}
        <div className="flex items-center">
          {user && userProfile && getUserTypeBadge()}
        </div>

        {/* Auth Section */}
        <div className="flex items-center space-x-3">
          {loading ? (
            // Loading state
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
          ) : user ? (
            // Authenticated user
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-3 p-1 rounded-full hover:bg-gray-50 transition-colors">
                  {renderUserAvatar()}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-gray-900">{getUserName()}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                  {userProfile?.user_type && (
                    <div className="mt-2">
                      <span className={`inline-flex px-2 py-1 rounded-md text-xs font-medium ${
                        userProfile.user_type === 'client' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {userProfile.user_type === 'client' ? 'Client Account' : 'Expert Account'}
                      </span>
                    </div>
                  )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleSignOut}
                  className="flex items-center text-red-600 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            // Not authenticated
            <>
              <Button variant="ghost" asChild>
                <Link href="/sign-in" className="text-gray-800 hover:text-blue-600">
                  Sign In
                </Link>
              </Button>
              <Button asChild>
                <Link href="/get-started" className="bg-blue-600 hover:bg-blue-700 text-white">
                  Get Started
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;