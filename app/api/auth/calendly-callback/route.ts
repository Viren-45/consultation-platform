// app/api/auth/calendly-callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase-server";

/**
 * Handles Calendly OAuth callback
 * Exchanges authorization code for access token and stores integration data
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state"); // This is the user ID we passed
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

    if (!code || !state) {
      console.error("Missing code or state:", { code: !!code, state: !!state });
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/expert/onboarding/calendly?error=missing_params`
      );
    }

    // Ensure environment variables are defined
    const clientId = process.env.NEXT_PUBLIC_CALENDLY_CLIENT_ID;
    const clientSecret = process.env.CALENDLY_CLIENT_SECRET;
    const redirectUri = process.env.NEXT_PUBLIC_CALENDLY_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      console.error("Missing Calendly environment variables");
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/expert/onboarding/calendly?error=config_error`
      );
    }

    // Exchange authorization code for access token
    const tokenRequestParams = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code: code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    });

    console.log("Token request payload:", {
      client_id: clientId,
      code: code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
      client_secret: "[REDACTED]",
    });

    const tokenResponse = await fetch("https://auth.calendly.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: tokenRequestParams,
    });

    const tokenResponseText = await tokenResponse.text();
    console.log("Token response status:", tokenResponse.status);
    console.log("Token response body:", tokenResponseText);

    if (!tokenResponse.ok) {
      console.error("Token exchange failed:", tokenResponseText);
      throw new Error(`Token exchange failed: ${tokenResponseText}`);
    }

    let tokenData;
    try {
      tokenData = JSON.parse(tokenResponseText);
    } catch (e) {
      console.error("Failed to parse token response:", tokenResponseText);
      throw new Error("Invalid JSON response from token endpoint");
    }

    // Get user profile from Calendly
    const profileResponse = await fetch("https://api.calendly.com/users/me", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "Content-Type": "application/json",
      },
    });

    const profileResponseText = await profileResponse.text();
    console.log("Profile response status:", profileResponse.status);
    console.log("Profile response body:", profileResponseText);

    if (!profileResponse.ok) {
      console.error("Profile fetch failed:", profileResponseText);
      throw new Error(`Profile fetch failed: ${profileResponseText}`);
    }

    let profileData;
    try {
      profileData = JSON.parse(profileResponseText);
    } catch (e) {
      console.error("Failed to parse profile response:", profileResponseText);
      throw new Error("Invalid JSON response from profile endpoint");
    }

    // Extract user data from Calendly response
    const calendlyUser = profileData.resource;

    // Store integration data in calendly_integrations table
    const integrationData = {
      user_id: state, // Use state (user_id) directly
      calendly_user_uri: calendlyUser.uri,
      calendly_username: calendlyUser.slug, // Username/slug for booking URL
      calendly_email: calendlyUser.email,
      calendly_name: calendlyUser.name,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      token_expires_at: tokenData.expires_in
        ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
        : null,
      scheduling_url: calendlyUser.scheduling_url,
      timezone: calendlyUser.timezone,
      integration_status: "active",
      updated_at: new Date().toISOString(),
    };

    console.log("Storing integration data:", {
      ...integrationData,
      access_token: "[REDACTED]",
      refresh_token: "[REDACTED]",
    });

    const { error: insertError } = await supabase
      .from("calendly_integrations")
      .upsert(integrationData, {
        onConflict: "user_id",
      });

    if (insertError) {
      console.error("Database insert error:", insertError);
      throw new Error(
        `Failed to store integration data: ${insertError.message}`
      );
    }

    // Redirect back to onboarding with success - UPDATED PARAMETER NAME
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/expert/onboarding/calendly?calendly_connected=true`
    );
  } catch (error) {
    console.error("Calendly callback error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/expert/onboarding/calendly?error=callback_failed`
    );
  }
}
