// app/api/expert/process-linkedin/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase-server";
import * as pdfParse from "pdf-parse";

/**
 * POST: Process LinkedIn PDF and extract expert profile data
 * This endpoint handles the complete onboarding flow
 */
export async function POST(request: NextRequest) {
  try {
    const { user_id } = await request.json();

    if (!user_id) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    console.log(`Starting LinkedIn PDF processing for user: ${user_id}`);

    // 1. Get user profile with LinkedIn PDF URL
    const { data: userProfile, error: profileError } = await supabase
      .from("user_profiles")
      .select("linkedin_pdf_url, linkedin_pdf_uploaded, first_name, last_name")
      .eq("id", user_id)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    if (!userProfile.linkedin_pdf_uploaded || !userProfile.linkedin_pdf_url) {
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
      // 3. Download and parse the PDF
      console.log("Fetching PDF from:", userProfile.linkedin_pdf_url);
      const pdfContent = await fetchAndParsePDF(userProfile.linkedin_pdf_url);

      if (!pdfContent) {
        throw new Error("Failed to extract text from PDF");
      }

      // 4. Extract structured data using AI
      console.log("Extracting data with AI...");
      const extractedData = await extractDataWithAI(pdfContent);

      if (extractedData.error) {
        throw new Error(
          extractedData.message || "Failed to process PDF with AI"
        );
      }

      // 5. Save extracted data to expert_profiles table
      console.log("Saving extracted data to database...");
      await saveExpertProfile(user_id, extractedData);

      // 6. Mark onboarding as completed
      console.log("Completing onboarding...");
      await completeOnboarding(user_id);

      // 7. Update processing status to completed
      await updateProcessingStatus(user_id, "completed");

      console.log(
        `LinkedIn PDF processing completed successfully for user: ${user_id}`
      );

      return NextResponse.json({
        success: true,
        message: "LinkedIn profile processed successfully",
        data: {
          name: extractedData.full_name,
          title: extractedData.current_title,
          company: extractedData.current_company,
        },
      });
    } catch (processingError) {
      console.error("Processing error:", processingError);

      // Update status to error
      await updateProcessingStatus(user_id, "error");

      throw processingError;
    }
  } catch (error) {
    console.error("LinkedIn processing error:", error);
    return NextResponse.json(
      {
        error: "Failed to process LinkedIn profile",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Fetch PDF from Supabase storage and extract text content
 */
async function fetchAndParsePDF(pdfUrl: string): Promise<string | null> {
  try {
    console.log("Fetching PDF from:", pdfUrl);

    // Download the PDF file
    const response = await fetch(pdfUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.statusText}`);
    }

    const pdfBuffer = await response.arrayBuffer();

    // Use pdfjs-dist for reliable PDF text extraction
    const pdfjsLib = await import("pdfjs-dist");

    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(pdfBuffer),
      useSystemFonts: true,
    });

    const pdf = await loadingTask.promise;
    let fullText = "";

    // Extract text from each page (limit to first 5 pages for performance)
    const numPages = Math.min(pdf.numPages, 5);

    for (let i = 1; i <= numPages; i++) {
      try {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();

        // Combine text items with proper spacing
        const pageText = textContent.items
          .map((item: any) => {
            if (item.str) {
              return item.str;
            }
            return "";
          })
          .filter((text) => text.trim().length > 0)
          .join(" ");

        if (pageText.trim()) {
          fullText += pageText + "\n\n";
        }

        // Clean up page resources
        page.cleanup();
      } catch (pageError) {
        console.warn(`Error extracting text from page ${i}:`, pageError);
        continue;
      }
    }

    // Clean up PDF resources
    pdf.destroy();

    if (!fullText.trim()) {
      throw new Error("No text could be extracted from the PDF");
    }

    // Clean up the extracted text
    fullText = fullText
      .replace(/\s+/g, " ") // Replace multiple spaces with single space
      .replace(/\n\s*\n/g, "\n") // Remove empty lines
      .trim();

    console.log(
      `Successfully extracted ${fullText.length} characters from PDF`
    );
    return fullText;
  } catch (error) {
    console.error("PDF parsing error:", error);

    // Fallback: return a note that the PDF was uploaded but couldn't be parsed
    console.log("PDF parsing failed, using fallback approach");
    return `
    LinkedIn Profile Document Uploaded
    
    Note: A LinkedIn PDF was successfully uploaded but text extraction encountered technical difficulties.
    Please provide the following information for your expert profile:
    
    Full Name: [Please specify]
    Current Title: [Please specify]
    Current Company: [Please specify]
    Years of Experience: [Please specify]
    Location: [Please specify]
    Key Skills: [Please specify]
    Industry Background: [Please specify]
    
    The profile will be created based on available information and can be updated later.
    `;
  }
}

/**
 * Extract structured data using AI/OpenAI
 */
async function extractDataWithAI(pdfContent: string): Promise<any> {
  try {
    // Enhanced AI prompt with category determination
    const prompt = `You are a professional data extractor that reads LinkedIn PDF resumes and converts them into structured information for an expert consultation platform.

TASK: Extract expertise metadata to enable AI-powered client-expert matching.

If the document appears corrupted, incomplete, or not a LinkedIn resume, return:
{"error": "invalid_pdf", "message": "Unable to process this document"}

Otherwise, extract these fields:

- full_name: (string - person's full name)
- headline: (string - LinkedIn headline or create from current role)
- summary: (string - 1-2 sentence professional summary from About section)
- current_title: (string - most recent job title)
- current_company: (string - most recent company)
- location: (string - current city/country)
- years_experience: (integer - total years from earliest job to present, 0-50 range)
- top_skills: (array - 5-10 key skills/expertise areas)
- industries: (array - standardized industry categories they've worked in)
- companies_worked_at: (array - unique company names from work history)
- education: (array - schools and degrees as strings)
- certifications: (array - professional certifications and licenses)
- languages: (array - spoken languages if mentioned)
- keywords: (array - 15-20 matching terms: roles, skills, tools, domains)
- primary_category: (string - determine from role/industry, choose from: "Marketing", "Legal", "Product", "Technology", "Finance", "Business Strategy", "Human Resources", "Sales", "Operations", "Design", "Consulting")
- expertise_level: (string - based on experience and titles: "Junior", "Mid-level", "Senior", "Executive")
- target_client_types: (array - infer who they'd best help based on background: ["Startup", "SMB", "Enterprise", "Non-profit"])
- specializations: (array - specific sub-areas of expertise within their field)

REQUIREMENTS:
- Only include confidently available information
- Return null/empty array for missing data
- Standardize industry names to common categories
- Ensure unique, clean array values
- Return ONLY valid JSON, no other text
- Be smart about categorization - consider full context not just job titles

Here is the LinkedIn resume content:
---
${pdfContent}
---`;

    // Call OpenAI API (you'll need to configure this)
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 2500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const aiResponse = await response.json();
    const extractedText = aiResponse.choices[0]?.message?.content;

    if (!extractedText) {
      throw new Error("No response from AI");
    }

    // Parse the JSON response
    try {
      const extractedData = JSON.parse(extractedText);
      return extractedData;
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", extractedText);
      throw new Error("AI returned invalid JSON format");
    }
  } catch (error) {
    console.error("AI extraction error:", error);
    throw error;
  }
}

/**
 * Save extracted data to expert_profiles table
 */
async function saveExpertProfile(userId: string, data: any): Promise<void> {
  try {
    const profileData = {
      user_id: userId,

      // Basic Info (from LinkedIn)
      current_job_title: data.current_title || null,
      current_company: data.current_company || null,
      primary_industry: data.industries?.[0] || null,
      years_of_experience: data.years_experience || 0,
      location_city: data.location?.split(",")[0]?.trim() || null,
      location_country: data.location?.split(",")[1]?.trim() || null,

      // Expertise Categories (AI-determined)
      primary_category: data.primary_category || "Business Strategy",
      secondary_categories: data.industries?.slice(1) || [],
      specializations: data.specializations || data.top_skills || [],

      // Experience & Credibility
      previous_companies: data.companies_worked_at || [],
      education: data.education || [],
      certifications: data.certifications || [],
      languages: data.languages || [],

      // Extracted Content
      linkedin_summary: data.summary || null,
      key_skills: data.top_skills || [],
      work_experience: null, // Could be enhanced later with detailed work history

      // AI Matching Metadata
      expertise_keywords: data.keywords || [],
      target_client_types: data.target_client_types || [
        "Startup",
        "SMB",
        "Enterprise",
      ],

      // Processing Status
      pdf_processed: true,
      processing_status: "completed",
      last_processed_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("expert_profiles")
      .upsert(profileData, { onConflict: "user_id" });

    if (error) {
      throw new Error(`Failed to save expert profile: ${error.message}`);
    }

    console.log("Expert profile saved successfully:", {
      user_id: userId,
      name: data.full_name,
      category: data.primary_category,
      level: data.expertise_level,
    });
  } catch (error) {
    console.error("Save expert profile error:", error);
    throw error;
  }
}

/**
 * Determine primary category from job title and industries
 */
function determinePrimaryCategory(
  currentTitle?: string,
  industries?: string[]
): string {
  const title = (currentTitle || "").toLowerCase();
  const industryList = (industries || []).map((i) => i.toLowerCase());

  // Simple category mapping - you can enhance this
  if (title.includes("marketing") || industryList.includes("marketing"))
    return "Marketing";
  if (
    title.includes("legal") ||
    title.includes("lawyer") ||
    industryList.includes("legal")
  )
    return "Legal";
  if (title.includes("product") || title.includes("pm")) return "Product";
  if (
    title.includes("engineer") ||
    title.includes("developer") ||
    title.includes("tech")
  )
    return "Technology";
  if (
    title.includes("finance") ||
    title.includes("financial") ||
    industryList.includes("finance")
  )
    return "Finance";
  if (title.includes("consultant") || title.includes("strategy"))
    return "Business Strategy";
  if (title.includes("hr") || title.includes("people"))
    return "Human Resources";
  if (title.includes("sales") || title.includes("business development"))
    return "Sales";

  // Default fallback
  return industries?.[0] || "Business Strategy";
}

/**
 * Complete onboarding and update user profile
 */
async function completeOnboarding(userId: string): Promise<void> {
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

    console.log("Onboarding completed successfully for user:", userId);
  } catch (error) {
    console.error("Complete onboarding error:", error);
    throw error;
  }
}

/**
 * Update processing status in expert_profiles
 */
async function updateProcessingStatus(
  userId: string,
  status: string
): Promise<void> {
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
      // Don't throw - this is not critical
    }
  } catch (error) {
    console.warn("Update processing status error:", error);
    // Don't throw - this is not critical
  }
}
