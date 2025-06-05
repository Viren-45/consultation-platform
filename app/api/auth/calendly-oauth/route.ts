// app/api/auth/calendly-oauth/route.ts
import { NextRequest, NextResponse } from "next/server";
import { calendlyOAuthInitiationSchema } from "@/lib/validations/calendly";
import { generateCalendlyOAuthUrl } from "@/lib/onboarding/calendly";

/**
 * GET: Initiate Calendly OAuth flow
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");

    // Validate input
    const validatedData = calendlyOAuthInitiationSchema.parse({
      user_id: userId,
    });

    // Generate OAuth URL
    const oauthUrl = generateCalendlyOAuthUrl(validatedData.user_id);

    console.log("Redirecting to Calendly OAuth URL:", oauthUrl);

    // Redirect to Calendly OAuth page
    return NextResponse.redirect(oauthUrl);
  } catch (error) {
    console.error("Calendly OAuth initiation error:", error);

    if (error instanceof Error && error.message.includes("validation")) {
      return NextResponse.json(
        { error: "Invalid request parameters" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to initiate OAuth" },
      { status: 500 }
    );
  }
}
