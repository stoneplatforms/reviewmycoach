/**
 * Firebase Admin SDK Compatibility Wrapper
 * 
 * This re-exports Firebase Admin SDK for backward compatibility
 */

import { adminAuth, adminDb } from './firebase-admin-server';

// Re-export Firebase Admin auth
export const auth = {
  verifyIdToken: async (token: string) => {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
    };
  },
};

// Re-export Firebase Admin Firestore
export const db = adminDb;

export const app = null;

/**
 * Helper function to find a coach profile by userId
 * @deprecated Use Data Connect instead
 */
export async function findCoachByUserId(userId: string) {
  // This is a legacy function - should migrate to Data Connect
  console.warn('findCoachByUserId called - should migrate to Data Connect');
  return null;
}
