export const FEATURES = {
  hero: true,
  skills: false,
  experience: false,
  projects: false,
  contact: false,
} as const

export type FeatureName = keyof typeof FEATURES
export type Features = Record<FeatureName, boolean>
