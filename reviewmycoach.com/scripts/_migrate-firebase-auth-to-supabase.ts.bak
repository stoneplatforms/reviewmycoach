#!/usr/bin/env tsx
/**
 * Migration Script: Firebase Auth to Supabase Auth
 * 
 * This script exports all Firebase Auth users and imports them into Supabase Auth.
 * 
 * Usage:
 *   npm run migrate:firebase-auth-to-supabase
 * 
 * Environment Variables Required:
 *   - FIREBASE_ADMIN_PROJECT_ID
 *   - FIREBASE_ADMIN_CLIENT_EMAIL
 *   - FIREBASE_ADMIN_PRIVATE_KEY
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
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

const auth = getAuth(app);

// Initialize Supabase client with service role key
const supabase = createClient(requiredVars.supabaseUrl, requiredVars.supabaseKey);

// Migrate a single user
async function migrateUser(firebaseUser: any): Promise<boolean> {
  try {
    // Get user's custom claims and metadata
    const customClaims = firebaseUser.customClaims || {};
    const metadata = firebaseUser.metadata || {};
    
    // Prepare user data for Supabase
    const userData: any = {
      id: firebaseUser.uid,
      email: firebaseUser.email,
      email_confirmed_at: firebaseUser.emailVerified ? metadata.creationTime : null,
      created_at: metadata.creationTime || new Date().toISOString(),
      updated_at: metadata.lastSignInTime || new Date().toISOString(),
      last_sign_in_at: metadata.lastSignInTime || null,
      raw_app_meta_data: {
        provider: firebaseUser.providerData?.[0]?.providerId || 'email',
        providers: firebaseUser.providerData?.map((p: any) => p.providerId) || ['email'],
      },
      raw_user_meta_data: {
        display_name: firebaseUser.displayName,
        photo_url: firebaseUser.photoURL,
        phone: firebaseUser.phoneNumber,
        ...customClaims,
      },
    };
    
    // Handle password (if email/password provider)
    let passwordHash: string | null = null;
    if (firebaseUser.providerData?.some((p: any) => p.providerId === 'password')) {
      // Note: Firebase doesn't expose password hashes directly
      // Users will need to reset passwords or use password import
      console.warn(`  ⚠️  User ${firebaseUser.uid} has password auth - password will need to be reset`);
    }
    
    // Create user in Supabase Auth using Admin API
    const { data, error } = await supabase.auth.admin.createUser({
      id: userData.id,
      email: userData.email,
      email_confirm: userData.email_confirmed_at ? true : false,
      user_metadata: userData.raw_user_meta_data,
      app_metadata: userData.raw_app_meta_data,
      created_at: userData.created_at,
      updated_at: userData.updated_at,
      last_sign_in_at: userData.last_sign_in_at,
    });
    
    if (error) {
      // If user already exists, try updating
      if (error.message.includes('already registered')) {
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          userData.id,
          {
            email: userData.email,
            user_metadata: userData.raw_user_meta_data,
            app_metadata: userData.raw_app_meta_data,
          }
        );
        
        if (updateError) {
          console.error(`  ❌ Error updating user ${firebaseUser.uid}:`, updateError.message);
          return false;
        }
        return true;
      }
      
      console.error(`  ❌ Error creating user ${firebaseUser.uid}:`, error.message);
      return false;
    }
    
    return true;
  } catch (error: any) {
    console.error(`  ❌ Error migrating user ${firebaseUser.uid}:`, error.message);
    return false;
  }
}

// Main migration function
async function main() {
  console.log('🚀 Starting Firebase Auth to Supabase Auth migration...\n');
  
  // Test Supabase connection
  try {
    const { data, error } = await supabase.auth.admin.listUsers();
    if (error) throw error;
    console.log('✓ Supabase connection successful\n');
  } catch (error: any) {
    console.error('❌ Supabase connection failed:', error.message);
    console.error('Make sure SUPABASE_SERVICE_ROLE_KEY is set correctly.');
    process.exit(1);
  }
  
  // Test Firebase Auth connection
  try {
    await auth.listUsers(1);
    console.log('✓ Firebase Auth connection successful\n');
  } catch (error: any) {
    console.error('❌ Firebase Auth connection failed:', error.message);
    process.exit(1);
  }
  
  let totalMigrated = 0;
  let totalFailed = 0;
  let nextPageToken: string | undefined;
  
  // Migrate users in batches
  do {
    try {
      const listUsersResult = await auth.listUsers(1000, nextPageToken);
      const users = listUsersResult.users;
      
      console.log(`\n📦 Migrating batch of ${users.length} users...`);
      
      for (const user of users) {
        const success = await migrateUser({
          uid: user.uid,
          email: user.email,
          emailVerified: user.emailVerified,
          displayName: user.displayName,
          photoURL: user.photoURL,
          phoneNumber: user.phoneNumber,
          metadata: {
            creationTime: user.metadata.creationTime,
            lastSignInTime: user.metadata.lastSignInTime,
          },
          providerData: user.providerData,
          customClaims: user.customClaims,
        });
        
        if (success) {
          totalMigrated++;
        } else {
          totalFailed++;
        }
        
        // Progress indicator
        if ((totalMigrated + totalFailed) % 100 === 0) {
          console.log(`  📊 Progress: ${totalMigrated + totalFailed} users processed...`);
        }
      }
      
      nextPageToken = listUsersResult.pageToken;
    } catch (error: any) {
      console.error('❌ Error listing users:', error.message);
      break;
    }
  } while (nextPageToken);
  
  console.log(`\n🎉 Migration complete!`);
  console.log(`✅ Successfully migrated: ${totalMigrated} users`);
  console.log(`❌ Failed: ${totalFailed} users`);
  
  if (totalFailed > 0) {
    console.log('\n⚠️  Some users failed to migrate. Check the logs above for details.');
  }
  
  console.log('\n📝 Next steps:');
  console.log('1. Notify users with password auth to reset their passwords');
  console.log('2. Test authentication with migrated users');
  console.log('3. Update codebase to use Supabase Auth');
}

// Export main function for use in API route
export default main;

// Run migration if called directly
if (process.argv[1]?.includes('migrate-firebase-auth-to-supabase.ts')) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

