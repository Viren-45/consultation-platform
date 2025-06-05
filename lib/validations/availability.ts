// lib/validations/availability.ts
import { z } from "zod";

// Availability check validation schema
export const availabilityCheckSchema = z.object({
  user_id: z.string().uuid("Valid user ID is required"),
});

// Availability data from Calendly API
export const calendlyAvailabilitySchema = z.object({
  hasActiveEventTypes: z.boolean(),
  schedulingUrl: z.string().url().optional(),
  totalEventTypes: z.number().optional(),
  activeEventTypes: z.number().optional(),
  lastFetched: z.string().optional(),
});

// Basic availability confirmation for onboarding
export const availabilityConfirmationSchema = z.object({
  user_id: z.string().uuid("Valid user ID is required"),
  has_active_event_types: z.boolean(),
  scheduling_url: z.string().url().optional(),
});

// Export types
export type AvailabilityCheckData = z.infer<typeof availabilityCheckSchema>;
export type CalendlyAvailabilityData = z.infer<
  typeof calendlyAvailabilitySchema
>;
export type AvailabilityConfirmationData = z.infer<
  typeof availabilityConfirmationSchema
>;

// Response interfaces
export interface AvailabilityResponse {
  hasActiveEventTypes: boolean;
  schedulingUrl?: string | null;
  totalEventTypes?: number;
  activeEventTypes?: number;
  lastFetched?: string;
  lastError?: string;
}

export interface AvailabilityConfirmationResponse {
  success: boolean;
  message: string;
}
