/**
 * Sync Missing Coach Names from Firestore to Data Connect
 * 
 * This script reads Firestore coaches collection and updates Data Connect
 * with the displayName field for coaches that have missing/empty names
 * 
 * Run with: npx tsx scripts/sync-coach-names-from-firestore.ts
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as admin from 'firebase-admin';
import { Pool } from 'pg';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

// Initialize Firebase Admin
if (!admin.apps.length) {
  const serviceAccountPath = path.join(__dirname, '../../Review My Coach Firebase Service Account.json');
  
  if (require('fs').existsSync(serviceAccountPath)) {
    console.log('📁 Using service account key file');
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } else {
    console.error('❌ Service account file not found at:', serviceAccountPath);
    console.error('   Please ensure the file exists');
    process.exit(1);
  }
}

const firestoreDb = admin.firestore();

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function queryDb(sql: string, params: any[] = []) {
  const client = await pool.connect();
  try {
    const result = await client.query(sql, params);
    return result.rows;
  } finally {
    client.release();
  }
}

async function syncCoachNames() {
  console.log('🔄 Starting sync of coach names from Firestore to Data Connect...\n');
  
  // Step 1: Get coaches with empty display_name from Data Connect
  console.log('📊 Finding coaches with empty names in Data Connect...');
  const emptyNameCoaches = await queryDb(`
    SELECT username, display_name
    FROM coaches
    WHERE display_name IS NULL OR display_name = '' OR TRIM(display_name) = ''
    LIMIT 5000;
  `);
  
  console.log(`  Found ${emptyNameCoaches.length} coaches with empty names\n`);
  
  if (emptyNameCoaches.length === 0) {
    console.log('✅ All coaches already have names!');
    return;
  }
  
  // Step 2: For each coach, fetch from Firestore and update
  let updatedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  
  console.log('🔄 Syncing names from Firestore...\n');
  
  for (const coach of emptyNameCoaches) {
    try {
      const username = coach.username;
      
      // Try to find the coach in Firestore by username (document ID)
      const firestoreDoc = await firestoreDb.collection('coaches').doc(username).get();
      
      if (!firestoreDoc.exists) {
        // Try by querying username field
        const querySnapshot = await firestoreDb.collection('coaches')
          .where('username', '==', username)
          .limit(1)
          .get();
        
        if (querySnapshot.empty) {
          console.log(`  ⚠️  Coach not found in Firestore: ${username}`);
          skippedCount++;
          continue;
        }
        
        const data = querySnapshot.docs[0].data();
        const displayName = data.displayName || data.display_name || username;
        
        if (displayName && displayName.trim() !== '' && displayName !== username) {
          await queryDb(`
            UPDATE coaches
            SET display_name = $1, updated_at = NOW()
            WHERE username = $2;
          `, [displayName.trim(), username]);
          
          console.log(`  ✓ Updated ${username} → "${displayName}"`);
          updatedCount++;
        } else {
          console.log(`  ⚠️  Firestore also has empty name for ${username}`);
          skippedCount++;
        }
        
        continue;
      }
      
      const data = firestoreDoc.data();
      if (!data) {
        skippedCount++;
        continue;
      }
      
      // Try to get displayName from various fields
      let displayName = data.displayName || data.display_name;
      
      // If still empty, try to construct from first_name/last_name if they exist
      if (!displayName || displayName.trim() === '') {
        const firstName = data.firstName || data.first_name || '';
        const lastName = data.lastName || data.last_name || '';
        if (firstName || lastName) {
          displayName = `${firstName} ${lastName}`.trim();
        }
      }
      
      // If still empty, check if there's a 'data' field with nested info
      if ((!displayName || displayName.trim() === '') && data.data) {
        displayName = data.data.displayName || data.data.display_name || data.data.name;
      }
      
      // Fall back to username if nothing else works
      if (!displayName || displayName.trim() === '') {
        displayName = username;
      }
      
      // Update in Data Connect if we have a valid name
      if (displayName && displayName.trim() !== '') {
        await queryDb(`
          UPDATE coaches
          SET display_name = $1, updated_at = NOW()
          WHERE LOWER(username) = LOWER($2);
        `, [displayName.trim(), username]);
        
        console.log(`  ✓ Updated ${username} → "${displayName}"`);
        updatedCount++;
      } else {
        console.log(`  ⚠️  No valid name found for ${username}`);
        skippedCount++;
      }
      
    } catch (error: any) {
      console.error(`  ✗ Error updating ${coach.username}:`, error.message);
      errorCount++;
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ SYNC COMPLETE!');
  console.log('='.repeat(60));
  console.log(`\n📊 Summary:`);
  console.log(`  Updated:   ${updatedCount} coaches`);
  console.log(`  Skipped:   ${skippedCount} coaches (no name in Firestore either)`);
  console.log(`  Errors:    ${errorCount} coaches\n`);
  
  // Verify the results
  const remainingEmpty = await queryDb(`
    SELECT COUNT(*) as count
    FROM coaches
    WHERE display_name IS NULL OR display_name = '' OR TRIM(display_name) = '';
  `);
  
  console.log(`📊 Coaches still with empty names: ${remainingEmpty[0].count}\n`);
}

async function main() {
  try {
    await syncCoachNames();
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Sync failed:', error);
    await pool.end();
    process.exit(1);
  }
}

main().catch(console.error);

