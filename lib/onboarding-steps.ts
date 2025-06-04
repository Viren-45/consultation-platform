// lib/onboarding-steps.ts
export const ONBOARDING_STEPS = {
  profile: 1,
  availability: 2,
  pricing: 3,
  review: 4,
} as const;

export const STEP_NAMES = {
  1: "profile",
  2: "availability",
  3: "pricing",
  4: "review",
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
  availability: "Set Your Availability",
  pricing: "Set Your Rates",
  review: "Review & Launch",
} as const;
