/**
 * Firebase Admin SDK for Server-Side Operations
 * 
 * This module initializes Firebase Admin for server-side use (API routes, middleware)
 */

import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let adminApp: App;
let adminAuth: Auth;
let adminDb: Firestore;

function formatPrivateKey(key: string): string {
  // Remove surrounding quotes
  key = key.replace(/^["']+|["']+$/g, '');

  // Replace literal \n with actual newlines
  key = key.replace(/\\n/g, '\n');

  // Trim whitespace
  key = key.trim();

  // Ensure proper PEM format
  if (!key.startsWith('-----BEGIN')) {
    key = '-----BEGIN PRIVATE KEY-----\n' + key;
  }
  if (!key.endsWith('-----')) {
    key = key + '\n-----END PRIVATE KEY-----';
  }

  return key;
}

function initializeFirebaseAdmin() {
  if (getApps().length > 0) {
    adminApp = getApps()[0];
    adminAuth = getAuth(adminApp);
    adminDb = getFirestore(adminApp);
    return { app: adminApp, auth: adminAuth, db: adminDb };
  }

  try {
    // Try to use service account file first
    const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

    if (serviceAccountPath) {
      adminApp = initializeApp({
        credential: cert(serviceAccountPath),
      });
    } else if (process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
      // Use environment variables
      const privateKey = formatPrivateKey(process.env.FIREBASE_ADMIN_PRIVATE_KEY);

      const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;

      if (!projectId || !clientEmail) {
        throw new Error('Missing FIREBASE_ADMIN_PROJECT_ID or FIREBASE_ADMIN_CLIENT_EMAIL');
      }

      adminApp = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    } else {
      console.error('Firebase Admin credentials not configured');
      throw new Error('Firebase Admin not configured');
    }

    adminAuth = getAuth(adminApp);
    adminDb = getFirestore(adminApp);

    return { app: adminApp, auth: adminAuth, db: adminDb };
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    throw error;
  }
}

// Initialize on module load
const { app, auth, db } = initializeFirebaseAdmin();

export { app as adminApp, auth as adminAuth, db as adminDb };

/**
 * Verify Firebase ID token
 */
export async function verifyFirebaseToken(token: string): Promise<{ uid: string; email?: string; email_verified?: boolean } | null> {
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      email_verified: decodedToken.email_verified,
    };
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    return null;
  }
}

