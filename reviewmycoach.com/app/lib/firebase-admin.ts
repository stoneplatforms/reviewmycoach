import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Check if required environment variables are set
const requiredVars = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY,
};

// Fix malformed private key if needed
if (requiredVars.privateKey && !requiredVars.privateKey.startsWith('-----BEGIN')) {
  const beginIndex = requiredVars.privateKey.indexOf('-----BEGIN');
  if (beginIndex > 0) {
    requiredVars.privateKey = requiredVars.privateKey.substring(beginIndex);
  }
}

const missingVars = Object.entries(requiredVars)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error('Missing Firebase Admin environment variables:', missingVars);
  throw new Error(`Missing Firebase Admin environment variables: ${missingVars.join(', ')}`);
}

// Initialize Firebase Admin
const firebaseAdminConfig = {
  credential: cert({
    projectId: requiredVars.projectId,
    clientEmail: requiredVars.clientEmail,
    privateKey: requiredVars.privateKey?.replace(/\\n/g, '\n'),
  }),
};

const app = !getApps().length ? initializeApp(firebaseAdminConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

/**
 * Helper function to find a coach profile by userId
 * Since coaches are stored by username (not userId), we need to query by the userId field
 */
export async function findCoachByUserId(userId: string) {
  const coachesRef = db.collection('coaches');
  const coachQuery = await coachesRef.where('userId', '==', userId).get();
  
  if (coachQuery.empty) {
    return null;
  }

  const coachDoc = coachQuery.docs[0];
  return {
    doc: coachDoc,
    data: coachDoc.data(),
    ref: coachDoc.ref
  };
}

export { app, auth, db };