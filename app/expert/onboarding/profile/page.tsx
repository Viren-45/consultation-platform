// app/expert/onboarding/profile/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProfileOnboarding from '@/components/onboarding/steps/profile';
import { getCurrentUser, updateOnboardingStatus } from '@/lib/auth';
import { 
  uploadProfilePicture, 
  updateProfile, 
  getProfile, 
  uploadLinkedInPDF, 
  hasLinkedInPDF 
} from '@/lib/onboarding/profile';

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  profilePictureFile?: File;
  profilePictureUrl?: string;
  linkedinFile?: File;
  linkedinFileName?: string;
}

export default function ProfileOnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [initialData, setInitialData] = useState<Partial<ProfileData>>({});
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = await getCurrentUser();

        if (!user) {
          router.push('/sign-in');
          return;
        }

        setUserId(user.id);

        const profile = await getProfile(user.id);

        // Check if LinkedIn PDF was uploaded
        const hasLinkedIn = await hasLinkedInPDF(user.id);

        setInitialData({
          firstName: profile?.first_name || user.user_metadata?.first_name || '',
          lastName: profile?.last_name || user.user_metadata?.last_name || '',
          email: user.email || '',
          profilePictureUrl: profile?.profile_picture_url || '',
          linkedinFileName: hasLinkedIn ? 'linkedin_profile.pdf' : undefined,
        });
      } catch (error) {
        console.error('Error loading user data:', error);
        router.push('/sign-in');
      } finally {
        setInitialLoading(false);
      }
    };

    loadUserData();
  }, [router]);

  const handleSubmit = async (data: ProfileData) => {
    if (!userId) return;

    setLoading(true);

    try {
      let profilePictureUrl = data.profilePictureUrl;

      // Upload profile picture if a new file was selected
      if (data.profilePictureFile) {
        const uploadResult = await uploadProfilePicture(userId, data.profilePictureFile);
        
        if (!uploadResult.success) {
          throw new Error(uploadResult.error || 'Failed to upload profile picture');
        }
        
        profilePictureUrl = uploadResult.profilePictureUrl;
      }

      // Upload LinkedIn PDF if a new file was selected
      if (data.linkedinFile) {
        const linkedinUploadResult = await uploadLinkedInPDF(userId, data.linkedinFile);
        
        if (!linkedinUploadResult.success) {
          throw new Error(linkedinUploadResult.error || 'Failed to upload LinkedIn PDF');
        }
      }

      // Update profile data
      const updateResult = await updateProfile(userId, {
        firstName: data.firstName,
        lastName: data.lastName,
        profilePictureUrl: profilePictureUrl,
      });

      if (!updateResult.success) {
        throw new Error(updateResult.error || 'Failed to update profile');
      }

      // Update onboarding step to 2 (location)
      const stepUpdateSuccess = await updateOnboardingStatus(userId, 2);
      
      if (!stepUpdateSuccess) {
        throw new Error('Failed to update onboarding progress');
      }

      // Navigate to next step
      router.push('/expert/onboarding/calendly');
    } catch (error) {
      console.error('Error updating profile:', error);
      // TODO: Show error toast with the error message
      alert(error instanceof Error ? error.message : 'An error occurred while saving your profile');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
      <ProfileOnboarding
        initialData={initialData}
        onSubmit={handleSubmit}
        isLoading={loading}
      />
  );
}