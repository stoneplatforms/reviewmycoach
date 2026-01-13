import { expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

// Mock Firebase environment variables
process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test-api-key';
process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'test.firebaseapp.com';
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-project';
process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = 'test.appspot.com';
process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = '123456789';
process.env.NEXT_PUBLIC_FIREBASE_APP_ID = 'test-app-id';

// Mock Firebase modules
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
  getApps: vi.fn(() => []),
}));

vi.mock('firebase/data-connect', () => ({
  getDataConnect: vi.fn(() => ({})),
}));

// Global test utilities
declare global {
  var testHelpers: {
    createMockCoach: (overrides?: any) => any;
  };
}

global.testHelpers = {
  createMockCoach: (overrides = {}) => ({
    id: 'test-id',
    userId: 'test-user-id',
    username: 'testcoach',
    displayName: 'Test Coach',
    email: 'test@example.com',
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
};
