// app/api/expert/process-linkedin/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase-server";
import { extractLinkedInData } from "@/lib/langchain/linkedin-extractor";

export async function POST(request: NextRequest) {
  try {
    const { user_id } = await request.json();

    if (!user_id) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    console.log(`Starting LinkedIn PDF processing for expert: ${user_id}`);

    // 1. Get user profile
    const { data: userProfile, error: profileError } = await supabase
      .from("user_profiles")
      .select("linkedin_pdf_url, linkedin_pdf_uploaded, first_name, last_name")
      .eq("id", user_id)
      .single();

    if (profileError || !userProfile?.linkedin_pdf_uploaded) {
      return NextResponse.json(
        {
          error:
            "No LinkedIn PDF found. Please upload your LinkedIn PDF first.",
        },
        { status: 400 }
      );
    }

    // 2. Update processing status
    await updateProcessingStatus(user_id, "processing");

    try {
      // 3. Download PDF from Supabase
      console.log("Downloading PDF from Supabase...");
      const filePath = `${user_id}/linkedin_profile.pdf`;

      const { data: pdfData, error: downloadError } = await supabase.storage
        .from("linkedin-pdfs")
        .download(filePath);

      if (downloadError || !pdfData) {
        throw new Error(`Failed to download PDF: ${downloadError?.message}`);
      }

      // 4. Convert to buffer
      const pdfBuffer = Buffer.from(await pdfData.arrayBuffer());
      console.log(`PDF downloaded successfully: ${pdfBuffer.length} bytes`);

      // 5. Extract expert profile data with enhanced AI
      console.log("Extracting expert profile data...");
      const extractedData = await extractLinkedInData(pdfBuffer);

      // 6. Save to expert_profiles table with all database fields
      console.log("Saving expert profile to database...");
      await saveExpertProfile(user_id, extractedData);

      // 7. Complete onboarding
      await completeOnboarding(user_id);

      // 8. Update processing status
      await updateProcessingStatus(user_id, "completed");

      console.log("Expert profile processing completed successfully");

      return NextResponse.json({
        success: true,
        message: "Expert profile processed successfully",
        data: {
          name: extractedData.full_name,
          title: extractedData.current_job_title,
          company: extractedData.current_company,
          category: extractedData.primary_category,
          specializations: extractedData.specializations?.slice(0, 3),
          target_clients: extractedData.target_client_types,
        },
      });
    } catch (processingError) {
      console.error("Expert profile processing error:", processingError);
      await updateProcessingStatus(user_id, "error");
      throw processingError;
    }
  } catch (error) {
    console.error("LinkedIn processing error:", error);
    return NextResponse.json(
      {
        error: "Failed to process expert profile",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Save extracted data to expert_profiles table - matches your database schema exactly
 */
async function saveExpertProfile(userId: string, data: any) {
  try {
    const profileData = {
      user_id: userId,

      // Basic Information
      current_job_title: data.current_job_title,
      current_company: data.current_company,
      primary_industry: data.primary_industry,
      years_of_experience: data.years_of_experience,
      location_city: data.location_city,
      location_country: data.location_country,

      // Expertise Categories (crucial for AI matching)
      primary_category: data.primary_category,
      secondary_categories: data.secondary_categories,
      specializations: data.specializations,

      // Professional Background
      previous_companies: data.previous_companies,
      education: data.education,
      certifications: data.certifications,
      languages: data.languages,

      // LinkedIn Content
      linkedin_summary: data.linkedin_summary,
      key_skills: data.key_skills,
      work_experience: data.work_experience, // JSON field

      // AI Matching Metadata (key for expert-client matching)
      expertise_keywords: data.expertise_keywords,
      target_client_types: data.target_client_types,

      // Processing Status
      pdf_processed: data.pdf_processed,
      processing_status: data.processing_status,
      last_processed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    console.log("Saving expert profile data:", {
      user_id: userId,
      name: data.full_name,
      category: data.primary_category,
      specializations_count: data.specializations?.length || 0,
      keywords_count: data.expertise_keywords?.length || 0,
      target_types: data.target_client_types,
    });

    const { error } = await supabase
      .from("expert_profiles")
      .upsert(profileData, { onConflict: "user_id" });

    if (error) {
      console.error("Database save error:", error);
      throw new Error(`Failed to save expert profile: ${error.message}`);
    }

    console.log("Expert profile saved successfully");
  } catch (error) {
    console.error("Save expert profile error:", error);
    throw error;
  }
}

/**
 * Complete onboarding process
 */
async function completeOnboarding(userId: string) {
  try {
    const { error } = await supabase
      .from("user_profiles")
      .update({
        onboarding_completed: true,
        onboarding_step: 6, // Final step
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      throw new Error(`Failed to complete onboarding: ${error.message}`);
    }

    console.log("Onboarding completed for expert:", userId);
  } catch (error) {
    console.error("Complete onboarding error:", error);
    throw error;
  }
}

/**
 * Update processing status in expert_profiles
 */
async function updateProcessingStatus(userId: string, status: string) {
  try {
    const { error } = await supabase.from("expert_profiles").upsert(
      {
        user_id: userId,
        processing_status: status,
        last_processed_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    if (error) {
      console.warn("Failed to update processing status:", error);
    }
  } catch (error) {
    console.warn("Update processing status error:", error);
  }
}
