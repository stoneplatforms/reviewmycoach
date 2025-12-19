/**
 * Migration Script: Supabase PostgreSQL → Firebase Data Connect PostgreSQL
 * 
 * This script migrates data directly from Supabase to Firebase Data Connect
 * using PostgreSQL dumps and restores.
 * 
 * Prerequisites:
 * 1. Install postgresql client: brew install postgresql
 * 2. Get your Supabase connection string
 * 3. Authenticate with Firebase: firebase login
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// Configuration
const SUPABASE_CONNECTION_STRING = process.env.SUPABASE_DATABASE_URL || '';
const FIREBASE_PROJECT_ID = 'review-my-coach';
const FIREBASE_INSTANCE = 'review-my-coach-instance';
const FIREBASE_DATABASE = 'review-my-coach-database';
const FIREBASE_REGION = 'us-east4';

// Tables to migrate (in order to handle foreign keys)
const TABLES_TO_MIGRATE = [
  'users',
  'coaches',
  'reviews',
  'classes',
  'services',
  'jobs',
  'job_applications',
  'bookings',
  'conversations',
  'messages',
  'cards',
  'user_cards',
  'reports',
  'sports',
  'tags',
  'bookmarks',
  'identity_verifications',
];

async function main() {
  console.log('🚀 Starting migration from Supabase to Firebase Data Connect...\n');

  if (!SUPABASE_CONNECTION_STRING) {
    console.error('❌ Error: SUPABASE_DATABASE_URL environment variable not set');
    console.log('\nSet it like this:');
    console.log('export SUPABASE_DATABASE_URL="postgresql://user:pass@host:5432/postgres"');
    process.exit(1);
  }

  // Step 1: Dump data from Supabase
  console.log('📦 Step 1: Dumping data from Supabase...');
  const dumpFile = path.join(__dirname, 'supabase-dump.sql');
  
  try {
    execSync(
      `pg_dump "${SUPABASE_CONNECTION_STRING}" ` +
      `--data-only ` +
      `--no-owner ` +
      `--no-privileges ` +
      `--table=${TABLES_TO_MIGRATE.map(t => `public.${t}`).join(' --table=')} ` +
      `--file=${dumpFile}`,
      { stdio: 'inherit' }
    );
    console.log('✅ Data dumped successfully\n');
  } catch (error) {
    console.error('❌ Error dumping data from Supabase:', error);
    process.exit(1);
  }

  // Step 2: Connect to Firebase Data Connect Cloud SQL
  console.log('📡 Step 2: Connecting to Firebase Data Connect Cloud SQL...');
  console.log('You will be prompted to connect. Press ENTER to continue.\n');
  
  try {
    // Use firebase dataconnect:sql:shell to restore the dump
    console.log('Restoring data to Firebase Data Connect...');
    console.log('Run this command manually:');
    console.log(`\nfirebase dataconnect:sql:shell review-my-coach-service`);
    console.log(`\nThen in the SQL shell, run:`);
    console.log(`\\i ${dumpFile}\n`);
    
    // Alternative: Use gcloud sql to connect and restore
    console.log('OR use gcloud directly:');
    console.log(`\ngcloud sql connect ${FIREBASE_INSTANCE} --user=postgres --database=${FIREBASE_DATABASE} --project=${FIREBASE_PROJECT_ID}`);
    console.log(`\nThen in the psql prompt:`);
    console.log(`\\i ${dumpFile}\n`);
    
  } catch (error) {
    console.error('❌ Error connecting to Firebase Data Connect:', error);
    process.exit(1);
  }

  console.log('\n✅ Migration script prepared!');
  console.log(`\nDump file saved to: ${dumpFile}`);
  console.log('\n📝 Next steps:');
  console.log('1. Connect to Firebase Cloud SQL using one of the methods above');
  console.log('2. Import the dump file');
  console.log('3. Verify the data migration');
  console.log('4. Update your application to use Firebase Data Connect\n');
}

main().catch(console.error);



