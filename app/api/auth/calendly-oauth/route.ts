// app/api/auth/calendly-oauth/route.ts
import { NextRequest, NextResponse } from "next/server";

/**
 * Initiates Calendly OAuth flow
 * Redirects user to Calendly authorization page
 */
export async function GET(request: NextRequest) {
  try {
    // Get user ID from URL parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");

    if (!userId) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    // Calendly OAuth parameters
    const clientId = process.env.NEXT_PUBLIC_CALENDLY_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_CALENDLY_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      console.error("Missing Calendly config:", {
        clientId: !!clientId,
        redirectUri: !!redirectUri,
      });
      return NextResponse.json(
        { error: "Missing Calendly configuration" },
        { status: 500 }
      );
    }

    // Build Calendly OAuth URL
    const calendlyOAuthUrl = new URL(
      "https://auth.calendly.com/oauth/authorize"
    );
    calendlyOAuthUrl.searchParams.set("client_id", clientId);
    calendlyOAuthUrl.searchParams.set("redirect_uri", redirectUri);
    calendlyOAuthUrl.searchParams.set("response_type", "code");
    calendlyOAuthUrl.searchParams.set("scope", "default");
    calendlyOAuthUrl.searchParams.set("state", userId);

    console.log(
      "Redirecting to Calendly OAuth URL:",
      calendlyOAuthUrl.toString()
    );

    // Redirect to Calendly OAuth page
    return NextResponse.redirect(calendlyOAuthUrl.toString());
  } catch (error) {
    console.error("Calendly OAuth initiation error:", error);
    return NextResponse.json(
      { error: "Failed to initiate OAuth" },
      { status: 500 }
    );
  }
}
