// app/api/expert/availability/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase-server";

/**
 * POST: Save expert availability settings
 * Stores the availability data when expert clicks "Save and Continue"
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      user_id,
      calendly_connected,
      calendly_url,
      calendly_username,
      session_duration = 30,
      session_price = 75.0,
      title = "Expert Consultation",
      description = "Professional consultation session",
      is_active = true,
    } = body;

    if (!user_id) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    if (!calendly_connected) {
      return NextResponse.json(
        { error: "Calendly must be connected" },
        { status: 400 }
      );
    }

    // Store availability data in expert_availability table
    const availabilityData = {
      user_id,
      session_duration,
      session_price,
      title,
      description,
      is_active,
      booking_url: calendly_url,
      updated_at: new Date().toISOString(),
    };

    console.log("Storing availability data:", availabilityData);

    const { error: insertError } = await supabase
      .from("expert_availability")
      .upsert(availabilityData, {
        onConflict: "user_id",
      });

    if (insertError) {
      console.error("Database insert error:", insertError);
      throw new Error(
        `Failed to store availability data: ${insertError.message}`
      );
    }

    return NextResponse.json({
      success: true,
      message: "Availability settings saved successfully",
    });
  } catch (error) {
    console.error("Save availability error:", error);
    return NextResponse.json(
      { error: "Failed to save availability settings" },
      { status: 500 }
    );
  }
}

/**
 * GET: Retrieve expert availability settings
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");

    if (!userId) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    // Get availability data
    const { data: availability, error } = await supabase
      .from("expert_availability")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    return NextResponse.json({
      availability: availability || null,
    });
  } catch (error) {
    console.error("Get availability error:", error);
    return NextResponse.json(
      { error: "Failed to get availability settings" },
      { status: 500 }
    );
  }
}
