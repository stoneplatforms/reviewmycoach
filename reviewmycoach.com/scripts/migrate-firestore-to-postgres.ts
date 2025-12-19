#!/usr/bin/env tsx
/**
 * Migration Script: Firestore to PostgreSQL
 * 
 * This script exports all data from Firestore and imports it into PostgreSQL.
 * It auto-creates tables and columns as needed.
 * 
 * Usage:
 *   npm run migrate:firestore-to-postgres
 * 
 * Environment Variables Required:
 *   - FIREBASE_ADMIN_PROJECT_ID
 *   - FIREBASE_ADMIN_CLIENT_EMAIL
 *   - FIREBASE_ADMIN_PRIVATE_KEY
 *   - POSTGRES_URL (or POSTGRES_HOST, POSTGRES_PORT, POSTGRES_DATABASE, POSTGRES_USER, POSTGRES_PASSWORD)
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { sql } from '@vercel/postgres';

// Initialize Firebase Admin
const requiredVars = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY,
};

if (!requiredVars.projectId || !requiredVars.clientEmail || !requiredVars.privateKey) {
  throw new Error('Missing Firebase Admin environment variables');
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

// Helper function to convert Firestore timestamp to PostgreSQL timestamp
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
    return JSON.stringify(value);
  }
  
  // Handle nested objects
  if (typeof value === 'object' && value.constructor === Object) {
    return JSON.stringify(value);
  }
  
  return value;
}

// Auto-create table and columns
async function ensureTableExists(collectionName: string, sampleDoc: any): Promise<void> {
  const tableName = collectionName.replace(/-/g, '_');
  
  // Create table if it doesn't exist
  await sql`
    CREATE TABLE IF NOT EXISTS ${sql(tableName)} (
      id VARCHAR(255) PRIMARY KEY,
      data JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;
  
  // Create indexes
  await sql`
    CREATE INDEX IF NOT EXISTS idx_${sql(tableName)}_created_at 
    ON ${sql(tableName)} (created_at DESC)
  `;
  
  await sql`
    CREATE INDEX IF NOT EXISTS idx_${sql(tableName)}_data_gin 
    ON ${sql(tableName)} USING GIN (data)
  `;
  
  // Extract fields from sample document and create columns for common fields
  if (sampleDoc) {
    const fields = Object.keys(sampleDoc);
    for (const field of fields) {
      const columnName = field.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
      const value = sampleDoc[field];
      
      // Skip if column already exists (PostgreSQL will error)
      try {
        if (typeof value === 'string') {
          await sql`
            ALTER TABLE ${sql(tableName)} 
            ADD COLUMN IF NOT EXISTS ${sql(columnName)} TEXT
          `;
        } else if (typeof value === 'number') {
          await sql`
            ALTER TABLE ${sql(tableName)} 
            ADD COLUMN IF NOT EXISTS ${sql(columnName)} NUMERIC
          `;
        } else if (typeof value === 'boolean') {
          await sql`
            ALTER TABLE ${sql(tableName)} 
            ADD COLUMN IF NOT EXISTS ${sql(columnName)} BOOLEAN
          `;
        } else if (Array.isArray(value)) {
          await sql`
            ALTER TABLE ${sql(tableName)} 
            ADD COLUMN IF NOT EXISTS ${sql(columnName)} JSONB
          `;
        } else if (value && typeof value === 'object') {
          await sql`
            ALTER TABLE ${sql(tableName)} 
            ADD COLUMN IF NOT EXISTS ${sql(columnName)} JSONB
          `;
        }
      } catch (error: any) {
        // Column might already exist, continue
        if (!error.message?.includes('already exists')) {
          console.warn(`Warning creating column ${columnName}:`, error.message);
        }
      }
    }
  }
  
  console.log(`✓ Table ${tableName} ready`);
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
  let sampleDoc: any = null;
  
  // Get sample document for schema inference
  if (!snapshot.empty) {
    sampleDoc = snapshot.docs[0].data();
  }
  
  // Ensure table exists
  await ensureTableExists(collectionName, sampleDoc);
  
  // Migrate documents in batches
  const batchSize = 100;
  const docs = snapshot.docs;
  
  for (let i = 0; i < docs.length; i += batchSize) {
    const batch = docs.slice(i, i + batchSize);
    
    for (const doc of batch) {
      const docId = doc.id;
      const docData = doc.data();
      
      // Convert all values
      const convertedData: any = {};
      for (const [key, value] of Object.entries(docData)) {
        convertedData[key] = convertValue(value);
      }
      
      try {
        // Insert or update document
        await sql`
          INSERT INTO ${sql(tableName)} (id, data, created_at, updated_at)
          VALUES (${docId}, ${JSON.stringify(convertedData)}::jsonb, NOW(), NOW())
          ON CONFLICT (id) 
          DO UPDATE SET 
            data = EXCLUDED.data,
            updated_at = NOW()
        `;
        
        // Also populate individual columns if they exist
        const updates: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;
        
        for (const [key, value] of Object.entries(convertedData)) {
          const columnName = key.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
          updates.push(`${columnName} = $${paramIndex}`);
          values.push(value);
          paramIndex++;
        }
        
        if (updates.length > 0) {
          try {
            await sql.query(
              `UPDATE ${tableName} SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
              [...values, docId]
            );
          } catch (error: any) {
            // Column might not exist, that's okay - data is in JSONB
            if (!error.message?.includes('does not exist')) {
              console.warn(`Warning updating columns for ${docId}:`, error.message);
            }
          }
        }
        
        migrated++;
      } catch (error: any) {
        console.error(`  ❌ Error migrating document ${docId}:`, error.message);
      }
    }
    
    console.log(`  📊 Progress: ${Math.min(i + batchSize, docs.length)}/${docs.length} documents`);
  }
  
  console.log(`  ✅ Migrated ${migrated} documents from ${collectionName}`);
  return migrated;
}

// Main migration function
async function main() {
  console.log('🚀 Starting Firestore to PostgreSQL migration...\n');
  
  // Test PostgreSQL connection
  try {
    await sql`SELECT 1`;
    console.log('✓ PostgreSQL connection successful\n');
  } catch (error: any) {
    console.error('❌ PostgreSQL connection failed:', error.message);
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
  
  console.log(`\n🎉 Migration complete! Total documents migrated: ${totalMigrated}`);
}

// Export main function for use in API route
export default main;

// Run migration if called directly
// This will execute when running: npm run migrate:firestore-to-postgres
if (process.argv[1]?.includes('migrate-firestore-to-postgres.ts')) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

