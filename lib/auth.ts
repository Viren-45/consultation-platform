// lib/auth.ts
import supabase from "@/lib/supabase-client";
import { SignUpFormData, SignInFormData } from "@/lib/validations/auth";

export interface AuthResult {
  success: boolean;
  error?: string;
  user?: any;
  redirectTo?: string;
}

// Sign Up function
export const signUpUser = async (
  data: Omit<SignUpFormData, "agreeToTerms">,
  userType: "client" | "expert"
): Promise<AuthResult> => {
  try {
    console.log("Starting signup process for:", data.email, "as", userType);

    // 1. Create auth user
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          user_type: userType,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    console.log("Auth signup result:", { authData, signUpError });

    if (signUpError) {
      console.error("Signup error:", signUpError);
      return { success: false, error: signUpError.message };
    }

    if (!authData.user) {
      return { success: false, error: "Failed to create user account" };
    }

    // 2. Create profile with onboarding status
    const { error: profileError } = await supabase
      .from("user_profiles")
      .insert({
        id: authData.user.id,
        first_name: data.firstName,
        last_name: data.lastName,
        user_type: userType,
        onboarding_completed: userType === "client" ? true : false, // Clients don't need onboarding
        onboarding_step: userType === "expert" ? 1 : null,
      });

    if (profileError) {
      console.error("Profile creation error:", profileError);
      // Don't fail the signup if profile creation fails
    }

    console.log("Signup successful for user:", authData.user.id);

    // 3. Check if email confirmation is required
    if (!authData.user.email_confirmed_at) {
      console.log(
        "Email confirmation required, redirecting to confirmation page"
      );

      // Redirect to email confirmation page with email and user type
      const confirmationUrl = `/confirm-email?email=${encodeURIComponent(
        data.email
      )}&type=${userType}`;

      return {
        success: true,
        user: authData.user,
        redirectTo: confirmationUrl,
      };
    }

    // 4. If email is already confirmed (unlikely for new signups), redirect normally
    const redirectTo =
      userType === "expert" ? "/expert/onboarding/profile" : "/";

    return {
      success: true,
      user: authData.user,
      redirectTo,
    };
  } catch (error) {
    console.error("Unexpected signup error:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
};

// Sign In function with onboarding check
export const signInUser = async (data: SignInFormData): Promise<AuthResult> => {
  try {
    console.log("Starting sign in process for:", data.email);

    const { data: authData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

    console.log("Auth signin result:", { authData, signInError });

    if (signInError) {
      console.error("Sign in error:", signInError);

      // Provide more user-friendly error messages
      let errorMessage = signInError.message;
      if (signInError.message === "Invalid login credentials") {
        errorMessage =
          "Invalid email or password. Please check your credentials and try again.";
      } else if (signInError.message === "Email not confirmed") {
        errorMessage =
          "Please check your email and click the confirmation link before signing in.";
      }

      return { success: false, error: errorMessage };
    }

    if (!authData.user) {
      return { success: false, error: "Sign in failed. Please try again." };
    }

    // Check if email is confirmed
    if (!authData.user.email_confirmed_at) {
      console.log("Email not confirmed, redirecting to confirmation page");

      // Get user profile to determine user type
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("user_type")
        .eq("id", authData.user.id)
        .single();

      const userType = profile?.user_type || "client";
      const confirmationUrl = `/confirm-email?email=${encodeURIComponent(
        authData.user.email || ""
      )}&type=${userType}`;

      return {
        success: true,
        user: authData.user,
        redirectTo: confirmationUrl,
      };
    }

    // Check user profile and onboarding status
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("user_type, onboarding_completed, onboarding_step")
      .eq("id", authData.user.id)
      .single();

    if (profileError) {
      console.error("Error fetching user profile:", profileError);
      // If we can't get profile, just redirect to home
      return {
        success: true,
        user: authData.user,
        redirectTo: "/",
      };
    }

    // Determine redirect path
    let redirectTo = "/";

    if (profile.user_type === "expert" && !profile.onboarding_completed) {
      // Redirect based on current onboarding step
      switch (profile.onboarding_step) {
        case 1:
          redirectTo = "/expert/onboarding/profile";
          break;
        case 2:
          redirectTo = "/expert/onboarding/calendly";
          break;
        case 3:
          redirectTo = "/expert/onboarding/availability";
          break;
        case 4:
          redirectTo = "/expert/onboarding/session-details";
          break;
        case 5:
          redirectTo = "/expert/onboarding/processing";
          break;
        default:
          redirectTo = "/expert/onboarding/profile"; // Fallback to start
      }
      console.log(
        `Expert on step ${profile.onboarding_step}, redirecting to:`,
        redirectTo
      );
    } else if (profile.user_type === "expert" && profile.onboarding_completed) {
      redirectTo = "/expert/dashboard";
      console.log("Expert onboarding complete, redirecting to dashboard");
    } else if (profile.user_type === "client") {
      redirectTo = "/";
      console.log("Client user, redirecting to home");
    }

    console.log(
      "Sign in successful for user:",
      authData.user.id,
      "redirecting to:",
      redirectTo
    );

    return {
      success: true,
      user: authData.user,
      redirectTo,
    };
  } catch (error) {
    console.error("Unexpected sign in error:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
};

// Get current user session
export const getCurrentUser = async () => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error("Error getting current user:", error);
      return null;
    }

    return user;
  } catch (error) {
    console.error("Unexpected error getting current user:", error);
    return null;
  }
};

// Update onboarding status
export const updateOnboardingStatus = async (
  userId: string,
  step?: number,
  completed?: boolean
) => {
  try {
    const updateData: any = {};

    if (step !== undefined) updateData.onboarding_step = step;
    if (completed !== undefined) updateData.onboarding_completed = completed;

    const { error } = await supabase
      .from("user_profiles")
      .update(updateData)
      .eq("id", userId);

    if (error) {
      console.error("Error updating onboarding status:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Unexpected error updating onboarding:", error);
    return false;
  }
};

// Sign out function
export const signOutUser = async (): Promise<AuthResult> => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Sign out error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected sign out error:", error);
    return {
      success: false,
      error: "An unexpected error occurred during sign out.",
    };
  }
};
