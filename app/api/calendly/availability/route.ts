// app/api/calendly/availability/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase-server";

/**
 * GET: Fetch simplified availability data for onboarding
 * Returns only essential info: hasActiveEventTypes and schedulingUrl
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");

    if (!userId) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

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
      return NextResponse.json(
        {
          error: "No active Calendly integration found",
          hasActiveEventTypes: false,
          schedulingUrl: null,
        },
        { status: 404 }
      );
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

          if (refreshResponse.ok) {
            // Retry with refreshed token
            const { data: refreshedIntegration } = await supabase
              .from("calendly_integrations")
              .select("access_token, scheduling_url")
              .eq("user_id", userId)
              .single();

            if (refreshedIntegration) {
              const retryResponse = await fetch(
                `https://api.calendly.com/event_types?user=${integration.calendly_user_uri}`,
                {
                  headers: {
                    Authorization: `Bearer ${refreshedIntegration.access_token}`,
                    "Content-Type": "application/json",
                  },
                }
              );

              if (!retryResponse.ok) {
                throw new Error(
                  "Failed to fetch event types after token refresh"
                );
              }

              const retryData = await retryResponse.json();
              return processSimplifiedEventTypesData(
                retryData,
                refreshedIntegration.scheduling_url
              );
            }
          }
        }

        throw new Error(`Calendly API error: ${eventTypesResponse.status}`);
      }

      const eventTypesData = await eventTypesResponse.json();
      return processSimplifiedEventTypesData(
        eventTypesData,
        integration.scheduling_url
      );
    } catch (calendlyError) {
      console.error("Calendly API error:", calendlyError);

      // Return error but include fallback scheduling URL if available
      return NextResponse.json(
        {
          error: "Failed to fetch availability from Calendly",
          hasActiveEventTypes: false,
          schedulingUrl: integration.scheduling_url || null,
          lastError:
            calendlyError instanceof Error
              ? calendlyError.message
              : "Unknown error",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Get availability error:", error);
    return NextResponse.json(
      {
        error: "Failed to get availability data",
        hasActiveEventTypes: false,
        schedulingUrl: null,
      },
      { status: 500 }
    );
  }
}

/**
 * Process event types data from Calendly API - simplified for onboarding
 */
function processSimplifiedEventTypesData(
  eventTypesData: any,
  fallbackSchedulingUrl?: string
) {
  const eventTypes = eventTypesData.collection || [];
  const activeEventTypes = eventTypes.filter(
    (eventType: any) => eventType.active
  );

  // Get primary scheduling URL (first active event type or user's main URL)
  const primarySchedulingUrl =
    activeEventTypes.length > 0
      ? activeEventTypes[0].scheduling_url
      : fallbackSchedulingUrl;

  return NextResponse.json({
    hasActiveEventTypes: activeEventTypes.length > 0,
    schedulingUrl: primarySchedulingUrl,
    totalEventTypes: eventTypes.length,
    activeEventTypes: activeEventTypes.length,
    lastFetched: new Date().toISOString(),
  });
}
