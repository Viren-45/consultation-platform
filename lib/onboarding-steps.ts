// lib/onboarding-steps.ts
export const ONBOARDING_STEPS = {
  profile: 1,
  expertise: 2,
  availability: 3,
  pricing: 4,
  review: 5,
} as const;

export const STEP_NAMES = {
  1: "profile",
  2: "expertise",
  3: "availability",
  4: "pricing",
  5: "review",
} as const;

export type OnboardingStep = keyof typeof ONBOARDING_STEPS;
export type StepNumber = (typeof ONBOARDING_STEPS)[OnboardingStep];

export const getStepNumber = (stepName: OnboardingStep): StepNumber => {
  return ONBOARDING_STEPS[stepName];
};

export const getStepName = (stepNumber: StepNumber): OnboardingStep => {
  return STEP_NAMES[stepNumber];
};

export const STEP_TITLES = {
  profile: "Build Your Profile",
  expertise: "Share Your Expertise",
  availability: "Set Your Availability",
  pricing: "Set Your Rates",
  review: "Review & Launch",
} as const;
