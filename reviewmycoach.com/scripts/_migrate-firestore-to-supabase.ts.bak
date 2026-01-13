#!/usr/bin/env tsx
/**
 * Migration Script: Firestore to Supabase PostgreSQL
 * 
 * This script exports all data from Firestore and imports it into Supabase PostgreSQL.
 * 
 * Usage:
 *   npm run migrate:firestore-to-supabase
 * 
 * Environment Variables Required:
 *   - FIREBASE_ADMIN_PROJECT_ID
 *   - FIREBASE_ADMIN_CLIENT_EMAIL
 *   - FIREBASE_ADMIN_PRIVATE_KEY
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY
 */

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createClient } from '@supabase/supabase-js';

// Initialize Firebase Admin
const requiredVars = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY,
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
};

if (!requiredVars.projectId || !requiredVars.clientEmail || !requiredVars.privateKey) {
  throw new Error('Missing Firebase Admin environment variables');
}

if (!requiredVars.supabaseUrl || !requiredVars.supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

// Fix malformed private key if needed
let privateKey = requiredVars.privateKey;
if (!privateKey.startsWith('-----BEGIN')) {
  const beginIndex = privateKey.indexOf('-----BEGIN');
  if (beginIndex > 0) {
    privateKey = privateKey.substring(beginIndex);
  }
}

const app = !getApps().length 
  ? initializeApp({
      credential: cert({
        projectId: requiredVars.projectId,
        clientEmail: requiredVars.clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    })
  : getApps()[0];

const db = getFirestore(app);

// Initialize Supabase client with service role key
const supabase = createClient(requiredVars.supabaseUrl, requiredVars.supabaseKey);

// Collections to migrate
const COLLECTIONS = [
  'users',
  'coaches',
  'reviews',
  'tags',
  'categories',
  'reports',
  'analytics',
  'settings',
  'verifications',
  'identity_verifications',
  'comments',
  'bookmarks',
  'notifications',
  'sports',
  'classes',
  'enrollments',
  'services',
  'bookings',
  'stripe_accounts',
  'payment_intents',
  'jobs',
  'job_applications',
  'courses',
  'conversations',
  'messages',
  'cards',
  'user_cards',
  'admin_notifications',
];

// Helper function to convert Firestore timestamp to ISO string
function convertTimestamp(value: any): any {
  if (value && typeof value === 'object' && 'toDate' in value) {
    return value.toDate().toISOString();
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  return value;
}

// Helper function to convert Firestore data to PostgreSQL-compatible format
function convertValue(value: any): any {
  if (value === null || value === undefined) {
    return null;
  }
  
  // Handle Firestore timestamps
  if (value && typeof value === 'object' && 'toDate' in value) {
    return value.toDate().toISOString();
  }
  
  // Handle Date objects
  if (value instanceof Date) {
    return value.toISOString();
  }
  
  // Handle arrays
  if (Array.isArray(value)) {
    return value;
  }
  
  // Handle nested objects
  if (typeof value === 'object' && value.constructor === Object) {
    return value;
  }
  
  return value;
}

// Known columns for each table (to avoid putting everything in data JSONB)
const KNOWN_COLUMNS: Record<string, Set<string>> = {
  users: new Set(['id', 'user_id', 'email', 'display_name', 'username', 'first_name', 'last_name', 'role', 'onboarding_completed', 'is_verified', 'created_at', 'updated_at', 'data']),
  coaches: new Set(['id', 'username', 'user_id', 'display_name', 'email', 'phone_number', 'bio', 'sports', 'specialties', 'certifications', 'location', 'organization', 'role', 'gender', 'age_group', 'availability', 'languages', 'website', 'social_media', 'profile_completed', 'imported_from_pdf', 'source_url', 'has_active_services', 'is_public', 'hourly_rate', 'average_rating', 'total_reviews', 'experience', 'profile_image', 'is_claimed', 'is_verified', 'verification_status', 'subscription_status', 'claimed_at', 'created_at', 'updated_at', 'data']),
  reviews: new Set(['id', 'coach_id', 'coach_username', 'user_id', 'email', 'student_name', 'rating', 'review_text', 'sport', 'created_at', 'updated_at', 'data']),
};

// Convert Firestore document to Supabase row format
function convertDocument(docId: string, docData: any, tableName?: string): any {
  const row: any = {
    id: docId,
  };
  
  const dataField: any = {};
  const knownColumns = tableName ? KNOWN_COLUMNS[tableName] || new Set() : new Set();
  
  // Convert all fields
  for (const [key, value] of Object.entries(docData)) {
    const converted = convertValue(value);
    
    // Convert field names to snake_case for PostgreSQL
    const columnName = key.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
    
    // Special handling for users table - ensure id is TEXT, not UUID
    if (tableName === 'users' && key === 'userId') {
      row.user_id = converted;
    } else if (knownColumns.has(columnName) || knownColumns.has(key)) {
      // Known column - add directly to row
      row[columnName] = converted;
    } else {
      // Unknown column - store in data JSONB field
      dataField[key] = converted;
    }
  }
  
  // Merge any existing data field
  if (docData.data && typeof docData.data === 'object') {
    Object.assign(dataField, docData.data);
  }
  
  // Set data field if there's anything in it
  if (Object.keys(dataField).length > 0) {
    row.data = dataField;
  }
  
  // Ensure timestamps
  if (!row.created_at) {
    row.created_at = new Date().toISOString();
  }
  if (!row.updated_at) {
    row.updated_at = new Date().toISOString();
  }
  
  return row;
}

// Migrate a single collection
async function migrateCollection(collectionName: string): Promise<number> {
  console.log(`\n📦 Migrating collection: ${collectionName}`);
  
  const collectionRef = db.collection(collectionName);
  const snapshot = await collectionRef.get();
  
  if (snapshot.empty) {
    console.log(`  ⚠️  Collection ${collectionName} is empty, skipping...`);
    return 0;
  }
  
  const tableName = collectionName.replace(/-/g, '_');
  let migrated = 0;
  const batchSize = 100;
  const docs = snapshot.docs;
  
  // Migrate documents in batches
  for (let i = 0; i < docs.length; i += batchSize) {
    const batch = docs.slice(i, i + batchSize);
    const rows = batch.map(doc => convertDocument(doc.id, doc.data(), tableName));
    
    try {
      // Use upsert to handle duplicates
      const { error } = await supabase
        .from(tableName)
        .upsert(rows, { onConflict: 'id' });
      
      if (error) {
        console.error(`  ❌ Error migrating batch ${i}-${i + batchSize}:`, error.message);
        // Try inserting one by one if batch fails
        for (const row of rows) {
          try {
            const { error: singleError } = await supabase
              .from(tableName)
              .upsert(row, { onConflict: 'id' });
            
            if (!singleError) {
              migrated++;
            } else {
              console.error(`  ❌ Error migrating document ${row.id}:`, singleError.message);
            }
          } catch (err: any) {
            console.error(`  ❌ Error migrating document ${row.id}:`, err.message);
          }
        }
      } else {
        migrated += rows.length;
      }
    } catch (error: any) {
      console.error(`  ❌ Error migrating batch:`, error.message);
    }
    
    console.log(`  📊 Progress: ${Math.min(i + batchSize, docs.length)}/${docs.length} documents`);
  }
  
  console.log(`  ✅ Migrated ${migrated} documents from ${collectionName}`);
  return migrated;
}

// Migrate nested reviews (coaches/{coachId}/reviews/{reviewId})
async function migrateNestedReviews(): Promise<number> {
  console.log(`\n📦 Migrating nested reviews from coaches subcollections...`);
  
  const coachesRef = db.collection('coaches');
  const coachesSnapshot = await coachesRef.get();
  
  const totalCoaches = coachesSnapshot.docs.length;
  console.log(`  📊 Found ${totalCoaches} coaches to check for nested reviews...`);
  
  let totalMigrated = 0;
  let coachesProcessed = 0;
  let coachesWithReviews = 0;
  
  for (const coachDoc of coachesSnapshot.docs) {
    coachesProcessed++;
    const coachId = coachDoc.id;
    
    // Log progress every 100 coaches
    if (coachesProcessed % 100 === 0) {
      console.log(`  📊 Progress: ${coachesProcessed}/${totalCoaches} coaches processed, ${coachesWithReviews} coaches with reviews, ${totalMigrated} reviews migrated`);
    }
    
    try {
      const reviewsRef = coachDoc.ref.collection('reviews');
      const reviewsSnapshot = await reviewsRef.get();
      
      if (reviewsSnapshot.empty) continue;
      
      coachesWithReviews++;
      const reviews = reviewsSnapshot.docs.map(doc => ({
        ...convertDocument(doc.id, doc.data(), 'reviews'),
        coach_id: coachId,
      }));
      
      const { error } = await supabase
        .from('reviews')
        .upsert(reviews, { onConflict: 'id' });
      
      if (!error) {
        totalMigrated += reviews.length;
        if (reviews.length > 0 && coachesWithReviews % 50 === 0) {
          console.log(`  ✅ Migrated ${reviews.length} reviews for coach ${coachId} (${coachesWithReviews} coaches with reviews so far)`);
        }
      } else {
        console.error(`  ❌ Error migrating reviews for coach ${coachId}:`, error.message);
        // Try one by one if batch fails
        for (const review of reviews) {
          try {
            const { error: singleError } = await supabase
              .from('reviews')
              .upsert(review, { onConflict: 'id' });
            
            if (!singleError) {
              totalMigrated++;
            }
          } catch (err: any) {
            // Skip individual errors
          }
        }
      }
    } catch (error: any) {
      // Skip errors for individual coaches
      if (coachesProcessed % 1000 === 0) {
        console.log(`  ⚠️  Skipped coach ${coachId} due to error: ${error.message}`);
      }
    }
  }
  
  console.log(`\n  ✅ Nested reviews migration complete!`);
  console.log(`  📊 Summary: ${coachesProcessed} coaches processed, ${coachesWithReviews} coaches had reviews, ${totalMigrated} total reviews migrated`);
  return totalMigrated;
}

// Main migration function
async function main() {
  console.log('🚀 Starting Firestore to Supabase migration...\n');
  
  // Test Supabase connection
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error && !error.message.includes('does not exist')) {
      throw error;
    }
    console.log('✓ Supabase connection successful\n');
  } catch (error: any) {
    console.error('❌ Supabase connection failed:', error.message);
    console.error('Make sure your Supabase tables are created. Run the schema.sql first.');
    process.exit(1);
  }
  
  // Test Firestore connection
  try {
    await db.collection('users').limit(1).get();
    console.log('✓ Firestore connection successful\n');
  } catch (error: any) {
    console.error('❌ Firestore connection failed:', error.message);
    process.exit(1);
  }
  
  let totalMigrated = 0;
  
  // Migrate each collection
  for (const collectionName of COLLECTIONS) {
    try {
      const count = await migrateCollection(collectionName);
      totalMigrated += count;
    } catch (error: any) {
      console.error(`❌ Error migrating collection ${collectionName}:`, error.message);
    }
  }
  
  // Migrate nested reviews
  try {
    const nestedCount = await migrateNestedReviews();
    totalMigrated += nestedCount;
  } catch (error: any) {
    console.error(`❌ Error migrating nested reviews:`, error.message);
  }
  
  console.log(`\n🎉 Migration complete! Total documents migrated: ${totalMigrated}`);
  console.log('\n📝 Next steps:');
  console.log('1. Verify data in Supabase dashboard');
  console.log('2. Run Firebase Auth migration script');
  console.log('3. Update codebase to use Supabase client');
}

// Export main function for use in API route
export default main;

// Run migration if called directly
if (process.argv[1]?.includes('migrate-firestore-to-supabase.ts')) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

