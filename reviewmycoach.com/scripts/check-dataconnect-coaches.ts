/**
 * Simple script to check how many coaches are in Data Connect
 */

import { initializeApp, getApps } from 'firebase/app';
import { getDataConnect } from 'firebase/data-connect';
import { searchCoachesAdvanced } from '../app/lib/dataconnect';

// Load environment variables
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.local
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Initialize Firebase
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

async function main() {
  console.log('🔍 Checking Firebase Data Connect for coaches...\n');
  console.log(`Service: review-my-coach-service`);
  console.log(`Location: us-east4`);
  console.log(`Database: review-my-coach-database\n`);
  
  try {
    // Try to fetch coaches
    console.log('Querying for coaches...');
    
    const result = await searchCoachesAdvanced(dataConnect, {
      offset: 0,
      limit: 100
    });
    
    const coaches = result.data.coaches || [];
    
    console.log(`\n✅ Found ${coaches.length} coaches in Data Connect`);
    
    if (coaches.length > 0) {
      console.log('\nSample coaches:');
      coaches.slice(0, 5).forEach((coach: any, i: number) => {
        console.log(`  ${i + 1}. ${coach.displayName || 'No name'} (${coach.id})`);
        console.log(`     Location: ${coach.location || 'N/A'}`);
        console.log(`     Sports: ${coach.sports?.join(', ') || 'N/A'}`);
        console.log(`     Rating: ${coach.averageRating || 0} (${coach.totalReviews || 0} reviews)`);
        console.log('');
      });
    } else {
      console.log('\n⚠️  NO COACHES FOUND IN DATA CONNECT!');
      console.log('\nThis means either:');
      console.log('1. The coaches were never migrated to Data Connect');
      console.log('2. They are in a different database/table');
      console.log('3. There is a connection issue\n');
    }
    
  } catch (error: any) {
    console.error('\n❌ Error querying Data Connect:');
    console.error(error.message || error);
    console.error('\nThis could mean:');
    console.log('1. Data Connect service is not deployed');
    console.log('2. Cloud SQL instance is not accessible');
    console.log('3. The database table does not exist\n');
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

