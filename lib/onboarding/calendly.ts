// lib/onboarding/calendly.ts
import { supabaseServer as supabase } from "@/lib/supabase-server";
import type {
  CalendlyIntegrationResponse,
  CalendlyOAuthResponse,
  CalendlyTokenRefreshResponse,
} from "@/lib/validations/calendly";

// Get user's Calendly integration status
export const getCalendlyIntegration = async (
  userId: string
): Promise<CalendlyIntegrationResponse> => {
  try {
    const { data: integration, error } = await supabase
      .from("calendly_integrations")
      .select(
        "calendly_username, calendly_email, calendly_name, scheduling_url, timezone, integration_status, created_at"
      )
      .eq("user_id", userId)
      .eq("integration_status", "active")
      .single();

    if (error && error.code !== "PGRST116") {
      throw new Error(`Database error: ${error.message}`);
    }

    return {
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
    };
  } catch (error) {
    console.error("Get Calendly integration error:", error);
    throw new Error("Failed to get integration status");
  }
};

// Disconnect Calendly integration
export const disconnectCalendlyIntegration = async (
  userId: string
): Promise<CalendlyOAuthResponse> => {
  try {
    // Update integration status to disabled
    const { error: integrationError } = await supabase
      .from("calendly_integrations")
      .update({
        integration_status: "disabled",
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (integrationError) {
      throw new Error(
        `Failed to disconnect integration: ${integrationError.message}`
      );
    }

    // Also disable the expert availability
    const { error: availabilityError } = await supabase
      .from("expert_availability")
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    // Don't throw error if availability doesn't exist yet
    if (availabilityError && availabilityError.code !== "PGRST116") {
      console.warn(
        "Could not update availability during disconnect:",
        availabilityError
      );
    }

    console.log(
      `Successfully disconnected Calendly integration for user: ${userId}`
    );

    return {
      success: true,
      message: "Integration disconnected successfully",
    };
  } catch (error) {
    console.error("Disconnect Calendly integration error:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to disconnect integration"
    );
  }
};

// Refresh Calendly access token
export const refreshCalendlyToken = async (
  userId: string
): Promise<CalendlyTokenRefreshResponse> => {
  try {
    // Get current integration with refresh token
    const { data: integration, error: fetchError } = await supabase
      .from("calendly_integrations")
      .select("refresh_token")
      .eq("user_id", userId)
      .eq("integration_status", "active")
      .single();

    if (fetchError || !integration?.refresh_token) {
      throw new Error("No active integration found");
    }

    // Ensure environment variables are defined
    const clientId = process.env.NEXT_PUBLIC_CALENDLY_CLIENT_ID;
    const clientSecret = process.env.CALENDLY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error(
        "Missing Calendly environment variables for token refresh"
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
        integration_status: "active",
        last_sync_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (updateError) {
      throw new Error(`Failed to update tokens: ${updateError.message}`);
    }

    console.log(`Successfully refreshed tokens for user: ${userId}`);

    return {
      success: true,
      message: "Token refreshed successfully",
    };
  } catch (error) {
    console.error("Token refresh error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to refresh token"
    );
  }
};

// Store Calendly OAuth callback data
export const storeCalendlyOAuthData = async (
  code: string,
  state: string
): Promise<CalendlyOAuthResponse> => {
  try {
    // Validate environment variables
    const clientId = process.env.NEXT_PUBLIC_CALENDLY_CLIENT_ID;
    const clientSecret = process.env.CALENDLY_CLIENT_SECRET;
    const redirectUri = process.env.NEXT_PUBLIC_CALENDLY_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error("Missing Calendly environment variables");
    }

    // Exchange authorization code for access token
    const tokenRequestParams = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code: code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    });

    console.log("Exchanging code for token...");

    const tokenResponse = await fetch("https://auth.calendly.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: tokenRequestParams,
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Token exchange failed:", errorText);
      throw new Error(`Token exchange failed: ${errorText}`);
    }

    const tokenData = await tokenResponse.json();

    // Get user profile from Calendly
    const profileResponse = await fetch("https://api.calendly.com/users/me", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "Content-Type": "application/json",
      },
    });

    if (!profileResponse.ok) {
      const errorText = await profileResponse.text();
      console.error("Profile fetch failed:", errorText);
      throw new Error(`Profile fetch failed: ${errorText}`);
    }

    const profileData = await profileResponse.json();
    const calendlyUser = profileData.resource;

    // Store integration data in calendly_integrations table
    const integrationData = {
      user_id: state, // Use state (user_id)
      calendly_user_uri: calendlyUser.uri,
      calendly_username: calendlyUser.slug,
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

    const { error: insertError } = await supabase
      .from("calendly_integrations")
      .upsert(integrationData, {
        onConflict: "user_id",
      });

    if (insertError) {
      throw new Error(
        `Failed to store integration data: ${insertError.message}`
      );
    }

    console.log(`Successfully stored Calendly integration for user: ${state}`);

    return {
      success: true,
      message: "Calendly integration completed successfully",
      redirectUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/expert/onboarding/calendly?calendly_connected=true`,
    };
  } catch (error) {
    console.error("Store Calendly OAuth data error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to complete OAuth flow"
    );
  }
};

// Generate Calendly OAuth URL
export const generateCalendlyOAuthUrl = (userId: string): string => {
  const clientId = process.env.NEXT_PUBLIC_CALENDLY_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_CALENDLY_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    throw new Error("Missing Calendly configuration");
  }

  const calendlyOAuthUrl = new URL("https://auth.calendly.com/oauth/authorize");
  calendlyOAuthUrl.searchParams.set("client_id", clientId);
  calendlyOAuthUrl.searchParams.set("redirect_uri", redirectUri);
  calendlyOAuthUrl.searchParams.set("response_type", "code");
  calendlyOAuthUrl.searchParams.set("scope", "default");
  calendlyOAuthUrl.searchParams.set("state", userId);

  return calendlyOAuthUrl.toString();
};
