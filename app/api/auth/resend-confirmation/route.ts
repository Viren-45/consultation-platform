// app/api/auth/resend-confirmation/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  resendConfirmationEmail,
  isValidEmail,
} from "@/lib/email-confirmation";

/**
 * POST: Resend email confirmation
 * Allows users to request a new confirmation email
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validate email is provided
    if (!email) {
      return NextResponse.json(
        { error: "Email address is required" },
        { status: 400 }
      );
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    console.log("Resend confirmation request for email:", email);

    // Attempt to resend confirmation email
    const result = await resendConfirmationEmail(email);

    if (!result.success) {
      console.error("Failed to resend confirmation email:", result.error);

      // Return appropriate status code based on error type
      let statusCode = 500;
      if (
        result.error?.includes("too many requests") ||
        result.error?.includes("rate limit")
      ) {
        statusCode = 429; // Too Many Requests
      } else if (
        result.error?.includes("not found") ||
        result.error?.includes("user not found")
      ) {
        statusCode = 404; // Not Found
      } else if (result.error?.includes("already confirmed")) {
        statusCode = 409; // Conflict
      }

      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: statusCode }
      );
    }

    console.log("Confirmation email resent successfully to:", email);

    return NextResponse.json({
      success: true,
      message: result.message || "Confirmation email sent successfully",
    });
  } catch (error) {
    console.error("Resend confirmation API error:", error);

    // Check if it's a JSON parsing error
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred. Please try again.",
      },
      { status: 500 }
    );
  }
}
