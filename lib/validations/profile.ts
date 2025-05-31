// lib/validations/profile.ts
import { z } from "zod";

// Profile validation schema
export const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  professionalHeadline: z
    .string()
    .min(10, "Headline should be at least 10 characters")
    .max(100, "Headline should not exceed 100 characters"),
  bio: z
    .string()
    .min(50, "Bio should be at least 50 characters")
    .max(300, "Bio should not exceed 300 characters"),
});

// Export types
export type ProfileFormData = z.infer<typeof profileSchema>;

export interface ProfileData extends ProfileFormData {
  profilePictureFile?: File;
  profilePictureUrl?: string;
}
