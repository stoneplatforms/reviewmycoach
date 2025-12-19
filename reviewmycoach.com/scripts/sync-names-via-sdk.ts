/**
 * Sync Coach Names from Firestore to Data Connect using SDK
 * This uses Firebase Data Connect SDK instead of direct PostgreSQL
 * 
 * Run with: npx tsx scripts/sync-names-via-sdk.ts
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as admin from 'firebase-admin';
import { initializeApp } from 'firebase/app';
import { getDataConnect } from 'firebase/data-connect';

dotenv.config({ path: path.join(__dirname, '../.env.local') });

// Initialize Firebase Admin (for Firestore)
if (!admin.apps.length) {
  const serviceAccountPath = path.join(__dirname, '../../Review My Coach Firebase Service Account.json');
  
  if (require('fs').existsSync(serviceAccountPath)) {
    console.log('📁 Using service account key file');
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } else {
    console.error('❌ Service account file not found');
    process.exit(1);
  }
}

const firestoreDb = admin.firestore();

// Initialize Firebase Client for Data Connect
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const dataConnect = getDataConnect(app, {
  connector: 'reviewmycoach',
  location: 'us-east4',
  service: 'review-my-coach-service'
});

async function executeDataConnectMutation(mutation: string, variables: any) {
  const response = await fetch(
    `https://firebasedataconnect.googleapis.com/v1beta/projects/review-my-coach/locations/us-east4/services/review-my-coach-service/connectors/reviewmycoach:executeMutation`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
      },
      body: JSON.stringify({
        operationName: 'UpdateCoachName',
        query: mutation,
        variables
      })
    }
  );
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Data Connect API error: ${error}`);
  }
  
  return response.json();
}

async function syncCoachNames() {
  console.log('🔄 Syncing coach names from Firestore to Data Connect...\n');
  
  // Get all coaches from Firestore
  console.log('📥 Fetching coaches from Firestore...');
  const coachesSnapshot = await firestoreDb.collection('coaches').limit(100).get();
  console.log(`  Found ${coachesSnapshot.size} coaches to sync\n`);
  
  let updatedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  
  const updateMutation = `
    mutation UpdateCoachName($username: String!, $displayName: String!) {
      coach_update(
        key: {username: $username},
        data: {displayName: $displayName}
      ) {
        username
        displayName
      }
    }
  `;
  
  for (const doc of coachesSnapshot.docs) {
    try {
      const data = doc.data();
      const username = data.username || doc.id;
      let displayName = data.displayName || data.display_name;
      
      // Skip if no valid name
      if (!displayName || displayName.trim() === '' || displayName === username) {
        console.log(`  ⚠️  Skipping ${username} (no valid name)`);
        skippedCount++;
        continue;
      }
      
      // Update via Data Connect API
      try {
        await executeDataConnectMutation(updateMutation, {
          username: username,
          displayName: displayName.trim()
        });
        
        console.log(`  ✓ Updated ${username} → "${displayName}"`);
        updatedCount++;
      } catch (apiError: any) {
        console.error(`  ✗ API error for ${username}:`, apiError.message);
        errorCount++;
      }
      
      // Small delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error: any) {
      console.error(`  ✗ Error processing ${doc.id}:`, error.message);
      errorCount++;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ SYNC COMPLETE!');
  console.log('='.repeat(60));
  console.log(`\n📊 Summary:`);
  console.log(`  Updated:   ${updatedCount} coaches`);
  console.log(`  Skipped:   ${skippedCount} coaches`);
  console.log(`  Errors:    ${errorCount} coaches\n`);
}

async function main() {
  try {
    await syncCoachNames();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Sync failed:', error);
    process.exit(1);
  }
}

main().catch(console.error);

