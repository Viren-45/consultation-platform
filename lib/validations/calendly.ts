// lib/validations/calendly.ts
import { z } from "zod";

// Calendly integration validation schema
export const calendlyIntegrationSchema = z.object({
  calendlyConnected: z.boolean(),
  calendlyUrl: z.string().url().optional(),
  calendlyUsername: z.string().optional(),
});

// OAuth callback validation schema
export const calendlyOAuthCallbackSchema = z.object({
  code: z.string().min(1, "Authorization code is required"),
  state: z.string().min(1, "State parameter is required"),
  error: z.string().optional().nullable(),
});

// OAuth initiation validation schema
export const calendlyOAuthInitiationSchema = z.object({
  user_id: z.string().uuid("Valid user ID is required"),
});

// Integration status validation schema
export const calendlyIntegrationStatusSchema = z.object({
  user_id: z.string().uuid("Valid user ID is required"),
});

// Token refresh validation schema
export const calendlyTokenRefreshSchema = z.object({
  user_id: z.string().uuid("Valid user ID is required"),
});

// Export types
export type CalendlyIntegrationData = z.infer<typeof calendlyIntegrationSchema>;
export type CalendlyOAuthCallbackData = z.infer<
  typeof calendlyOAuthCallbackSchema
>;
export type CalendlyOAuthInitiationData = z.infer<
  typeof calendlyOAuthInitiationSchema
>;
export type CalendlyIntegrationStatusData = z.infer<
  typeof calendlyIntegrationStatusSchema
>;
export type CalendlyTokenRefreshData = z.infer<
  typeof calendlyTokenRefreshSchema
>;

// Integration response types
export interface CalendlyIntegrationResponse {
  connected: boolean;
  integration?: {
    username: string;
    email: string;
    name: string;
    status: string;
    connectedAt: string;
    schedulingUrl: string;
    timezone: string;
  } | null;
}

export interface CalendlyOAuthResponse {
  success: boolean;
  message: string;
  redirectUrl?: string;
}

export interface CalendlyTokenRefreshResponse {
  success: boolean;
  message: string;
}
