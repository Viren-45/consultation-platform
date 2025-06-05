// app/api/auth/calendly-callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { calendlyOAuthCallbackSchema } from "@/lib/validations/calendly";
import { storeCalendlyOAuthData } from "@/lib/onboarding/calendly";

/**
 * GET: Handle Calendly OAuth callback
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    console.log("Calendly OAuth callback received:", {
      code: !!code,
      state,
      error,
    });

    // Handle OAuth errors
    if (error) {
      console.error("Calendly OAuth error:", error);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/expert/onboarding/calendly?error=oauth_failed`
      );
    }

    // Validate input
    const validatedData = calendlyOAuthCallbackSchema.parse({
      code,
      state,
      error,
    });

    // Process OAuth callback
    const result = await storeCalendlyOAuthData(
      validatedData.code,
      validatedData.state
    );

    // Redirect to success URL
    return NextResponse.redirect(
      result.redirectUrl ||
        `${process.env.NEXT_PUBLIC_SITE_URL}/expert/onboarding/calendly?calendly_connected=true`
    );
  } catch (error) {
    console.error("Calendly callback error:", error);

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/expert/onboarding/calendly?error=callback_failed`
    );
  }
}
