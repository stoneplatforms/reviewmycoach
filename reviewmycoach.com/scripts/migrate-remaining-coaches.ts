/**
 * Migrate remaining coaches from Supabase to Firebase Data Connect
 * 
 * This will transfer the ~26,000 coaches that haven't been migrated yet
 */

import { initializeApp, getApps } from 'firebase/app';
import { getDataConnect } from 'firebase/data-connect';
import { createCoach, updateCoach } from '../app/lib/dataconnect';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function getAllSupabaseCoaches() {
  console.log('📥 Fetching all coaches from Supabase...');
  
  const allCoaches: any[] = [];
  let offset = 0;
  const limit = 1000;
  
  while (true) {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/coaches?select=*&limit=${limit}&offset=${offset}`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      }
    );
    
    const coaches = await response.json();
    
    if (coaches.length === 0) break;
    
    allCoaches.push(...coaches);
    offset += limit;
    
    console.log(`  Fetched ${allCoaches.length} coaches so far...`);
  }
  
  console.log(`✅ Total coaches fetched from Supabase: ${allCoaches.length}\n`);
  return allCoaches;
}

async function migrateCoach(coach: any, index: number, total: number) {
  try {
    // Prepare coach data for Data Connect
    const coachData = {
      id: coach.id,
      username: coach.username || coach.display_name?.toLowerCase().replace(/\s+/g, '_') || coach.id,
      userId: coach.user_id || '',
      displayName: coach.display_name || '',
      email: coach.email || '',
    };
    
    // Try to create the coach
    try {
      await createCoach(dataConnect, coachData);
      console.log(`  ✓ [${index}/${total}] Created: ${coach.display_name || coach.id}`);
      return { status: 'created', coach: coachData };
    } catch (createError: any) {
      // If coach already exists, update it with additional data
      if (createError.message?.includes('ALREADY_EXISTS') || createError.message?.includes('already exists')) {
        try {
          await updateCoach(dataConnect, {
            id: coach.id,
            bio: coach.bio || null,
            sports: coach.sports || null,
            location: coach.location || null,
            profileImage: coach.profile_image || null,
            hourlyRate: coach.hourly_rate ? parseFloat(coach.hourly_rate) : null,
            isPublic: coach.is_public !== false, // Default to true if not explicitly false
          });
          console.log(`  ↻ [${index}/${total}] Updated: ${coach.display_name || coach.id}`);
          return { status: 'updated', coach: coachData };
        } catch (updateError) {
          console.log(`  ⊘ [${index}/${total}] Already exists (skipped): ${coach.display_name || coach.id}`);
          return { status: 'skipped', coach: coachData };
        }
      } else {
        throw createError;
      }
    }
  } catch (error: any) {
    console.error(`  ✗ [${index}/${total}] Error migrating ${coach.id}:`, error.message || error);
    return { status: 'error', coach, error: error.message };
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  MIGRATING COACHES FROM SUPABASE TO DATA CONNECT           ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  const startTime = Date.now();
  
  // Get all coaches from Supabase
  const supabaseCoaches = await getAllSupabaseCoaches();
  
  console.log(`🚀 Starting migration of ${supabaseCoaches.length} coaches...\n`);
  console.log('⏱️  This may take a while. Please be patient...\n');
  
  const stats = {
    created: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
  };
  
  // Migrate in batches to avoid rate limiting
  const batchSize = 10;
  for (let i = 0; i < supabaseCoaches.length; i += batchSize) {
    const batch = supabaseCoaches.slice(i, i + batchSize);
    
    const results = await Promise.all(
      batch.map((coach, batchIndex) => 
        migrateCoach(coach, i + batchIndex + 1, supabaseCoaches.length)
      )
    );
    
    // Update stats
    results.forEach(result => {
      stats[result.status as keyof typeof stats]++;
    });
    
    // Small delay between batches to avoid overwhelming the server
    if (i + batchSize < supabaseCoaches.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  const duration = Math.round((Date.now() - startTime) / 1000);
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ MIGRATION COMPLETE!');
  console.log('='.repeat(60));
  console.log(`\n📊 Summary:`);
  console.log(`  Created:   ${stats.created.toLocaleString()} coaches`);
  console.log(`  Updated:   ${stats.updated.toLocaleString()} coaches`);
  console.log(`  Skipped:   ${stats.skipped.toLocaleString()} coaches (already existed)`);
  console.log(`  Errors:    ${stats.errors.toLocaleString()} coaches`);
  console.log(`\n  Total:     ${supabaseCoaches.length.toLocaleString()} coaches`);
  console.log(`  Duration:  ${duration} seconds\n`);
  
  console.log('📝 Next steps:');
  console.log('1. Verify the data in Firebase Console');
  console.log('2. Refresh your search page to see all coaches');
  console.log('3. Consider running the set-coaches-public script if needed\n');
}

main()
  .then(() => {
    console.log('✅ Migration script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  });

