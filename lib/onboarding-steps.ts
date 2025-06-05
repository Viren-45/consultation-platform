export const ONBOARDING_STEPS = {
  profile: 1,
  calendly: 2,
  availability: 3,
  sessionDetails: 4,
  processing: 5,
  complete: 6,
} as const;

export const STEP_NAMES = {
  1: "profile",
  2: "calendly",
  3: "availability",
  4: "sessionDetails",
  5: "processing",
  6: "complete",
} as const;

export const STEP_TITLES = {
  profile: "Build Your Profile",
  calendly: "Connect Calendly",
  availability: "Set Your Availability",
  "session-details": "Configure Sessions",
  processing: "Processing Profile",
  complete: "Complete",
} as const;

export const STEP_ROUTES = {
  1: "/expert/onboarding/profile",
  2: "/expert/onboarding/calendly",
  3: "/expert/onboarding/availability",
  4: "/expert/onboarding/session-details",
  5: "/expert/onboarding/processing",
  6: "/", // Completed
} as const;
