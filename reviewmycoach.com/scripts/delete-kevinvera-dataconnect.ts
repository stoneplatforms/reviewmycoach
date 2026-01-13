/**
 * Delete kevinvera test accounts from Firebase DataConnect using the DeleteCoach mutation
 * Usage: npx tsx scripts/delete-kevinvera-dataconnect.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(__dirname, '../.env.local') });
config({ path: resolve(__dirname, '../.env') });

import { initializeApp, getApps } from 'firebase/app';
import { getDataConnect } from 'firebase/data-connect';
import { getCoachByUsername, deleteCoach } from '../app/lib/dataconnect';

// Initialize Firebase Client
if (getApps().length === 0) {
  initializeApp({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  });
}

const dataConnect = getDataConnect(getApps()[0], {
  connector: 'reviewmycoach',
  location: 'us-east4',
  service: 'review-my-coach-service'
});

const TEST_ACCOUNTS = ['kevinvera6', 'kevinvera7'];

async function deleteTestAccounts() {
  console.log('🗑️  Deleting kevinvera test accounts from DataConnect...\n');

  for (const username of TEST_ACCOUNTS) {
    try {
      console.log(`Checking ${username}...`);
      
      // Find coach by username
      const coachResult = await getCoachByUsername(dataConnect, { username: username.toLowerCase() });
      
      if (coachResult.data.coaches && coachResult.data.coaches.length > 0) {
        const coach = coachResult.data.coaches[0];
        console.log(`  Found coach: ${coach.displayName} (ID: ${coach.id})`);
        
        // Delete using the mutation
        try {
          const deleteResult = await deleteCoach(dataConnect, { id: coach.id });
          if (deleteResult.data.coach_delete) {
            console.log(`  ✅ Deleted ${username} from DataConnect`);
          } else {
            console.log(`  ⚠️  Delete returned null for ${username}`);
          }
        } catch (deleteError: any) {
          console.error(`  ❌ Error deleting ${username}:`, deleteError.message);
          console.error(`  Full error:`, JSON.stringify(deleteError, null, 2));
        }
      } else {
        console.log(`  ℹ️  ${username} not found in DataConnect`);
      }
    } catch (error: any) {
      console.error(`  ❌ Error checking ${username}:`, error.message);
    }
  }

  console.log('\n✨ Done!');
}

deleteTestAccounts()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
