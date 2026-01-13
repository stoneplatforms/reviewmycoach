import { vi } from 'vitest';
import type { XPCalculationInputs } from '../xp-calculator';

/**
 * Mock coach factory - creates coach objects with realistic test data
 */
export const mockCoachFactory = {
  /** Rookie tier coach (0 XP) */
  rookie: (overrides: Record<string, any> = {}) => ({
    id: 'coach-rookie',
    userId: 'user-rookie',
    username: 'rookiecoach',
    displayName: 'Rookie Coach',
    email: 'rookie@example.com',
    subscriptionTier: 1,
    longevityPlatformYears: 0,
    careerYears: 0,
    coursesCreated: 0,
    jobsCompleted: 0,
    averageRating: 0,
    consistencyMultiplier: 1.0,
    totalXp: 0,
    ...overrides,
  }),

  /** Professional tier coach (3,000 - 7,000 XP) */
  professional: (overrides: Record<string, any> = {}) => ({
    id: 'coach-pro',
    userId: 'user-pro',
    username: 'procoach',
    displayName: 'Professional Coach',
    email: 'pro@example.com',
    subscriptionTier: 2,
    longevityPlatformYears: 2,
    careerYears: 5,
    coursesCreated: 2,
    jobsCompleted: 15,
    averageRating: 4.0,
    consistencyMultiplier: 1.2,
    totalXp: 3840, // Calculated: (2000 + 400 + 750 + 600 + 1500 + 400) * 1.2 = 3840
    ...overrides,
  }),

  /** Elite tier coach (7,000 - 12,000 XP) */
  elite: (overrides: Record<string, any> = {}) => ({
    id: 'coach-elite',
    userId: 'user-elite',
    username: 'elitecoach',
    displayName: 'Elite Coach',
    email: 'elite@example.com',
    subscriptionTier: 3,
    longevityPlatformYears: 5,
    careerYears: 10,
    coursesCreated: 5,
    jobsCompleted: 50,
    averageRating: 4.5,
    consistencyMultiplier: 1.5,
    totalXp: 12300, // Calculated: (3000 + 1000 + 1500 + 1500 + 5000 + 450) * 1.5 = 12300
    ...overrides,
  }),

  /** Veteran tier coach (12,000 - 20,000 XP) */
  veteran: (overrides: Record<string, any> = {}) => ({
    id: 'coach-vet',
    userId: 'user-vet',
    username: 'vetcoach',
    displayName: 'Veteran Coach',
    email: 'vet@example.com',
    subscriptionTier: 3,
    longevityPlatformYears: 8,
    careerYears: 15,
    coursesCreated: 10,
    jobsCompleted: 100,
    averageRating: 4.8,
    consistencyMultiplier: 1.8,
    totalXp: 18960, // Calculated: (3000 + 1600 + 2250 + 3000 + 10000 + 480) * 1.8 = 18960
    ...overrides,
  }),

  /** Legendary tier coach (20,000+ XP) */
  legendary: (overrides: Record<string, any> = {}) => ({
    id: 'coach-legend',
    userId: 'user-legend',
    username: 'legendcoach',
    displayName: 'Legendary Coach',
    email: 'legend@example.com',
    subscriptionTier: 3,
    longevityPlatformYears: 15,
    careerYears: 25,
    coursesCreated: 20,
    jobsCompleted: 500,
    averageRating: 5.0,
    consistencyMultiplier: 2.0,
    totalXp: 134000, // Calculated: (3000 + 3000 + 3750 + 6000 + 50000 + 500) * 2.0 = 134000
    ...overrides,
  }),

  /** Custom coach with specified data */
  custom: (data: Record<string, any>) => ({
    id: 'coach-custom',
    userId: 'user-custom',
    username: 'customcoach',
    displayName: 'Custom Coach',
    email: 'custom@example.com',
    subscriptionTier: 1,
    longevityPlatformYears: 0,
    careerYears: 0,
    coursesCreated: 0,
    jobsCompleted: 0,
    averageRating: 0,
    consistencyMultiplier: 1.0,
    totalXp: 0,
    ...data,
  }),
};

/**
 * Mock XP calculation inputs factory
 */
export const mockXPInputsFactory = {
  /** Minimal inputs (all zeros) */
  minimal: (): XPCalculationInputs => ({
    subscription_tier: 1,
    longevity_platform_years: 0,
    career_years: 0,
    courses_created: 0,
    jobs_completed: 0,
    review_score: 0,
    consistency_multiplier: 1.0,
  }),

  /** Standard/average coach inputs */
  standard: (): XPCalculationInputs => ({
    subscription_tier: 2,
    longevity_platform_years: 2,
    career_years: 5,
    courses_created: 3,
    jobs_completed: 20,
    review_score: 4.0,
    consistency_multiplier: 1.2,
  }),

  /** High performer inputs */
  highPerformer: (): XPCalculationInputs => ({
    subscription_tier: 3,
    longevity_platform_years: 10,
    career_years: 20,
    courses_created: 15,
    jobs_completed: 300,
    review_score: 4.8,
    consistency_multiplier: 2.0,
  }),

  /** Custom inputs */
  custom: (overrides: Partial<XPCalculationInputs>): XPCalculationInputs => ({
    subscription_tier: 1,
    longevity_platform_years: 0,
    career_years: 0,
    courses_created: 0,
    jobs_completed: 0,
    review_score: 0,
    consistency_multiplier: 1.0,
    ...overrides,
  }),
};

/**
 * Firebase Data Connect mock helpers
 */
export const mockDataConnect = {
  getCoachByUsername: vi.fn(),
  updateCoachTotalXp: vi.fn(),
  getPublicCoaches: vi.fn(),
  getUserCards: vi.fn(),
  unlockTierCard: vi.fn(),
  getCoach: vi.fn(),
  getEligibleTierCards: vi.fn(),
};

/**
 * Reset all mocks to their initial state
 */
export function resetAllMocks() {
  Object.values(mockDataConnect).forEach(mock => mock.mockReset());
}

/**
 * Helper to create a mock DataConnect instance
 */
export function createMockDataConnect() {
  return {
    connectorConfig: {
      connector: 'default',
      location: 'us-central1',
      service: 'test-service',
    },
  };
}
