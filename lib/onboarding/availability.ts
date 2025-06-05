// lib/onboarding/availability.ts
import { supabaseServer as supabase } from "@/lib/supabase-server";
import type {
  AvailabilityResponse,
  AvailabilityConfirmationResponse,
} from "@/lib/validations/availability";

// Get user's availability data from Calendly
export const getCalendlyAvailability = async (
  userId: string
): Promise<AvailabilityResponse> => {
  try {
    // Get user's Calendly integration with access token
    const { data: integration, error: integrationError } = await supabase
      .from("calendly_integrations")
      .select(
        "access_token, calendly_user_uri, scheduling_url, integration_status"
      )
      .eq("user_id", userId)
      .eq("integration_status", "active")
      .single();

    if (integrationError || !integration) {
      return {
        hasActiveEventTypes: false,
        schedulingUrl: null,
        lastError: "No active Calendly integration found",
      };
    }

    try {
      // Fetch user's event types from Calendly
      const eventTypesResponse = await fetch(
        `https://api.calendly.com/event_types?user=${integration.calendly_user_uri}`,
        {
          headers: {
            Authorization: `Bearer ${integration.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!eventTypesResponse.ok) {
        // If token is expired, try to refresh it
        if (eventTypesResponse.status === 401) {
          console.log("Access token expired, attempting refresh...");

          const refreshResult = await refreshTokenAndRetry(
            userId,
            integration.calendly_user_uri
          );
          if (refreshResult) {
            return refreshResult;
          }
        }

        throw new Error(`Calendly API error: ${eventTypesResponse.status}`);
      }

      const eventTypesData = await eventTypesResponse.json();
      return processEventTypesData(eventTypesData, integration.scheduling_url);
    } catch (calendlyError) {
      console.error("Calendly API error:", calendlyError);

      return {
        hasActiveEventTypes: false,
        schedulingUrl: integration.scheduling_url || null,
        lastError:
          calendlyError instanceof Error
            ? calendlyError.message
            : "Unknown error",
      };
    }
  } catch (error) {
    console.error("Get availability error:", error);
    throw new Error("Failed to get availability data");
  }
};

// Process event types data from Calendly API
const processEventTypesData = (
  eventTypesData: any,
  fallbackSchedulingUrl?: string
): AvailabilityResponse => {
  const eventTypes = eventTypesData.collection || [];
  const activeEventTypes = eventTypes.filter(
    (eventType: any) => eventType.active
  );

  // Get primary scheduling URL (first active event type or user's main URL)
  const primarySchedulingUrl =
    activeEventTypes.length > 0
      ? activeEventTypes[0].scheduling_url
      : fallbackSchedulingUrl;

  return {
    hasActiveEventTypes: activeEventTypes.length > 0,
    schedulingUrl: primarySchedulingUrl,
    totalEventTypes: eventTypes.length,
    activeEventTypes: activeEventTypes.length,
    lastFetched: new Date().toISOString(),
  };
};

// Refresh token and retry API call
const refreshTokenAndRetry = async (
  userId: string,
  calendlyUserUri: string
): Promise<AvailabilityResponse | null> => {
  try {
    // Call token refresh endpoint
    const refreshResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/calendly/integration`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: userId }),
      }
    );

    if (!refreshResponse.ok) {
      return null;
    }

    // Get refreshed token
    const { data: refreshedIntegration } = await supabase
      .from("calendly_integrations")
      .select("access_token, scheduling_url")
      .eq("user_id", userId)
      .single();

    if (!refreshedIntegration) {
      return null;
    }

    // Retry with refreshed token
    const retryResponse = await fetch(
      `https://api.calendly.com/event_types?user=${calendlyUserUri}`,
      {
        headers: {
          Authorization: `Bearer ${refreshedIntegration.access_token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!retryResponse.ok) {
      return null;
    }

    const retryData = await retryResponse.json();
    return processEventTypesData(
      retryData,
      refreshedIntegration.scheduling_url
    );
  } catch (error) {
    console.error("Token refresh and retry failed:", error);
    return null;
  }
};

// Save basic availability confirmation (for onboarding step completion)
export const confirmAvailabilitySetup = async (
  userId: string,
  hasActiveEventTypes: boolean,
  schedulingUrl?: string
): Promise<AvailabilityConfirmationResponse> => {
  try {
    if (!hasActiveEventTypes) {
      throw new Error("User must have active event types configured");
    }

    // Create basic availability record for onboarding tracking
    const availabilityData = {
      user_id: userId,
      session_duration: 30, // Default - will be configured in next step
      session_price: 75.0, // Default - will be configured in next step
      title: "Expert Consultation", // Default - will be configured in next step
      description: "Professional consultation session", // Default - will be configured in next step
      is_active: true,
      booking_url: schedulingUrl || null,
      updated_at: new Date().toISOString(),
    };

    console.log("Creating basic availability record:", {
      user_id: userId,
      booking_url: schedulingUrl,
      is_active: true,
    });

    const { error: insertError } = await supabase
      .from("expert_availability")
      .upsert(availabilityData, {
        onConflict: "user_id",
      });

    if (insertError) {
      throw new Error(
        `Failed to save availability record: ${insertError.message}`
      );
    }

    return {
      success: true,
      message: "Availability confirmation saved successfully",
    };
  } catch (error) {
    console.error("Confirm availability setup error:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to confirm availability setup"
    );
  }
};

// Get existing availability settings
export const getExistingAvailability = async (userId: string) => {
  try {
    const { data: availability, error } = await supabase
      .from("expert_availability")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      throw new Error(`Failed to get availability: ${error.message}`);
    }

    return {
      availability: availability || null,
    };
  } catch (error) {
    console.error("Get existing availability error:", error);
    throw new Error("Failed to get availability settings");
  }
};
