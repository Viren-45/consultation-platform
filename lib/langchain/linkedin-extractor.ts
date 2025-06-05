// lib/langchain/linkedin-extractor.ts
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { ChatOpenAI } from "@langchain/openai";

export interface ExtractedLinkedInData {
  // Personal & Basic Info
  full_name: string;
  current_job_title?: string;
  current_company?: string;
  primary_industry?: string;
  years_of_experience: number;
  location_city?: string;
  location_country?: string;

  // Expertise Categories (AI-determined for expert matching)
  primary_category: string;
  secondary_categories: string[];
  specializations: string[];

  // Professional Background
  previous_companies: string[];
  education: string[];
  certifications: string[];
  languages: string[];

  // LinkedIn Content
  linkedin_summary?: string;
  key_skills: string[];
  work_experience?: any; // JSON object with detailed work history

  // AI Matching Metadata (crucial for your expert-client matching)
  expertise_keywords: string[];
  target_client_types: string[];

  // Processing metadata
  pdf_processed: boolean;
  processing_status: string;
}

export async function extractLinkedInData(
  pdfBuffer: Buffer
): Promise<ExtractedLinkedInData> {
  try {
    // 1. Parse PDF with LangChain
    console.log("Parsing PDF with LangChain...");
    const blob = new Blob([pdfBuffer], { type: "application/pdf" });
    const loader = new PDFLoader(blob);
    const docs = await loader.load();

    // 2. Combine all pages
    const fullText = docs.map((doc) => doc.pageContent).join("\n\n");
    console.log(`Extracted ${fullText.length} characters from PDF`);

    if (fullText.length < 100) {
      throw new Error("PDF contains insufficient text content");
    }

    // 3. Extract data with AI using enhanced prompt for expert matching
    console.log("Extracting expert profile data with AI...");
    const llm = new ChatOpenAI({
      modelName: "gpt-4o",
      temperature: 0.1,
      maxTokens: 3500,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `You are an expert profile analyzer for a micro-consultation platform where clients get matched with experts for quick 15-30 minute advice sessions.

Your job is to extract and intelligently categorize LinkedIn profile data to enable AI-powered expert-client matching.

CONTEXT: This platform helps busy professionals find the right expert for specific challenges like:
- Startup founders needing pricing strategy validation
- Marketing managers wanting campaign feedback  
- Small business owners with legal questions
- Product managers needing technical architecture advice

CRITICAL INSTRUCTIONS:
- Return ONLY a clean JSON object, no markdown formatting, no code blocks
- Do not use \`\`\`json or \`\`\` anywhere in your response
- Ensure each field appears only once
- Focus on data that helps match experts to client needs

Extract these fields exactly:
{
  "full_name": "person's full name",
  "current_job_title": "most recent job title",
  "current_company": "current/most recent company name",
  "primary_industry": "main industry they work in (standardized: Technology, Finance, Marketing, Healthcare, Legal, Consulting, etc.)",
  "years_of_experience": calculate total professional years (number),
  "location_city": "city only",
  "location_country": "country only", 
  "primary_category": "choose ONE from: Marketing, Legal, Product, Technology, Finance, Business Strategy, Human Resources, Sales, Operations, Design, Consulting",
  "secondary_categories": ["secondary expertise areas from the same list"],
  "specializations": ["specific expertise areas within their field - what specific problems can they solve?"],
  "previous_companies": ["all companies they've worked at"],
  "education": ["school name - degree/program"],
  "certifications": ["professional certifications and licenses"],
  "languages": ["spoken languages if mentioned"],
  "linkedin_summary": "their About/Summary section (preserve original text if available)",
  "key_skills": ["top 10-15 professional skills mentioned"],
  "work_experience": {
    "positions": [
      {
        "title": "job title",
        "company": "company name", 
        "duration": "time period",
        "description": "key responsibilities and achievements",
        "key_projects": ["notable projects or achievements"]
      }
    ]
  },
  "expertise_keywords": ["15-20 terms that describe their expertise - think what clients would search for"],
  "target_client_types": ["WHO would benefit from their expertise - choose from: Startup, SMB, Enterprise, Non-profit, Freelancer, Individual"]
}

INTELLIGENT CATEGORIZATION RULES:

For PRIMARY_CATEGORY:
- Technology: Developers, engineers, CTOs, data scientists, product managers
- Marketing: Marketing managers, growth experts, brand strategists, digital marketers
- Finance: CFOs, financial analysts, accountants, investment advisors
- Legal: Lawyers, compliance experts, regulatory specialists
- Business Strategy: Consultants, business analysts, strategy directors, executives
- Human Resources: HR directors, talent acquisition, organizational development
- Sales: Sales directors, business development, sales operations
- Operations: Operations managers, supply chain, process improvement
- Design: UX/UI designers, creative directors, brand designers
- Consulting: Management consultants, industry specialists

For SPECIALIZATIONS (be specific about what problems they solve):
- Instead of "marketing" → "B2B SaaS marketing", "social media advertising", "conversion optimization"
- Instead of "technology" → "cloud migration", "API architecture", "mobile app development"
- Instead of "finance" → "startup fundraising", "financial modeling", "tax optimization"

For TARGET_CLIENT_TYPES (who would hire them):
- Startup: Early-stage experience, entrepreneurial background, growth focus
- SMB: Mid-market experience, practical solutions, cost-conscious approaches  
- Enterprise: Large company experience, complex systems, compliance knowledge
- Non-profit: Mission-driven experience, resource constraints understanding
- Freelancer: Solo consultant experience, independent contractor knowledge
- Individual: Personal services, individual coaching, career advice

For EXPERTISE_KEYWORDS (what clients would search for):
Include role-based terms, industry terms, problem-solving terms, tools/technologies, methodologies

LinkedIn Profile Content:
---
${fullText}
---

Return clean JSON only:`;

    const response = await llm.invoke(prompt);
    let extractedText = response.content as string;

    console.log("Raw AI response length:", extractedText.length);

    // 4. Clean the response
    extractedText = cleanJsonResponse(extractedText);

    // 5. Parse and validate
    try {
      const extractedData = JSON.parse(extractedText);
      const validatedData = validateAndCleanExpertData(extractedData);

      console.log("Successfully extracted expert profile data:", {
        name: validatedData.full_name,
        category: validatedData.primary_category,
        specializations: validatedData.specializations?.slice(0, 3),
        target_types: validatedData.target_client_types,
      });

      return validatedData;
    } catch (parseError) {
      console.error(
        "Failed to parse AI response:",
        extractedText.substring(0, 500)
      );
      throw new Error(
        `AI returned invalid JSON: ${
          parseError instanceof Error ? parseError.message : "Parse error"
        }`
      );
    }
  } catch (error) {
    console.error("LinkedIn extraction error:", error);
    throw error;
  }
}

/**
 * Clean the AI response to ensure it's valid JSON
 */
function cleanJsonResponse(response: string): string {
  // Remove markdown code blocks
  let cleaned = response.replace(/```json\s*/g, "").replace(/```\s*/g, "");

  // Remove any text before the first {
  const firstBrace = cleaned.indexOf("{");
  if (firstBrace > 0) {
    cleaned = cleaned.substring(firstBrace);
  }

  // Remove any text after the last }
  const lastBrace = cleaned.lastIndexOf("}");
  if (lastBrace > 0 && lastBrace < cleaned.length - 1) {
    cleaned = cleaned.substring(0, lastBrace + 1);
  }

  // Try to parse and re-stringify to remove duplicates
  try {
    const parsed = JSON.parse(cleaned);
    return JSON.stringify(parsed);
  } catch {
    // If parsing fails, try to fix common issues
    cleaned = cleaned.replace(/,(\s*[}\]])/g, "$1"); // Remove trailing commas

    // Try to extract just the first complete JSON object
    let braceCount = 0;
    let result = "";
    let inString = false;
    let escapeNext = false;

    for (let i = 0; i < cleaned.length; i++) {
      const char = cleaned[i];

      if (escapeNext) {
        result += char;
        escapeNext = false;
        continue;
      }

      if (char === "\\") {
        escapeNext = true;
        result += char;
        continue;
      }

      if (char === '"' && !escapeNext) {
        inString = !inString;
      }

      if (!inString) {
        if (char === "{") braceCount++;
        else if (char === "}") braceCount--;
      }

      result += char;

      // If we've closed all braces, we have a complete object
      if (braceCount === 0 && result.trim().endsWith("}")) {
        return result;
      }
    }

    return result;
  }
}

