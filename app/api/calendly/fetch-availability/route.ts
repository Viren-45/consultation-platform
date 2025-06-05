// app/api/calendly/availability/route.ts
import { NextRequest, NextResponse } from "next/server";
import { availabilityCheckSchema } from "@/lib/validations/availability";
import { getCalendlyAvailability } from "@/lib/onboarding/availability";

/**
 * GET: Fetch user's availability data from Calendly
 * Returns simplified availability data for onboarding
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");

    // Validate input
    const validatedData = availabilityCheckSchema.parse({ user_id: userId });

    // Get availability data
    const result = await getCalendlyAvailability(validatedData.user_id);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Get availability error:", error);

    if (error instanceof Error && error.message.includes("validation")) {
      return NextResponse.json(
        { error: "Invalid request parameters" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to get availability data",
        hasActiveEventTypes: false,
        schedulingUrl: null,
      },
      { status: 500 }
    );
  }
}
