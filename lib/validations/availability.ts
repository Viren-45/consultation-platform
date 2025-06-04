// lib/validations/availability.ts
import { z } from "zod";

// Valid timezone values (commonly used timezones)
const validTimezones = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Toronto",
  "America/Vancouver",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Madrid",
  "Europe/Rome",
  "Europe/Amsterdam",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Seoul",
  "Asia/Kolkata",
  "Asia/Dubai",
  "Asia/Singapore",
  "Australia/Sydney",
  "Australia/Melbourne",
  "Pacific/Auckland",
] as const;

// Valid session durations in minutes
const validDurations = ["15", "30", "45", "60", "90", "120"] as const;

// Availability validation schema
export const availabilitySchema = z.object({
  timezone: z.enum(validTimezones, {
    errorMap: () => ({ message: "Please select a valid timezone" }),
  }),
  preferredDuration: z.enum(validDurations, {
    errorMap: () => ({ message: "Please select a valid session duration" }),
  }),
});

// Calendly connection validation schema
export const calendlyConnectionSchema = z.object({
  calendlyUrl: z
    .string()
    .url("Please enter a valid Calendly URL")
    .regex(
      /^https:\/\/calendly\.com\/[a-zA-Z0-9_-]+/,
      "Please enter a valid Calendly booking URL"
    )
    .optional(),
  calendlyConnected: z.boolean(),
  calendlyAccessToken: z.string().optional(),
});

// Combined availability data schema
export const fullAvailabilitySchema = availabilitySchema.merge(
  calendlyConnectionSchema
);

// Export types
export type AvailabilityFormData = z.infer<typeof availabilitySchema>;
export type CalendlyConnectionData = z.infer<typeof calendlyConnectionSchema>;
export type FullAvailabilityData = z.infer<typeof fullAvailabilitySchema>;

// Additional interface for component props
export interface AvailabilityData extends FullAvailabilityData {
  // Add any additional fields that might be needed for the component
  userId?: string;
  updatedAt?: string;
}

// Helper function to validate timezone
export const isValidTimezone = (timezone: string): boolean => {
  return validTimezones.includes(timezone as (typeof validTimezones)[number]);
};

// Helper function to get timezone display name
export const getTimezoneDisplayName = (timezone: string): string => {
  const timezoneMap: Record<string, string> = {
    "America/New_York": "Eastern Time (ET)",
    "America/Chicago": "Central Time (CT)",
    "America/Denver": "Mountain Time (MT)",
    "America/Los_Angeles": "Pacific Time (PT)",
    "America/Toronto": "Toronto (ET)",
    "America/Vancouver": "Vancouver (PT)",
    "Europe/London": "London (GMT)",
    "Europe/Paris": "Paris (CET)",
    "Europe/Berlin": "Berlin (CET)",
    "Europe/Madrid": "Madrid (CET)",
    "Europe/Rome": "Rome (CET)",
    "Europe/Amsterdam": "Amsterdam (CET)",
    "Asia/Tokyo": "Tokyo (JST)",
    "Asia/Shanghai": "Shanghai (CST)",
    "Asia/Seoul": "Seoul (KST)",
    "Asia/Kolkata": "Mumbai (IST)",
    "Asia/Dubai": "Dubai (GST)",
    "Asia/Singapore": "Singapore (SGT)",
    "Australia/Sydney": "Sydney (AEDT)",
    "Australia/Melbourne": "Melbourne (AEDT)",
    "Pacific/Auckland": "Auckland (NZDT)",
  };

  return timezoneMap[timezone] || timezone;
};

// Helper function to get duration display name
export const getDurationDisplayName = (duration: string): string => {
  const durationMap: Record<string, string> = {
    "15": "15 minutes",
    "30": "30 minutes",
    "45": "45 minutes",
    "60": "1 hour",
    "90": "1.5 hours",
    "120": "2 hours",
  };

  return durationMap[duration] || `${duration} minutes`;
};

// Helper function to get all available timezones for dropdown
export const getAvailableTimezones = () => {
  return validTimezones.map((timezone) => ({
    value: timezone,
    label: getTimezoneDisplayName(timezone),
  }));
};

// Helper function to get all available durations for dropdown
export const getAvailableDurations = () => {
  return validDurations.map((duration) => ({
    value: duration,
    label: getDurationDisplayName(duration),
  }));
};

// Validation for backend API endpoints
export const updateAvailabilitySchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  timezone: z.enum(validTimezones),
  preferredDuration: z.enum(validDurations),
});

export const updateCalendlySchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  calendlyUrl: z.string().url().optional(),
  calendlyConnected: z.boolean(),
  calendlyAccessToken: z.string().optional(),
});
