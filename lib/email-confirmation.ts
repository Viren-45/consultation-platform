// lib/email-confirmation.ts
import supabase from "@/lib/supabase-client";

export interface EmailConfirmationResult {
  success: boolean;
  error?: string;
  message?: string;
}

// Resend confirmation email
export const resendConfirmationEmail = async (
  email: string
): Promise<EmailConfirmationResult> => {
  try {
    console.log("Attempting to resend confirmation email to:", email);

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    });

    if (error) {
      console.error("Resend confirmation error:", error);

      // Provide user-friendly error messages
      let errorMessage = error.message;
      if (
        error.message.includes("too_many_requests") ||
        error.message.includes("rate limit")
      ) {
        errorMessage =
          "Too many requests. Please wait a few minutes before requesting another email.";
      } else if (
        error.message.includes("not_found") ||
        error.message.includes("user not found")
      ) {
        errorMessage = "Email address not found. Please sign up first.";
      } else if (error.message.includes("already_confirmed")) {
        errorMessage =
          "This email has already been confirmed. You can sign in now.";
      }

      return {
        success: false,
        error: errorMessage,
      };
    }

    console.log("Confirmation email resent successfully");

    return {
      success: true,
      message: "Confirmation email sent successfully. Please check your inbox.",
    };
  } catch (error) {
    console.error("Unexpected error resending confirmation:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
};

// Check if current user's email is confirmed
export const checkEmailConfirmationStatus = async (): Promise<{
  isConfirmed: boolean;
  user?: any;
  error?: string;
}> => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error("Error getting user for confirmation check:", error);
      return {
        isConfirmed: false,
        error: "Failed to check confirmation status",
      };
    }

    if (!user) {
      return {
        isConfirmed: false,
        error: "No user found",
      };
    }

    const isConfirmed = !!user.email_confirmed_at;

    console.log("Email confirmation status:", {
      email: user.email,
      confirmed: isConfirmed,
      confirmedAt: user.email_confirmed_at,
    });

    return {
      isConfirmed,
      user,
    };
  } catch (error) {
    console.error("Unexpected error checking confirmation status:", error);
    return {
      isConfirmed: false,
      error: "An unexpected error occurred",
    };
  }
};

// Get user profile information for redirection
export const getUserProfileForRedirection = async (
  userId: string
): Promise<{
  userType?: "client" | "expert";
  onboardingCompleted?: boolean;
  onboardingStep?: number;
  error?: string;
}> => {
  try {
    const { data: profile, error } = await supabase
      .from("user_profiles")
      .select("user_type, onboarding_completed, onboarding_step")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
      return {
        error: "Failed to fetch user profile",
      };
    }

    return {
      userType: profile.user_type,
      onboardingCompleted: profile.onboarding_completed,
      onboardingStep: profile.onboarding_step,
    };
  } catch (error) {
    console.error("Unexpected error fetching user profile:", error);
    return {
      error: "An unexpected error occurred",
    };
  }
};

// Determine redirect URL after email confirmation
export const getRedirectUrlAfterConfirmation = async (
  userId: string
): Promise<string> => {
  try {
    const profile = await getUserProfileForRedirection(userId);

    if (profile.error || !profile.userType) {
      console.warn("Could not determine user type, defaulting to home");
      return "/";
    }

    // Client users go to home
    if (profile.userType === "client") {
      return "/";
    }

    // Expert users - check onboarding status
    if (profile.userType === "expert") {
      if (profile.onboardingCompleted) {
        return "/expert/dashboard";
      }

      // Redirect to appropriate onboarding step
      switch (profile.onboardingStep) {
        case 1:
          return "/expert/onboarding/profile";
        case 2:
          return "/expert/onboarding/calendly";
        case 3:
          return "/expert/onboarding/availability";
        case 4:
          return "/expert/onboarding/session-details";
        case 5:
          return "/expert/onboarding/processing";
        default:
          return "/expert/onboarding/profile";
      }
    }

    return "/";
  } catch (error) {
    console.error("Error determining redirect URL:", error);
    return "/";
  }
};

// Validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Check if user needs email confirmation
export const userNeedsEmailConfirmation = async (): Promise<{
  needsConfirmation: boolean;
  email?: string;
  userType?: "client" | "expert";
}> => {
  try {
    const confirmationStatus = await checkEmailConfirmationStatus();

    if (confirmationStatus.error || !confirmationStatus.user) {
      return { needsConfirmation: false };
    }

    if (confirmationStatus.isConfirmed) {
      return { needsConfirmation: false };
    }

    // User exists but not confirmed
    const profile = await getUserProfileForRedirection(
      confirmationStatus.user.id
    );

    return {
      needsConfirmation: true,
      email: confirmationStatus.user.email,
      userType: profile.userType,
    };
  } catch (error) {
    console.error("Error checking if user needs confirmation:", error);
    return { needsConfirmation: false };
  }
};

// Handle email confirmation callback (for when user clicks email link)
export const handleEmailConfirmationCallback = async (): Promise<{
  success: boolean;
  redirectTo?: string;
  error?: string;
}> => {
  try {
    const confirmationStatus = await checkEmailConfirmationStatus();

    if (confirmationStatus.error) {
      return {
        success: false,
        error: confirmationStatus.error,
      };
    }

    if (!confirmationStatus.isConfirmed || !confirmationStatus.user) {
      return {
        success: false,
        error: "Email confirmation failed or user not found",
      };
    }

    // Email is confirmed, determine where to redirect
    const redirectTo = await getRedirectUrlAfterConfirmation(
      confirmationStatus.user.id
    );

    return {
      success: true,
      redirectTo,
    };
  } catch (error) {
    console.error("Error handling email confirmation callback:", error);
    return {
      success: false,
      error: "An unexpected error occurred during confirmation",
    };
  }
};
