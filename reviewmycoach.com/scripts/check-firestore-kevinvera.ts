/**
 * Check if kevinvera test accounts exist in Firestore
 * Usage: npx tsx scripts/check-firestore-kevinvera.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(__dirname, '../.env.local') });
config({ path: resolve(__dirname, '../.env') });

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
if (getApps().length === 0) {
  try {
    const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (serviceAccountPath) {
      initializeApp({
        credential: cert(serviceAccountPath),
      });
    } else if (process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
      let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
      if (!privateKey.includes('\n') && privateKey.includes('\\n')) {
        privateKey = privateKey.replace(/\\n/g, '\n');
      }
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
      });
    }
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    process.exit(1);
  }
}

const db = getFirestore();

const TEST_ACCOUNTS = ['kevinvera1', 'kevinvera2', 'kevinvera3', 'kevinvera4', 'kevinvera5', 'kevinvera6', 'kevinvera7'];

async function checkFirestore() {
  console.log('🔍 Checking Firestore for kevinvera test accounts...\n');

  for (const username of TEST_ACCOUNTS) {
    try {
      const coachRef = db.collection('coaches').doc(username.toLowerCase());
      const coachDoc = await coachRef.get();
      
      if (coachDoc.exists) {
        const data = coachDoc.data();
        console.log(`  ❌ Found ${username} in Firestore:`);
        console.log(`     Display Name: ${data?.displayName || 'N/A'}`);
        console.log(`     Email: ${data?.email || 'N/A'}`);
        console.log(`     ID: ${coachDoc.id}`);
      } else {
        console.log(`  ✅ ${username} not found in Firestore`);
      }
    } catch (error: any) {
      console.error(`  ⚠️  Error checking ${username}:`, error.message);
    }
  }

  console.log('\n✨ Check complete!');
}

checkFirestore()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
