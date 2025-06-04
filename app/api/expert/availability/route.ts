// app/api/expert/availability/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase-server";

/**
 * POST: Save basic availability confirmation (for onboarding step completion)
 * This step no longer saves pricing/details - just confirms availability is set
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

    // Create or update basic availability record
    // Note: This is mainly for onboarding tracking - detailed config happens in next step
    const availabilityData = {
      user_id,
      session_duration: 30, // Default - will be configured in pricing step
      session_price: 75.0, // Default - will be configured in pricing step
      title: "Expert Consultation", // Default - will be configured in pricing step
      description: "Professional consultation session", // Default - will be configured in pricing step
      is_active: true,
      booking_url: scheduling_url,
      updated_at: new Date().toISOString(),
    };

    console.log("Creating basic availability record for onboarding:", {
      user_id,
      booking_url: scheduling_url,
      is_active: true,
    });

    const { error: insertError } = await supabase
      .from("expert_availability")
      .upsert(availabilityData, {
        onConflict: "user_id",
      });

    if (insertError) {
      console.error("Database insert error:", insertError);
      throw new Error(
        `Failed to save availability record: ${insertError.message}`
      );
    }

    return NextResponse.json({
      success: true,
      message: "Availability confirmation saved successfully",
    });
  } catch (error) {
    console.error("Save availability error:", error);
    return NextResponse.json(
      { error: "Failed to save availability confirmation" },
      { status: 500 }
    );
  }
}

/**
 * GET: Retrieve basic expert availability settings
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

/**
 * PUT: Update detailed availability settings (for pricing step)
 * This will be used in the next onboarding step for pricing/session details
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      user_id,
      session_duration,
      session_price,
      title,
      description,
      calendly_event_type_uri,
      event_type_name,
    } = body;

    if (!user_id) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    // Update detailed availability settings
    const updateData = {
      session_duration,
      session_price,
      title,
      description,
      calendly_event_type_uri,
      event_type_name,
      updated_at: new Date().toISOString(),
    };

    // Remove undefined values
    const cleanUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    );

    console.log("Updating detailed availability settings:", cleanUpdateData);

    const { error: updateError } = await supabase
      .from("expert_availability")
      .update(cleanUpdateData)
      .eq("user_id", user_id);

    if (updateError) {
      console.error("Database update error:", updateError);
      throw new Error(
        `Failed to update availability settings: ${updateError.message}`
      );
    }

    return NextResponse.json({
      success: true,
      message: "Availability settings updated successfully",
    });
  } catch (error) {
    console.error("Update availability error:", error);
    return NextResponse.json(
      { error: "Failed to update availability settings" },
      { status: 500 }
    );
  }
}
