import supabase from "@/lib/supabase-client";

export interface ProfileUpdateData {
  firstName?: string;
  lastName?: string;
  professionalHeadline?: string;
  bio?: string;
  profilePictureUrl?: string;
}

export interface ProfileUploadResult {
  success: boolean;
  error?: string;
  profilePictureUrl?: string;
}

// Upload profile picture to Supabase Storage
export const uploadProfilePicture = async (
  userId: string,
  file: File
): Promise<ProfileUploadResult> => {
  try {
    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: "Please upload a valid image file (JPEG, PNG, or WebP)",
      };
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return {
        success: false,
        error: "File size must be less than 5MB",
      };
    }

    // Create unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    // Delete existing profile picture if exists
    await deleteExistingProfilePicture(userId);

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("profile-pictures")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return {
        success: false,
        error: "Failed to upload image. Please try again.",
      };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("profile-pictures")
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      return {
        success: false,
        error: "Failed to generate image URL",
      };
    }

    // Update user profile with new picture URL
    const { error: updateError } = await supabase
      .from("user_profiles")
      .update({
        profile_picture_url: urlData.publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (updateError) {
      console.error("Database update error:", updateError);
      // Try to clean up uploaded file
      await supabase.storage.from("profile-pictures").remove([filePath]);

      return {
        success: false,
        error: "Failed to update profile. Please try again.",
      };
    }

    return {
      success: true,
      profilePictureUrl: urlData.publicUrl,
    };
  } catch (error) {
    console.error("Unexpected error uploading profile picture:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
};

// Delete existing profile picture from storage
const deleteExistingProfilePicture = async (userId: string): Promise<void> => {
  try {
    // Get current profile picture URL
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("profile_picture_url")
      .eq("id", userId)
      .single();

    if (profile?.profile_picture_url) {
      // Extract file path from URL
      const url = new URL(profile.profile_picture_url);
      const pathSegments = url.pathname.split("/");
      const filePath = pathSegments.slice(-2).join("/"); // Gets "userId/filename"

      // Delete from storage
      await supabase.storage.from("profile-pictures").remove([filePath]);
    }
  } catch (error) {
    console.error("Error deleting existing profile picture:", error);
    // Don't throw - this is cleanup, not critical
  }
};

// Update profile data (without picture)
export const updateProfile = async (
  userId: string,
  data: ProfileUpdateData
): Promise<{ success: boolean; error?: string }> => {
  try {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (data.firstName) updateData.first_name = data.firstName;
    if (data.lastName) updateData.last_name = data.lastName;
    if (data.professionalHeadline)
      updateData.professional_headline = data.professionalHeadline;
    if (data.bio) updateData.bio = data.bio;
    if (data.profilePictureUrl)
      updateData.profile_picture_url = data.profilePictureUrl;

    const { error } = await supabase
      .from("user_profiles")
      .update(updateData)
      .eq("id", userId);

    if (error) {
      console.error("Error updating profile:", error);
      return {
        success: false,
        error: "Failed to update profile. Please try again.",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected error updating profile:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
};

// Get profile data
export const getProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("user_profiles")
      .select(
        `
        id,
        first_name,
        last_name,
        professional_headline,
        bio,
        profile_picture_url,
        user_type,
        onboarding_completed,
        onboarding_step,
        created_at,
        updated_at
      `
      )
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Unexpected error fetching profile:", error);
    return null;
  }
};

// Delete profile picture only
export const deleteProfilePicture = async (
  userId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Delete from storage
    await deleteExistingProfilePicture(userId);

    // Update database to remove URL
    const { error } = await supabase
      .from("user_profiles")
      .update({
        profile_picture_url: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      console.error("Error removing profile picture from database:", error);
      return {
        success: false,
        error: "Failed to remove profile picture. Please try again.",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected error deleting profile picture:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
};
