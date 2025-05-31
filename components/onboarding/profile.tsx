// components/onboarding/profile.tsx
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  ChevronLeft,
  ChevronRight,
  Plus
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';

import ProfilePictureUpload from '@/components/onboarding/profile-picture-upload';
import { profileSchema, type ProfileFormData, type ProfileData } from '@/lib/validations/profile';

// Remove the local validation schema since it's now imported

interface ProfileOnboardingProps {
  initialData?: Partial<ProfileData>;
  onSubmit: (data: ProfileData) => void;
  isLoading?: boolean;
}

const ProfileOnboarding = ({ 
  initialData, 
  onSubmit, 
  isLoading = false 
}: ProfileOnboardingProps) => {
  const [bioLength, setBioLength] = useState(0);
  const [showImageUpload, setShowImageUpload] = useState(false);
  
  // Local state for profile picture
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(
    initialData?.profilePictureUrl || null
  );

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: initialData?.firstName || '',
      lastName: initialData?.lastName || '',
      email: initialData?.email || '',
      professionalHeadline: initialData?.professionalHeadline || '',
      bio: initialData?.bio || '',
    }
  });

  // Watch bio field for character count
  const watchedBio = form.watch('bio');
  useEffect(() => {
    setBioLength(watchedBio?.length || 0);
  }, [watchedBio]);

  const handleImageSelect = (file: File, previewUrl: string) => {
    setProfilePictureFile(file);
    setProfilePictureUrl(previewUrl);
  };

  const handleImageRemove = () => {
    setProfilePictureFile(null);
    setProfilePictureUrl(null);
  };

  const getUserInitial = () => {
    const firstName = form.watch('firstName');
    return firstName ? firstName.charAt(0).toUpperCase() : 'U';
  };

  const handleFormSubmit = (data: ProfileFormData) => {
    // Combine form data with profile picture data
    const submitData: ProfileData = {
      ...data,
      profilePictureFile: profilePictureFile || undefined,
      profilePictureUrl: profilePictureUrl || undefined,
    };
    
    onSubmit(submitData);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">
          Build Your Public Profile
        </h1>
        <p className="text-lg text-gray-600 max-w-lg mx-auto leading-relaxed">
          Create a professional profile that establishes your identity and expertise. 
          This helps clients understand who you are and builds trust before they book a consultation.
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
            {/* Profile Photo Section */}
            <div className="text-center space-y-4">
              <div 
                className="relative inline-block cursor-pointer group"
                onClick={() => setShowImageUpload(true)}
              >
                {profilePictureUrl ? (
                  <img
                    src={profilePictureUrl}
                    alt="Profile"
                    className="w-24 h-24 rounded-lg object-cover border-2 border-gray-200 group-hover:border-blue-300 transition-colors"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center border-2 border-gray-200 group-hover:border-blue-300 transition-colors">
                    <span className="text-2xl font-semibold text-white">
                      {getUserInitial()}
                    </span>
                  </div>
                )}
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Plus className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Click to upload a professional photo
              </p>
            </div>

            {/* Basic Information */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        First Name
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your first name" 
                          className="border-gray-200 focus:border-blue-300 focus:ring-blue-200" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Last Name
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your last name" 
                          className="border-gray-200 focus:border-blue-300 focus:ring-blue-200" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Email (Read-only) */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        disabled 
                        className="bg-gray-50 border-gray-200 text-gray-600 cursor-not-allowed" 
                      />
                    </FormControl>
                    <FormDescription className="text-xs text-gray-500">
                      This email is linked to your account and cannot be changed
                    </FormDescription>
                  </FormItem>
                )}
              />

              {/* Professional Headline */}
              <FormField
                control={form.control}
                name="professionalHeadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Professional Headline
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Senior Marketing Strategist | 10+ Years B2B Growth"
                        className="border-gray-200 focus:border-blue-300 focus:ring-blue-200" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription className="text-xs text-gray-500">
                      A concise headline that highlights your expertise and experience
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Bio */}
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Professional Bio
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Hi! I'm a marketing professional who loves helping businesses grow. I've spent over 10 years building growth strategies for B2B companies, from startups to Fortune 500s. I specialize in digital marketing, customer acquisition, and scaling marketing teams. I'm here to help you solve your toughest marketing challenges in quick, focused sessions."
                        className="min-h-[120px] resize-none border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                        {...field}
                      />
                    </FormControl>
                    <div className="flex items-center justify-between">
                      <FormDescription className="text-xs text-gray-500">
                        Write in a conversational tone. Share your expertise and how you help clients.
                      </FormDescription>
                      <span className={`text-xs font-medium ${
                        bioLength > 300 ? 'text-red-500' : 
                        bioLength > 250 ? 'text-amber-500' : 'text-gray-400'
                      }`}>
                        {bioLength}/300
                      </span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6">
        <Button
          variant="ghost"
          size="lg"
          disabled={true}
          className="text-gray-400 cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <div className="w-2 h-2 rounded-full bg-gray-200"></div>
          <div className="w-2 h-2 rounded-full bg-gray-200"></div>
        </div>

        <Button
          onClick={form.handleSubmit(handleFormSubmit)}
          size="lg"
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isLoading ? 'Saving...' : 'Continue'}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Profile Picture Upload Modal */}
      <ProfilePictureUpload
        isOpen={showImageUpload}
        onClose={() => setShowImageUpload(false)}
        currentImage={profilePictureUrl}
        onImageSelect={handleImageSelect}
        onImageRemove={handleImageRemove}
      />
    </div>
  );
};

export default ProfileOnboarding;