/**
 * Validate and clean the extracted data for expert profiles
 */
function validateAndCleanExpertData(data: any): ExtractedLinkedInData {
  // Parse location if it's a combined string
  let locationCity = data.location_city;
  let locationCountry = data.location_country;

  if (data.location && !locationCity && !locationCountry) {
    const locationParts = data.location
      .split(",")
      .map((part: string) => part.trim());
    locationCity = locationParts[0] || null;
    locationCountry =
      locationParts[1] || locationParts[locationParts.length - 1] || null;
  }

  // Helper function to safely convert arrays to string arrays
  const toStringArray = (arr: any): string[] => {
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((item) => item != null)
      .map((item) => String(item).trim())
      .filter((item) => item.length > 0);
  };

  const cleaned: ExtractedLinkedInData = {
    // Basic Info
    full_name: String(data.full_name || "").trim(),
    current_job_title: data.current_job_title || null,
    current_company: data.current_company || null,
    primary_industry: data.primary_industry || null,
    years_of_experience: Math.max(
      0,
      Math.min(50, Number(data.years_of_experience) || 0)
    ),
    location_city: locationCity || null,
    location_country: locationCountry || null,

    // Expertise Categories
    primary_category: validateCategory(data.primary_category),
    secondary_categories: toStringArray(data.secondary_categories).filter(
      (cat: string) => validateCategory(cat) !== "Business Strategy"
    ),
    specializations: toStringArray(data.specializations).slice(0, 10),

    // Professional Background
    previous_companies: [...new Set(toStringArray(data.previous_companies))], // Remove duplicates
    education: toStringArray(data.education),
    certifications: toStringArray(data.certifications),
    languages: toStringArray(data.languages),

    // Content
    linkedin_summary: data.linkedin_summary || null,
    key_skills: toStringArray(data.key_skills).slice(0, 15),
    work_experience: data.work_experience || null,

    // AI Matching Metadata (crucial for your platform)
    expertise_keywords: [
      ...new Set(toStringArray(data.expertise_keywords)),
    ].slice(0, 20),
    target_client_types: validateTargetClientTypes(data.target_client_types),

    // Processing Status
    pdf_processed: true,
    processing_status: "completed",
  };

  // Validate required fields
  if (!cleaned.full_name) {
    throw new Error("Full name is required but not found");
  }

  // Ensure we have some expertise indicators
  if (!cleaned.specializations.length && !cleaned.key_skills.length) {
    console.warn(
      "No specializations or skills found - this may impact expert matching"
    );
  }

  return cleaned;
}

/**
 * Validate primary category against allowed values
 */
function validateCategory(category: string): string {
  const validCategories = [
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
  ];

  return validCategories.includes(category) ? category : "Business Strategy";
}

/**
 * Validate and filter target client types
 */
function validateTargetClientTypes(types: any): string[] {
  const validTypes = [
    "Startup",
    "SMB",
    "Enterprise",
    "Non-profit",
    "Freelancer",
    "Individual",
  ];

  if (Array.isArray(types)) {
    const filtered = types
      .filter((type: any) => type != null)
      .map((type: any) => String(type))
      .filter((type: string) => validTypes.includes(type));
    return filtered.length > 0 ? filtered : ["Startup", "SMB"];
  }

  return ["Startup", "SMB"]; // Default fallback
}
