// lib/onboarding/session-details.ts
import { supabaseServer as supabase } from "@/lib/supabase-server";
import type {
  SessionDetailsResponse,
  SessionDetailsUpdateResponse,
  SessionDetailsUpdateData,
} from "@/lib/validations/session-details";

// Get existing session details/availability settings
export const getSessionDetails = async (
  userId: string
): Promise<SessionDetailsResponse> => {
  try {
    const { data: availability, error } = await supabase
      .from("expert_availability")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      throw new Error(`Database error: ${error.message}`);
    }

    return {
      availability: availability || null,
    };
  } catch (error) {
    console.error("Get session details error:", error);
    throw new Error("Failed to get session details");
  }
};

// Update detailed session settings
export const updateSessionDetails = async (
  data: SessionDetailsUpdateData
): Promise<SessionDetailsUpdateResponse> => {
  try {
    // Prepare update data
    const updateData = {
      session_duration: data.session_duration,
      session_price: data.session_price,
      title: data.title,
      description: data.description,
      updated_at: new Date().toISOString(),
    };

    // Add optional fields if provided
    const cleanUpdateData: any = { ...updateData };
    if (data.calendly_event_type_uri) {
      cleanUpdateData.calendly_event_type_uri = data.calendly_event_type_uri;
    }
    if (data.event_type_name) {
      cleanUpdateData.event_type_name = data.event_type_name;
    }

    console.log("Updating session details:", {
      user_id: data.user_id,
      session_duration: data.session_duration,
      session_price: data.session_price,
      title: data.title.substring(0, 50) + "...",
    });

    // Update the expert_availability record
    const { error: updateError } = await supabase
      .from("expert_availability")
      .update(cleanUpdateData)
      .eq("user_id", data.user_id);

    if (updateError) {
      throw new Error(`Database update failed: ${updateError.message}`);
    }

    console.log(
      `Session details updated successfully for user: ${data.user_id}`
    );

    return {
      success: true,
      message: "Session details updated successfully",
    };
  } catch (error) {
    console.error("Update session details error:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to update session details"
    );
  }
};

// Create initial session details record (for new users)
export const createSessionDetails = async (
  data: SessionDetailsUpdateData
): Promise<SessionDetailsUpdateResponse> => {
  try {
    // Prepare create data
    const createData = {
      user_id: data.user_id,
      session_duration: data.session_duration,
      session_price: data.session_price,
      title: data.title,
      description: data.description,
      is_active: true,
      booking_url: null, // Will be set when Calendly is connected
      updated_at: new Date().toISOString(),
    };

    // Add optional fields if provided
    const cleanCreateData: any = { ...createData };
    if (data.calendly_event_type_uri) {
      cleanCreateData.calendly_event_type_uri = data.calendly_event_type_uri;
    }
    if (data.event_type_name) {
      cleanCreateData.event_type_name = data.event_type_name;
    }

    console.log("Creating session details:", {
      user_id: data.user_id,
      session_duration: data.session_duration,
      session_price: data.session_price,
      title: data.title.substring(0, 50) + "...",
    });

    // Insert new record
    const { error: insertError } = await supabase
      .from("expert_availability")
      .insert(cleanCreateData);

    if (insertError) {
      throw new Error(`Database insert failed: ${insertError.message}`);
    }

    console.log(
      `Session details created successfully for user: ${data.user_id}`
    );

    return {
      success: true,
      message: "Session details created successfully",
    };
  } catch (error) {
    console.error("Create session details error:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to create session details"
    );
  }
};

// Upsert session details (update if exists, create if not)
export const upsertSessionDetails = async (
  data: SessionDetailsUpdateData
): Promise<SessionDetailsUpdateResponse> => {
  try {
    // Check if record exists
    const { data: existingRecord, error: checkError } = await supabase
      .from("expert_availability")
      .select("id")
      .eq("user_id", data.user_id)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      throw new Error(`Database check failed: ${checkError.message}`);
    }

    // Use update if exists, create if not
    if (existingRecord) {
      return await updateSessionDetails(data);
    } else {
      return await createSessionDetails(data);
    }
  } catch (error) {
    console.error("Upsert session details error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to save session details"
    );
  }
};

// Validate session pricing
export const validateSessionPricing = (
  sessionPrice: number,
  isFreeSession: boolean
): { isValid: boolean; error?: string } => {
  if (isFreeSession && sessionPrice !== 0) {
    return {
      isValid: false,
      error: "Free sessions must have $0 price",
    };
  }

  if (!isFreeSession && sessionPrice <= 0) {
    return {
      isValid: false,
      error: "Paid sessions must have a price greater than $0",
    };
  }

  if (sessionPrice > 200) {
    return {
      isValid: false,
      error: "Session price cannot exceed $200",
    };
  }

  return { isValid: true };
};

// Validate session duration
export const validateSessionDuration = (
  duration: number
): { isValid: boolean; error?: string } => {
  const validDurations = [15, 30, 45, 60];

  if (!validDurations.includes(duration)) {
    return {
      isValid: false,
      error: "Session duration must be 15, 30, 45, or 60 minutes",
    };
  }

  return { isValid: true };
};

// Get session details with enhanced validation
export const getSessionDetailsWithValidation = async (
  userId: string
): Promise<SessionDetailsResponse & { isValid: boolean; errors: string[] }> => {
  try {
    const result = await getSessionDetails(userId);
    const errors: string[] = [];

    if (result.availability) {
      // Validate pricing
      const pricingValidation = validateSessionPricing(
        result.availability.session_price,
        result.availability.session_price === 0
      );
      if (!pricingValidation.isValid && pricingValidation.error) {
        errors.push(pricingValidation.error);
      }

      // Validate duration
      const durationValidation = validateSessionDuration(
        result.availability.session_duration
      );
      if (!durationValidation.isValid && durationValidation.error) {
        errors.push(durationValidation.error);
      }

      // Validate required fields
      if (!result.availability.title?.trim()) {
        errors.push("Session title is required");
      }
      if (!result.availability.description?.trim()) {
        errors.push("Session description is required");
      }
    }

    return {
      ...result,
      isValid: errors.length === 0,
      errors,
    };
  } catch (error) {
    console.error("Get session details with validation error:", error);
    throw error;
  }
};
