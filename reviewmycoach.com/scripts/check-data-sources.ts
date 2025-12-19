import { createClient } from '@supabase/supabase-js';
import * as admin from 'firebase-admin';

// Check Supabase
async function checkSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('⚠️  Supabase credentials not found in environment');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  
  console.log('📊 SUPABASE DATA:');
  const { data: users, error: usersError } = await supabase.from('users').select('*', { count: 'exact', head: true });
  const { data: coaches, error: coachesError } = await supabase.from('coaches').select('*', { count: 'exact', head: true });
  const { data: reviews, error: reviewsError } = await supabase.from('reviews').select('*', { count: 'exact', head: true });
  
  console.log(`  Users: ${users?.length || 0}`);
  console.log(`  Coaches: ${coaches?.length || 0}`);
  console.log(`  Reviews: ${reviews?.length || 0}\n`);
}

// Check Firestore
async function checkFirestore() {
  try {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    }

    const db = admin.firestore();
    
    console.log('🔥 FIRESTORE DATA:');
    const usersSnap = await db.collection('users').count().get();
    const coachesSnap = await db.collection('coaches').count().get();
    const reviewsSnap = await db.collection('reviews').count().get();
    
    console.log(`  Users: ${usersSnap.data().count}`);
    console.log(`  Coaches: ${coachesSnap.data().count}`);
    console.log(`  Reviews: ${reviewsSnap.data().count}\n`);
  } catch (error) {
    console.log('⚠️  Firestore not accessible:', error.message);
  }
}

async function main() {
  console.log('🔍 Checking data sources...\n');
  await checkSupabase();
  await checkFirestore();
  console.log('✅ Check complete!');
  console.log('\n💡 Migrate from whichever has more/newer data');
}

main().catch(console.error);
