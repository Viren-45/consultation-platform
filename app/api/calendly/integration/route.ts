// app/api/calendly/integration/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  calendlyIntegrationStatusSchema,
  calendlyTokenRefreshSchema,
} from "@/lib/validations/calendly";
import {
  getCalendlyIntegration,
  disconnectCalendlyIntegration,
  refreshCalendlyToken,
} from "@/lib/onboarding/calendly";

/**
 * GET: Check if user has Calendly integration
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");

    // Validate input
    const validatedData = calendlyIntegrationStatusSchema.parse({
      user_id: userId,
    });

    // Get integration status
    const result = await getCalendlyIntegration(validatedData.user_id);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Get Calendly integration error:", error);

    if (error instanceof Error && error.message.includes("validation")) {
      return NextResponse.json(
        { error: "Invalid request parameters" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to get integration status" },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Disconnect Calendly integration
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");

    // Validate input
    const validatedData = calendlyIntegrationStatusSchema.parse({
      user_id: userId,
    });

    // Disconnect integration
    const result = await disconnectCalendlyIntegration(validatedData.user_id);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Delete Calendly integration error:", error);

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
            : "Failed to disconnect integration",
      },
      { status: 500 }
    );
  }
}

/**
 * POST: Refresh Calendly access token
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = calendlyTokenRefreshSchema.parse(body);

    // Refresh token
    const result = await refreshCalendlyToken(validatedData.user_id);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Token refresh error:", error);

    if (error instanceof Error && error.message.includes("validation")) {
      return NextResponse.json(
        { error: "Invalid request parameters" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to refresh token",
      },
      { status: 500 }
    );
  }
}
