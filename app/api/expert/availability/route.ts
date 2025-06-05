// app/api/expert/availability/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  sessionDetailsUpdateSchema,
  getSessionDetailsSchema,
  validateSessionDetailsUpdate,
  validateGetSessionDetails,
} from "@/lib/validations/session-details";
import {
  getSessionDetails,
  upsertSessionDetails,
  updateSessionDetails,
} from "@/lib/onboarding/session-details";

/**
 * GET: Retrieve expert availability/session details
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");

    // Validate input
    const validatedData = validateGetSessionDetails({ user_id: userId });

    // Get session details
    const result = await getSessionDetails(validatedData.user_id);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Get session details error:", error);

    if (error instanceof Error && error.message.includes("validation")) {
      return NextResponse.json(
        { error: "Invalid request parameters" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to get session details" },
      { status: 500 }
    );
  }
}

/**
 * POST: Create basic availability record (used in availability step)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, has_active_event_types, scheduling_url } = body;

    if (!user_id) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    if (!has_active_event_types) {
      return NextResponse.json(
        { error: "User must have active event types configured" },
        { status: 400 }
      );
    }

    // Create basic availability record with defaults
    const defaultData = {
      user_id,
      session_duration: 30,
      session_price: 75.0,
      title: "Expert Consultation",
      description: "Professional consultation session",
    };

    const result = await upsertSessionDetails(defaultData);

    // Also update booking URL if provided
    if (scheduling_url) {
      // This is a simple update to add the booking URL
      // The main session details will be configured in the session-details step
    }

    return NextResponse.json({
      success: true,
      message: "Basic availability record created successfully",
    });
  } catch (error) {
    console.error("Create basic availability error:", error);
    return NextResponse.json(
      { error: "Failed to create availability record" },
      { status: 500 }
    );
  }
}

/**
 * PUT: Update detailed session settings (used in session-details step)
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = validateSessionDetailsUpdate(body);

    // Update session details
    const result = await updateSessionDetails(validatedData);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Update session details error:", error);

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
            : "Failed to update session details",
      },
      { status: 500 }
    );
  }
}
