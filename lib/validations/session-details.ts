// lib/validations/session-details.ts
import { z } from "zod";

// Session details form validation schema
export const sessionDetailsSchema = z.object({
  sessionPrice: z.number().min(0).max(200, "Price cannot exceed $200"),
  isFreeSession: z.boolean(),
  sessionDuration: z
    .number()
    .min(15)
    .max(60, "Duration must be between 15-60 minutes"),
  sessionTitle: z
    .string()
    .min(1, "Session title is required")
    .max(100, "Title cannot exceed 100 characters")
    .trim(),
  sessionDescription: z
    .string()
    .min(1, "Session description is required")
    .max(500, "Description cannot exceed 500 characters")
    .trim(),
});

// API request validation schema
export const sessionDetailsUpdateSchema = z.object({
  user_id: z.string().uuid("Valid user ID is required"),
  session_duration: z.number().min(15).max(60),
  session_price: z.number().min(0).max(200),
  title: z.string().min(1).max(100).trim(),
  description: z.string().min(1).max(500).trim(),
  calendly_event_type_uri: z.string().optional(),
  event_type_name: z.string().optional(),
});

// Get session details validation schema
export const getSessionDetailsSchema = z.object({
  user_id: z.string().uuid("Valid user ID is required"),
});

// Export types
export type SessionDetailsFormData = z.infer<typeof sessionDetailsSchema>;
export type SessionDetailsUpdateData = z.infer<
  typeof sessionDetailsUpdateSchema
>;
export type GetSessionDetailsData = z.infer<typeof getSessionDetailsSchema>;

// Response interfaces
export interface SessionDetailsResponse {
  availability: {
    id: string;
    user_id: string;
    session_duration: number;
    session_price: number;
    title: string;
    description: string;
    is_active: boolean;
    booking_url?: string;
    calendly_event_type_uri?: string;
    event_type_name?: string;
    created_at: string;
    updated_at: string;
  } | null;
}

export interface SessionDetailsUpdateResponse {
  success: boolean;
  message: string;
}

// Validation helper functions
export const validateSessionDetails = (data: any): SessionDetailsFormData => {
  return sessionDetailsSchema.parse(data);
};

export const validateSessionDetailsUpdate = (
  data: any
): SessionDetailsUpdateData => {
  return sessionDetailsUpdateSchema.parse(data);
};

export const validateGetSessionDetails = (data: any): GetSessionDetailsData => {
  return getSessionDetailsSchema.parse(data);
};
