/**
 * Check where the coaches actually are:
 * - Supabase PostgreSQL
 * - Firestore
 * - Firebase Data Connect
 */

import { initializeApp, getApps } from 'firebase/app';
import { getDataConnect } from 'firebase/data-connect';
import { countPublicCoaches } from '../app/lib/dataconnect';
import { db as firestoreDb } from '../app/lib/firebase-client';
import { collection, getDocs, limit, query } from 'firebase/firestore';

// Initialize Firebase if not already initialized
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

async function checkDataConnect() {
  console.log('🔍 Checking Firebase Data Connect...\n');
  
  try {
    const result = await countPublicCoaches(dataConnect);
    const coaches = result.data.coaches || [];
    console.log(`✅ Firebase Data Connect: ${coaches.length} coaches found`);
    
    // Show sample
    if (coaches.length > 0) {
      console.log('\nSample coaches from Data Connect:');
      coaches.slice(0, 3).forEach((coach: any) => {
        console.log(`  - ${coach.id}`);
      });
    }
    
    return coaches.length;
  } catch (error) {
    console.error('❌ Error querying Data Connect:', error);
    return 0;
  }
}

async function checkFirestore() {
  console.log('\n🔍 Checking Firestore...\n');
  
  try {
    const coachesRef = collection(firestoreDb, 'coaches');
    const snapshot = await getDocs(coachesRef);
    
    console.log(`✅ Firestore: ${snapshot.size} coaches found`);
    
    // Show sample
    if (!snapshot.empty) {
      console.log('\nSample coaches from Firestore:');
      snapshot.docs.slice(0, 3).forEach(doc => {
        const data = doc.data();
        console.log(`  - ${doc.id} (${data.displayName || data.display_name || 'No name'})`);
      });
    }
    
    return snapshot.size;
  } catch (error) {
    console.error('❌ Error querying Firestore:', error);
    return 0;
  }
}

async function checkSupabase() {
  console.log('\n🔍 Checking Supabase...\n');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('⚠️  Supabase credentials not found in environment');
    return 0;
  }
  
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/coaches?select=count`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'count=exact'
      }
    });
    
    const countHeader = response.headers.get('content-range');
    const count = countHeader ? parseInt(countHeader.split('/')[1]) : 0;
    
    console.log(`✅ Supabase: ${count} coaches found`);
    
    // Get sample
    const sampleResponse = await fetch(`${supabaseUrl}/rest/v1/coaches?select=id,display_name&limit=3`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    
    const sample = await sampleResponse.json();
    if (sample.length > 0) {
      console.log('\nSample coaches from Supabase:');
      sample.forEach((coach: any) => {
        console.log(`  - ${coach.id} (${coach.display_name || 'No name'})`);
      });
    }
    
    return count;
  } catch (error) {
    console.error('❌ Error querying Supabase:', error);
    return 0;
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  CHECKING COACH DATA LOCATIONS                             ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  const counts = {
    dataConnect: await checkDataConnect(),
    firestore: await checkFirestore(),
    supabase: await checkSupabase(),
  };
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));
  console.log(`Firebase Data Connect:  ${counts.dataConnect.toLocaleString()} coaches`);
  console.log(`Firestore:              ${counts.firestore.toLocaleString()} coaches`);
  console.log(`Supabase:               ${counts.supabase.toLocaleString()} coaches`);
  console.log('='.repeat(60));
  
  // Recommendation
  console.log('\n💡 RECOMMENDATION:\n');
  
  if (counts.supabase > counts.dataConnect && counts.supabase > counts.firestore) {
    console.log('⚠️  Most coaches are still in Supabase!');
    console.log('   You need to migrate them to Firebase Data Connect.');
    console.log('\n   Run: npx ts-node scripts/migrate-supabase-to-dataconnect.ts\n');
  } else if (counts.firestore > counts.dataConnect) {
    console.log('⚠️  Most coaches are in Firestore!');
    console.log('   You need to migrate them to Firebase Data Connect.');
    console.log('\n   Run: npx ts-node scripts/migrate-firestore-to-dataconnect.ts\n');
  } else if (counts.dataConnect > 0) {
    console.log('✅ Coaches are in Firebase Data Connect!');
    console.log('   Your queries should be finding them.');
    console.log('   Check the isPublic field or query filters.\n');
  } else {
    console.log('❌ No coaches found in any database!');
    console.log('   Check your database connections.\n');
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

