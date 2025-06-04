// components/onboarding/steps/profile.tsx
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  ChevronRight,
  Upload,
  FileText,
  Trash2,
  Linkedin,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import LinkedInUploadModal from '@/components/onboarding/linkedin-upload-modal';
import { profileSchema, type ProfileFormData, type ProfileData } from '@/lib/validations/profile';

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
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showLinkedInModal, setShowLinkedInModal] = useState(false);
  
  // Local state for profile picture
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(
    initialData?.profilePictureUrl || null
  );

  // Local state for LinkedIn file
  const [uploadedLinkedInFile, setUploadedLinkedInFile] = useState<File | null>(null);
  const [confirmedLinkedInFile, setConfirmedLinkedInFile] = useState<File | null>(null);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: initialData?.firstName || '',
      lastName: initialData?.lastName || '',
      email: initialData?.email || '',
    }
  });

  // Load initial LinkedIn file if exists
  useEffect(() => {
    if (initialData?.linkedinFileName) {
      // Create a mock file object for display purposes
      const mockFile = new File([''], initialData.linkedinFileName, { type: 'application/pdf' });
      setConfirmedLinkedInFile(mockFile);
    }
  }, [initialData]);

  const handleImageSelect = (file: File, previewUrl: string) => {
    setProfilePictureFile(file);
    setProfilePictureUrl(previewUrl);
  };

  const handleImageRemove = () => {
    setProfilePictureFile(null);
    setProfilePictureUrl(null);
  };

  const handleLinkedInFileUpload = (file: File) => {
    setUploadedLinkedInFile(file);
  };

  const handleLinkedInFileRemove = () => {
    setUploadedLinkedInFile(null);
  };

  const handleLinkedInModalClose = () => {
    // When modal closes with file uploaded, move it to confirmed state
    if (uploadedLinkedInFile) {
      setConfirmedLinkedInFile(uploadedLinkedInFile);
    }
    setShowLinkedInModal(false);
    setUploadedLinkedInFile(null); // Reset modal state
  };

  const handleConfirmedLinkedInFileRemove = () => {
    setConfirmedLinkedInFile(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getUserInitial = () => {
    const firstName = form.watch('firstName');
    return firstName ? firstName.charAt(0).toUpperCase() : 'U';
  };

  const handleFormSubmit = (data: ProfileFormData) => {
    // Validate LinkedIn PDF is uploaded
    if (!confirmedLinkedInFile) {
      alert('Please upload your LinkedIn profile PDF before continuing.');
      return;
    }

    // Combine form data with profile picture data and LinkedIn file
    const submitData: ProfileData = {
      ...data,
      profilePictureFile: profilePictureFile || undefined,
      profilePictureUrl: profilePictureUrl || undefined,
      linkedinFile: confirmedLinkedInFile || undefined,
      linkedinFileName: confirmedLinkedInFile?.name || undefined,
    };
    
    onSubmit(submitData);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100/60 border border-blue-200/40">
          <div className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
            STEP 1 OF 6
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">
          Build Your Public Profile
        </h1>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
          {/* Profile Photo and Basic Info Section */}
          <div className="flex items-start gap-8">
            {/* Profile Photo */}
            <div className="flex-shrink-0 space-y-4">
              <div 
                className="relative inline-block cursor-pointer group"
                onClick={() => setShowImageUpload(true)}
              >
                {profilePictureUrl ? (
                  <img
                    src={profilePictureUrl}
                    alt="Profile"
                    className="w-24 h-24 rounded-xl object-cover border-2 border-gray-200 group-hover:border-blue-300 transition-all duration-200"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center border-2 border-gray-200 group-hover:border-blue-300 transition-all duration-200">
                    <span className="text-2xl font-semibold text-white">
                      {getUserInitial()}
                    </span>
                  </div>
                )}
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/40 bg-opacity-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Upload className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-sm text-gray-500 text-center max-w-24">
                Click to upload a professional photo
              </p>
            </div>

            {/* Name Fields */}
            <div className="flex-1 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          className="border-gray-200 focus:border-blue-300 focus:ring-blue-200 h-12" 
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
                          className="border-gray-200 focus:border-blue-300 focus:ring-blue-200 h-12" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Other Fields */}
          <div className="space-y-6">
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
                      className="bg-gray-50 border-gray-200 text-gray-600 cursor-not-allowed h-12" 
                    />
                  </FormControl>
                  <FormDescription className="text-xs text-gray-500">
                    This email is linked to your account and cannot be changed
                  </FormDescription>
                </FormItem>
              )}
            />

            {/* LinkedIn Profile Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
                <div className="p-2 rounded-lg bg-blue-50">
                  <Linkedin className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">LinkedIn Profile</h2>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-2">
                      Import from LinkedIn
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Upload your LinkedIn profile as a PDF to auto-populate your expertise and experience.
                    </p>
                    
                    {/* Confirmed/Uploaded File Display */}
                    {confirmedLinkedInFile ? (
                      <div className="border border-gray-200 rounded-lg p-4 bg-white">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-red-100 rounded">
                              <FileText className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {confirmedLinkedInFile.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {confirmedLinkedInFile.size > 0 ? formatFileSize(confirmedLinkedInFile.size) : 'PDF file'}
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleConfirmedLinkedInFileRemove}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowLinkedInModal(true)}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Upload className="w-4 h-4" />
                        Upload LinkedIn PDF
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Save and Continue Button */}
          <div className="pt-6">
            <Button
              type="submit"
              size="lg"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 h-auto cursor-pointer"
            >
              {isLoading ? 'Saving...' : 'Save and Continue'}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </form>
      </Form>

      {/* Profile Picture Upload Modal */}
      <ProfilePictureUpload
        isOpen={showImageUpload}
        onClose={() => setShowImageUpload(false)}
        currentImage={profilePictureUrl}
        onImageSelect={handleImageSelect}
        onImageRemove={handleImageRemove}
      />

      {/* LinkedIn Upload Modal */}
      <LinkedInUploadModal
        isOpen={showLinkedInModal}
        onClose={handleLinkedInModalClose}
        onFileUpload={handleLinkedInFileUpload}
        uploadedFile={uploadedLinkedInFile}
        onFileRemove={handleLinkedInFileRemove}
      />
    </div>
  );
};

export default ProfileOnboarding;