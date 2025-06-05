// lib/validations/linkedin-extraction.ts
import { z } from "zod";

// Work experience position schema
const WorkExperiencePositionSchema = z.object({
  title: z.string(),
  company: z.string(),
  duration: z.string().optional(),
  description: z.string().optional(),
  key_projects: z.array(z.string()).default([]),
});

// Work experience schema
const WorkExperienceSchema = z.object({
  positions: z.array(WorkExperiencePositionSchema).default([]),
});

// Core extraction schema matching your database structure
export const LinkedInExtractionSchema = z.object({
  // Personal Information
  full_name: z.string().min(1, "Full name is required"),

  // Current Position (maps to current_job_title, current_company)
  current_job_title: z.string().optional().nullable(),
  current_company: z.string().optional().nullable(),

  // Industry & Location (maps to primary_industry, location_city, location_country)
  primary_industry: z.string().optional().nullable(),
  location_city: z.string().optional().nullable(),
  location_country: z.string().optional().nullable(),

  // Experience (maps to years_of_experience)
  years_of_experience: z.number().min(0).max(50).default(0),

  // Expertise Categories (maps to primary_category, secondary_categories, specializations)
  primary_category: z
    .enum([
      "Marketing",
      "Legal",
      "Product",
      "Technology",
      "Finance",
      "Business Strategy",
      "Human Resources",
      "Sales",
      "Operations",
      "Design",
      "Consulting",
    ])
    .default("Business Strategy"),

  secondary_categories: z.array(z.string()).default([]),
  specializations: z.array(z.string()).default([]),

  // Professional Background (maps to previous_companies, education, certifications, languages)
  previous_companies: z.array(z.string()).default([]),
  education: z.array(z.string()).default([]),
  certifications: z.array(z.string()).default([]),
  languages: z.array(z.string()).default([]),

  // LinkedIn Content (maps to linkedin_summary, key_skills, work_experience)
  linkedin_summary: z.string().optional().nullable(),
  key_skills: z.array(z.string()).default([]),
  work_experience: WorkExperienceSchema.optional().nullable(),

  // AI Matching Metadata (maps to expertise_keywords, target_client_types)
  expertise_keywords: z.array(z.string()).default([]),
  target_client_types: z
    .array(
      z.enum([
        "Startup",
        "SMB",
        "Enterprise",
        "Non-profit",
        "Freelancer",
        "Individual",
      ])
    )
    .default(["Startup", "SMB"]),

  // Processing Status (maps to pdf_processed, processing_status)
  pdf_processed: z.boolean().default(true),
  processing_status: z.string().default("completed"),

  // Metadata for validation
  extraction_confidence: z.number().min(0).max(1).default(0.5),
  processing_notes: z.string().optional().nullable(),
});

// Processing result schema
export const ExtractionResultSchema = z.object({
  success: z.boolean(),
  data: LinkedInExtractionSchema.optional(),
  error: z.string().optional(),
  confidence_score: z.number().min(0).max(1).default(0),
  processing_time_ms: z.number().default(0),
  extraction_method: z.string().default("langchain"),
  fallback_used: z.boolean().default(false),
});

// Input validation for extraction service
export const ExtractionInputSchema = z.object({
  user_id: z.string().uuid("Valid user ID required"),
  pdf_buffer: z.instanceof(Buffer, { message: "Valid PDF buffer required" }),
  extraction_options: z
    .object({
      max_pages: z.number().min(1).max(10).default(5),
      include_images: z.boolean().default(false),
      confidence_threshold: z.number().min(0).max(1).default(0.3),
      fallback_enabled: z.boolean().default(false), // Changed to false since you don't want fallbacks
    })
    .optional()
    .default({}),
});

// Database save schema - matches your expert_profiles table exactly
export const ExpertProfileSaveSchema = z.object({
  user_id: z.string().uuid(),
  current_job_title: z.string().nullable(),
  current_company: z.string().nullable(),
  primary_industry: z.string().nullable(),
  years_of_experience: z.number().min(0).max(50),
  location_city: z.string().nullable(),
  location_country: z.string().nullable(),
  primary_category: z.string(),
  secondary_categories: z.array(z.string()),
  specializations: z.array(z.string()),
  previous_companies: z.array(z.string()),
  education: z.array(z.string()),
  certifications: z.array(z.string()),
  languages: z.array(z.string()),
  linkedin_summary: z.string().nullable(),
  key_skills: z.array(z.string()),
  work_experience: z.any().nullable(), // JSON field
  expertise_keywords: z.array(z.string()),
  target_client_types: z.array(z.string()),
  pdf_processed: z.boolean(),
  processing_status: z.string(),
  last_processed_at: z.string(), // ISO string
  created_at: z.string().optional(), // ISO string
});

// Export types
export type LinkedInExtractionData = z.infer<typeof LinkedInExtractionSchema>;
export type ExtractionResult = z.infer<typeof ExtractionResultSchema>;
export type ExtractionInput = z.infer<typeof ExtractionInputSchema>;
export type ExpertProfileSaveData = z.infer<typeof ExpertProfileSaveSchema>;

// Validation helpers
export const validateExtractionData = (
  data: unknown
): LinkedInExtractionData => {
  return LinkedInExtractionSchema.parse(data);
};

export const validateExtractionResult = (result: unknown): ExtractionResult => {
  return ExtractionResultSchema.parse(result);
};

export const validateExtractionInput = (input: unknown): ExtractionInput => {
  return ExtractionInputSchema.parse(input);
};

export const validateExpertProfileSave = (
  data: unknown
): ExpertProfileSaveData => {
  return ExpertProfileSaveSchema.parse(data);
};

// Error types for better error handling
export class ExtractionValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = "ExtractionValidationError";
  }
}

export class ExtractionProcessingError extends Error {
  constructor(message: string, public step?: string) {
    super(message);
    this.name = "ExtractionProcessingError";
  }
}

// Confidence level helpers
export const getConfidenceLevel = (score: number): string => {
  if (score >= 0.8) return "high";
  if (score >= 0.6) return "medium";
  if (score >= 0.4) return "low";
  return "very_low";
};

export const isExtractionReliable = (result: ExtractionResult): boolean => {
  return result.confidence_score >= 0.6 && result.success;
};

// Helper to transform extraction data to database format
export const transformToDbFormat = (
  data: LinkedInExtractionData
): Omit<ExpertProfileSaveData, "user_id"> => {
  return {
    current_job_title: data.current_job_title ?? null,
    current_company: data.current_company ?? null,
    primary_industry: data.primary_industry ?? null,
    years_of_experience: data.years_of_experience,
    location_city: data.location_city ?? null,
    location_country: data.location_country ?? null,
    primary_category: data.primary_category,
    secondary_categories: data.secondary_categories,
    specializations: data.specializations,
    previous_companies: data.previous_companies,
    education: data.education,
    certifications: data.certifications,
    languages: data.languages,
    linkedin_summary: data.linkedin_summary ?? null,
    key_skills: data.key_skills,
    work_experience: data.work_experience ?? null,
    expertise_keywords: data.expertise_keywords,
    target_client_types: data.target_client_types,
    pdf_processed: data.pdf_processed,
    processing_status: data.processing_status,
    last_processed_at: new Date().toISOString(),
  };
};
