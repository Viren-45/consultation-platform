// lib/onboarding/profile.ts
import supabase from "@/lib/supabase-client";

export interface ProfileUpdateData {
  firstName?: string;
  lastName?: string;
  profilePictureUrl?: string;
}

export interface ProfileUploadResult {
  success: boolean;
  error?: string;
  profilePictureUrl?: string;
}

export interface LinkedInUploadResult {
  success: boolean;
  error?: string;
  linkedinPdfUrl?: string;
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

    // Create unique filename with timestamp
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

    // Get public URL for the uploaded image
    const { data: urlData } = supabase.storage
      .from("profile-pictures")
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      return {
        success: false,
        error: "Failed to generate image URL",
      };
    }

    // Update user profile with new picture URL in database
    const { error: updateError } = await supabase
      .from("user_profiles")
      .update({
        profile_picture_url: urlData.publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (updateError) {
      console.error("Database update error:", updateError);
      // Clean up uploaded file if database update fails
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

// Upload LinkedIn PDF to Supabase Storage
export const uploadLinkedInPDF = async (
  userId: string,
  file: File
): Promise<LinkedInUploadResult> => {
  try {
    // Validate file type - only PDF allowed
    if (file.type !== "application/pdf") {
      return {
        success: false,
        error: "Please upload a PDF file only",
      };
    }

    // Validate file size (max 10MB for PDFs)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      return {
        success: false,
        error: "PDF file size must be less than 10MB",
      };
    }

    // Use fixed filename for easy replacement
    const fileName = "linkedin_profile.pdf";
    const filePath = `${userId}/${fileName}`;

    // Upload file to Supabase Storage (upsert: true will replace existing file)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("linkedin-pdfs")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true, // This replaces existing file with same path
      });

    if (uploadError) {
      console.error("LinkedIn PDF upload error:", uploadError);
      return {
        success: false,
        error: "Failed to upload LinkedIn PDF. Please try again.",
      };
    }

    // Get public URL for the uploaded PDF (for internal use)
    const { data: urlData } = supabase.storage
      .from("linkedin-pdfs")
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      return {
        success: false,
        error: "Failed to generate PDF URL",
      };
    }

    // Update user profile with LinkedIn PDF URL in database
    const { error: updateError } = await supabase
      .from("user_profiles")
      .update({
        linkedin_pdf_url: urlData.publicUrl,
        linkedin_pdf_uploaded: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (updateError) {
      console.error("Database update error for LinkedIn PDF:", updateError);
      // Clean up uploaded file if database update fails
      await supabase.storage.from("linkedin-pdfs").remove([filePath]);

      return {
        success: false,
        error: "Failed to save LinkedIn PDF reference. Please try again.",
      };
    }

    return {
      success: true,
      linkedinPdfUrl: urlData.publicUrl,
    };
  } catch (error) {
    console.error("Unexpected error uploading LinkedIn PDF:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
};

// Delete existing profile picture from storage
const deleteExistingProfilePicture = async (userId: string): Promise<void> => {
  try {
    // Get current profile picture URL from database
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

// Delete LinkedIn PDF from storage and database
export const deleteLinkedInPDF = async (
  userId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Define the file path (fixed filename)
    const filePath = `${userId}/linkedin_profile.pdf`;

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from("linkedin-pdfs")
      .remove([filePath]);

    if (storageError) {
      console.error("Error deleting LinkedIn PDF from storage:", storageError);
      // Continue anyway - file might not exist
    }

    // Update database to remove LinkedIn PDF references
    const { error: updateError } = await supabase
      .from("user_profiles")
      .update({
        linkedin_pdf_url: null,
        linkedin_pdf_uploaded: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (updateError) {
      console.error("Error removing LinkedIn PDF from database:", updateError);
      return {
        success: false,
        error: "Failed to remove LinkedIn PDF. Please try again.",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected error deleting LinkedIn PDF:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
};

// Update profile data (without pictures/PDFs)
export const updateProfile = async (
  userId: string,
  data: ProfileUpdateData
): Promise<{ success: boolean; error?: string }> => {
  try {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    // Only update provided fields
    if (data.firstName) updateData.first_name = data.firstName;
    if (data.lastName) updateData.last_name = data.lastName;
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

// Get profile data including LinkedIn PDF status
export const getProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("user_profiles")
      .select(
        `
        id,
        first_name,
        last_name,
        profile_picture_url,
        linkedin_pdf_url,
        linkedin_pdf_uploaded,
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

// Check if user has uploaded LinkedIn PDF
export const hasLinkedInPDF = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("linkedin_pdf_uploaded")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error checking LinkedIn PDF status:", error);
      return false;
    }

    return data?.linkedin_pdf_uploaded || false;
  } catch (error) {
    console.error("Unexpected error checking LinkedIn PDF status:", error);
    return false;
  }
};

// Get LinkedIn PDF download URL for processing
export const getLinkedInPDFUrl = async (
  userId: string
): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("linkedin_pdf_url")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching LinkedIn PDF URL:", error);
      return null;
    }

    return data?.linkedin_pdf_url || null;
  } catch (error) {
    console.error("Unexpected error fetching LinkedIn PDF URL:", error);
    return null;
  }
};
