// app/api/calendly/integration/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase-server";

/**
 * GET: Check if user has Calendly integration
 * Returns integration status and basic info
 */
export async function GET(request: NextRequest) {
  try {
    // Get user ID from URL parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");

    if (!userId) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    // Get user's Calendly integration
    const { data: integration, error } = await supabase
      .from("calendly_integrations")
      .select(
        "calendly_username, calendly_email, calendly_name, scheduling_url, timezone, integration_status, created_at"
      )
      .eq("user_id", userId)
      .eq("integration_status", "active")
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows returned
      throw error;
    }

    // Return integration status
    return NextResponse.json({
      connected: !!integration,
      integration: integration
        ? {
            username: integration.calendly_username,
            email: integration.calendly_email,
            name: integration.calendly_name,
            status: integration.integration_status,
            connectedAt: integration.created_at,
            schedulingUrl: integration.scheduling_url,
            timezone: integration.timezone,
          }
        : null,
    });
  } catch (error) {
    console.error("Get Calendly integration error:", error);
    return NextResponse.json(
      { error: "Failed to get integration status" },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Disconnect Calendly integration
 * Sets integration status to disabled AND disables availability
 */
export async function DELETE(request: NextRequest) {
  try {
    // Get user ID from URL parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");

    if (!userId) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    // Update integration status to disabled
    const { error: integrationError } = await supabase
      .from("calendly_integrations")
      .update({
        integration_status: "disabled",
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (integrationError) {
      throw integrationError;
    }

    // Also disable the expert availability
    const { error: availabilityError } = await supabase
      .from("expert_availability")
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    // Don't throw error if availability doesn't exist yet (user might disconnect before saving)
    if (availabilityError && availabilityError.code !== "PGRST116") {
      console.warn(
        "Could not update availability during disconnect:",
        availabilityError
      );
    }

    console.log(
      `Successfully disconnected Calendly integration for user: ${userId}`
    );

    return NextResponse.json({
      success: true,
      message: "Integration disconnected successfully",
    });
  } catch (error) {
    console.error("Delete Calendly integration error:", error);
    return NextResponse.json(
      { error: "Failed to disconnect integration" },
      { status: 500 }
    );
  }
}

/**
 * POST: Refresh Calendly access token
 * Uses refresh token to get new access token
 */
export async function POST(request: NextRequest) {
  try {
    // Get user ID from request body
    const body = await request.json();
    const userId = body.user_id;

    if (!userId) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    // Get current integration with refresh token
    const { data: integration, error: fetchError } = await supabase
      .from("calendly_integrations")
      .select("refresh_token")
      .eq("user_id", userId)
      .eq("integration_status", "active")
      .single();

    if (fetchError || !integration?.refresh_token) {
      return NextResponse.json(
        { error: "No active integration found" },
        { status: 404 }
      );
    }

    // Ensure environment variables are defined
    const clientId = process.env.NEXT_PUBLIC_CALENDLY_CLIENT_ID;
    const clientSecret = process.env.CALENDLY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error("Missing Calendly environment variables for token refresh");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Refresh the token with Calendly
    const refreshParams = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: integration.refresh_token,
      grant_type: "refresh_token",
    });

    const refreshResponse = await fetch(
      "https://auth.calendly.com/oauth/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: refreshParams,
      }
    );

    if (!refreshResponse.ok) {
      const errorText = await refreshResponse.text();
      console.error("Token refresh failed:", errorText);

      // If refresh fails, it might mean the refresh token is invalid
      // Mark integration as error status
      await supabase
        .from("calendly_integrations")
        .update({
          integration_status: "error",
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      throw new Error("Failed to refresh token - user may need to reconnect");
    }

    const tokenData = await refreshResponse.json();

    // Update stored tokens
    const { error: updateError } = await supabase
      .from("calendly_integrations")
      .update({
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token || integration.refresh_token,
        token_expires_at: tokenData.expires_in
          ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
          : null,
        integration_status: "active", // Ensure status is active after successful refresh
        last_sync_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (updateError) {
      throw updateError;
    }

    console.log(`Successfully refreshed tokens for user: ${userId}`);

    return NextResponse.json({
      success: true,
      message: "Token refreshed successfully",
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    return NextResponse.json(
      { error: "Failed to refresh token" },
      { status: 500 }
    );
  }
}
