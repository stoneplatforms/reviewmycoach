/**
 * Migration Script: Firestore → Firebase Data Connect
 * 
 * This script migrates data from Firestore to Firebase Data Connect
 * using the generated TypeScript SDKs.
 * 
 * Run with: npx tsx scripts/migrate-firestore-to-dataconnect.ts
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as admin from 'firebase-admin';

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '../.env.local') });
import { initializeApp } from 'firebase/app';
import { getDataConnect, connectDataConnectEmulator } from 'firebase/data-connect';
import { connectorConfig, createUser, updateUser, createCoach, updateCoach, createReview } from '../dataconnect/app/lib/dataconnect';

// Initialize Firebase Admin (for reading Firestore)
if (!admin.apps.length) {
  // Try to load service account from JSON file first
  const serviceAccountPath = path.join(__dirname, '../service-account-key.json');
  let credential;
  
  if (require('fs').existsSync(serviceAccountPath)) {
    console.log('📁 Using service account key file: service-account-key.json');
    const serviceAccount = require(serviceAccountPath);
    credential = admin.credential.cert(serviceAccount);
  } else {
    console.log('📝 Using environment variables for credentials');
    let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
    
    if (!privateKey) {
      console.error('❌ FIREBASE_ADMIN_PRIVATE_KEY not found in environment');
      console.error('   Please either:');
      console.error('   1. Download service-account-key.json from Firebase Console');
      console.error('   2. Or ensure FIREBASE_ADMIN_PRIVATE_KEY is set correctly');
      process.exit(1);
    }
    
    // Remove surrounding quotes if present
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.slice(1, -1);
    } else if (privateKey.startsWith("'") && privateKey.endsWith("'")) {
      privateKey = privateKey.slice(1, -1);
    }
    
    // Handle different private key formats
    let formattedPrivateKey = privateKey;
    if (!formattedPrivateKey.includes('\n') && formattedPrivateKey.includes('\\n')) {
      formattedPrivateKey = formattedPrivateKey.replace(/\\n/g, '\n');
    }
    
    credential = admin.credential.cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID || 'review-my-coach',
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL || '',
      privateKey: formattedPrivateKey,
    });
  }
  
  admin.initializeApp({ credential });
  console.log('✅ Firebase Admin initialized successfully\n');
}

const firestoreDb = admin.firestore();

// Initialize Firebase Client (for Data Connect)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'review-my-coach',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const dataConnect = getDataConnect(app, connectorConfig);

async function migrateUsers() {
  console.log('👥 Migrating users...');
  const usersSnapshot = await firestoreDb.collection('users').get();
  let migratedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const doc of usersSnapshot.docs) {
    try {
      const data = doc.data();
      
      try {
        await createUser(dataConnect, {
          id: doc.id,
          email: data.email || '',
          displayName: data.displayName || data.display_name || `${data.firstName || ''} ${data.lastName || ''}`.trim() || null,
          username: data.username || null,
          firstName: data.firstName || data.first_name || null,
          lastName: data.lastName || data.last_name || null,
          role: data.role || 'user',
        });
        
        console.log(`  ✓ Migrated user: ${doc.id} (${data.email})`);
        migratedCount++;
      } catch (createError: any) {
        // Check if it's an "ALREADY_EXISTS" error
        const errorMsg = createError.message || JSON.stringify(createError);
        if (errorMsg.includes('ALREADY_EXISTS') || 
            errorMsg.includes('already exists') ||
            createError.error?.extensions?.code === 'ALREADY_EXISTS') {
          skippedCount++;
          // Optionally update existing record
          try {
            await updateUser(dataConnect, {
              id: doc.id,
              displayName: data.displayName || data.display_name || `${data.firstName || ''} ${data.lastName || ''}`.trim() || null,
              username: data.username || null,
              firstName: data.firstName || data.first_name || null,
              lastName: data.lastName || data.last_name || null,
              onboardingCompleted: data.onboardingCompleted || data.onboarding_completed || false,
            });
          } catch (updateError) {
            // Silently ignore update errors for now
          }
        } else {
          throw createError;
        }
      }
    } catch (error: any) {
      console.error(`  ✗ Error migrating user ${doc.id}:`, error.message || JSON.stringify(error));
      errorCount++;
    }
    
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  console.log(`✅ Users migration complete: ${migratedCount} migrated, ${skippedCount} already existed, ${errorCount} errors\n`);
  return { migratedCount, skippedCount, errorCount };
}

async function migrateCoaches() {
  console.log('🏆 Migrating coaches...');
  console.log('  📥 Fetching coaches from Firestore...');
  const coachesSnapshot = await firestoreDb.collection('coaches').get();
  console.log(`  ✅ Found ${coachesSnapshot.docs.length} coaches to process\n`);
  let migratedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const doc of coachesSnapshot.docs) {
    try {
      const data = doc.data();
      
      const totalProcessed = migratedCount + skippedCount + errorCount;
      if (totalProcessed === 0) {
        console.log(`  🚀 Processing first coach: ${doc.id}...`);
      }
      if (totalProcessed % 100 === 0 && totalProcessed > 0) {
        console.log(`  📊 Progress: ${migratedCount} migrated, ${skippedCount} skipped, ${errorCount} errors`);
      }
      
      try {
        const coachData = {
          id: doc.id,
          username: data.username || data.displayName?.toLowerCase().replace(/\s+/g, '_') || doc.id,
          userId: data.userId || data.user_id || '',
          displayName: data.displayName || data.display_name || '',
          email: data.email || '',
        };
        
        await createCoach(dataConnect, coachData);
        
        console.log(`  ✓ Migrated coach: ${doc.id} (${data.username || data.displayName})`);
        migratedCount++;
      } catch (createError: any) {
        // Check if it's an "ALREADY_EXISTS" error
        const errorMsg = createError.message || JSON.stringify(createError);
        if (errorMsg.includes('ALREADY_EXISTS') || 
            errorMsg.includes('already exists') ||
            createError.error?.extensions?.code === 'ALREADY_EXISTS') {
          skippedCount++;
          // Update existing coach with additional data if available
          if (data.bio || data.sports || data.location || data.profileImage || data.hourlyRate) {
            try {
              await updateCoach(dataConnect, {
                id: doc.id,
                bio: data.bio || null,
                sports: data.sports || null,
                location: data.location || null,
                profileImage: data.profileImage || data.profile_image || null,
                hourlyRate: data.hourlyRate || data.hourly_rate || null,
                isPublic: data.isPublic !== undefined ? data.isPublic : (data.is_public !== undefined ? data.is_public : null),
              });
            } catch (updateError) {
              // Silently ignore update errors for now
            }
          }
        } else {
          throw createError;
        }
      }
    } catch (error: any) {
      console.error(`  ✗ Error migrating coach ${doc.id}:`, error.message || JSON.stringify(error));
      errorCount++;
    }
    
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  console.log(`✅ Coaches migration complete: ${migratedCount} migrated, ${skippedCount} already existed, ${errorCount} errors\n`);
  return { migratedCount, skippedCount, errorCount };
}

async function migrateReviews() {
  console.log('⭐ Migrating reviews...');
  const reviewsSnapshot = await firestoreDb.collection('reviews').get();
  let migratedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const doc of reviewsSnapshot.docs) {
    try {
      const data = doc.data();
      
      try {
        await createReview(dataConnect, {
          id: doc.id,
          coachId: data.coachId || data.coach_id || '',
          coachUsername: data.coachUsername || data.coach_username || '',
          studentName: data.studentName || data.student_name || 'Anonymous',
          rating: data.rating || 0,
          reviewText: data.reviewText || data.review_text || data.text || '',
          sport: data.sport || '',
        });
        
        console.log(`  ✓ Migrated review: ${doc.id}`);
        migratedCount++;
      } catch (createError: any) {
        // Check if it's an "ALREADY_EXISTS" error
        const errorMsg = createError.message || JSON.stringify(createError);
        if (errorMsg.includes('ALREADY_EXISTS') || 
            errorMsg.includes('already exists') ||
            createError.error?.extensions?.code === 'ALREADY_EXISTS') {
          skippedCount++;
        } else {
          throw createError;
        }
      }
    } catch (error: any) {
      console.error(`  ✗ Error migrating review ${doc.id}:`, error.message || JSON.stringify(error));
      errorCount++;
    }
    
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  console.log(`✅ Reviews migration complete: ${migratedCount} migrated, ${skippedCount} already existed, ${errorCount} errors\n`);
  return { migratedCount, skippedCount, errorCount };
}

async function main() {
  console.log('🚀 Starting migration from Firestore to Firebase Data Connect...\n');
  console.log(`📡 Connecting to Data Connect: ${connectorConfig.location}/${connectorConfig.service}\n`);

  const results = {
    users: { migratedCount: 0, skippedCount: 0, errorCount: 0 },
    coaches: { migratedCount: 0, skippedCount: 0, errorCount: 0 },
    reviews: { migratedCount: 0, skippedCount: 0, errorCount: 0 },
  };

  try {
    // Migrate in order (users first, then coaches, then reviews)
    results.users = await migrateUsers();
    results.coaches = await migrateCoaches();
    results.reviews = await migrateReviews();

    console.log('\n' + '='.repeat(60));
    console.log('✅ MIGRATION COMPLETE!');
    console.log('='.repeat(60));
    console.log(`\n📊 Summary:`);
    console.log(`  Users:   ${results.users.migratedCount} migrated, ${results.users.skippedCount} already existed, ${results.users.errorCount} errors`);
    console.log(`  Coaches: ${results.coaches.migratedCount} migrated, ${results.coaches.skippedCount} already existed, ${results.coaches.errorCount} errors`);
    console.log(`  Reviews: ${results.reviews.migratedCount} migrated, ${results.reviews.skippedCount} already existed, ${results.reviews.errorCount} errors`);
    console.log(`\n  Total Migrated: ${results.users.migratedCount + results.coaches.migratedCount + results.reviews.migratedCount} records`);
    console.log(`  Already Existed: ${results.users.skippedCount + results.coaches.skippedCount + results.reviews.skippedCount} records`);
    console.log(`  Errors:          ${results.users.errorCount + results.coaches.errorCount + results.reviews.errorCount} errors\n`);

    console.log('📝 Next steps:');
    console.log('1. Verify the data at https://console.firebase.google.com/project/review-my-coach/dataconnect');
    console.log('2. Check the Cloud SQL database for the migrated data');
    console.log('3. Update your application code to use Firebase Auth + Data Connect');
    console.log('4. Test all features thoroughly\n');

    process.exit(results.users.errorCount + results.coaches.errorCount + results.reviews.errorCount > 0 ? 1 : 0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

main().catch(console.error);
