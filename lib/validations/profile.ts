// lib/validations/profile.ts
import { z } from "zod";

// Profile validation schema
export const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
});

// Export types
export type ProfileFormData = z.infer<typeof profileSchema>;

export interface ProfileData extends ProfileFormData {
  profilePictureFile?: File;
  profilePictureUrl?: string;
  linkedinFile?: File;
  linkedinFileName?: string;
}
