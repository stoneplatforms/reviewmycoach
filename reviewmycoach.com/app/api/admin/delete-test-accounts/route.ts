import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/firebase-admin';
import { adminAuth } from '../../../lib/firebase-admin-server';
import { getDataConnect } from 'firebase/data-connect';
import { initializeApp, getApps } from 'firebase/app';
import { getCoachByUsername, deleteCoach } from '../../../lib/dataconnect';

/**
 * DELETE /api/admin/delete-test-accounts
 * Delete test kevinvera accounts from Firebase Auth, Firestore, and DataConnect
 */
export async function DELETE(request: NextRequest) {
  try {
    const TEST_ACCOUNTS = [
      'kevinvera1',
      'kevinvera2',
      'kevinvera3',
      'kevinvera4',
      'kevinvera5',
      'kevinvera6',
      'kevinvera7'
    ];

    console.log('🗑️  Starting deletion of test accounts...');

    // Initialize Firebase Client for DataConnect
    let clientApp;
    if (getApps().length === 0) {
      clientApp = initializeApp({
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      });
    } else {
      clientApp = getApps()[0];
    }

    const dataConnect = getDataConnect(clientApp, {
      connector: 'reviewmycoach',
      location: 'us-east4',
      service: 'review-my-coach-service'
    });

    const results = {
      deleted: [] as string[],
      failed: [] as { username: string; error: string }[],
      details: [] as { username: string; auth: boolean; firestore: boolean; dataconnect: boolean }[]
    };

    for (const username of TEST_ACCOUNTS) {
      const detail = {
        username,
        auth: false,
        firestore: false,
        dataconnect: false
      };

      try {
        console.log(`\n🗑️  Deleting ${username}...`);

        // 1. Delete from Firebase DataConnect (PostgreSQL)
        try {
          const coachResult = await getCoachByUsername(dataConnect, { username: username.toLowerCase() });
          if (coachResult.data.coaches && coachResult.data.coaches.length > 0) {
            const coach = coachResult.data.coaches[0];
            try {
              const deleteResult = await deleteCoach(dataConnect, { id: coach.id });
              if (deleteResult.data.coach_delete) {
                console.log(`  ✅ Deleted from DataConnect (ID: ${coach.id})`);
                detail.dataconnect = true;
              } else {
                console.log(`  ⚠️  Delete mutation returned null (coach may not exist)`);
              }
            } catch (deleteError: any) {
              console.error(`  ❌ Error deleting from DataConnect:`, deleteError.message);
              console.error(`  Full error:`, JSON.stringify(deleteError, null, 2));
              // Still mark as found so we know it exists
              detail.dataconnect = true;
            }
          } else {
            console.log(`  ℹ️  Coach not found in DataConnect`);
          }
        } catch (error: any) {
          console.error(`  ❌ Error checking DataConnect for ${username}:`, error.message);
          console.error(`  Full error:`, JSON.stringify(error, null, 2));
        }

        // 2. Delete from Firestore
        try {
          const coachRef = db.collection('coaches').doc(username.toLowerCase());
          const coachDoc = await coachRef.get();
          if (coachDoc.exists) {
            await coachRef.delete();
            console.log(`  ✅ Deleted from Firestore`);
            detail.firestore = true;
          } else {
            console.log(`  ℹ️  Not found in Firestore`);
          }
        } catch (error: any) {
          console.error(`  ❌ Error deleting from Firestore:`, error.message);
        }

        // 3. Delete from Firebase Auth (find by email pattern)
        try {
          // Try to find user by email pattern kevinveraX@...
          const emailPattern = `${username}@`;
          // List users and find matching emails
          let userFound = false;
          let pageToken: string | undefined;
          
          do {
            const listUsersResult = await adminAuth.listUsers(1000, pageToken);
            
            for (const userRecord of listUsersResult.users) {
              if (userRecord.email && userRecord.email.toLowerCase().startsWith(emailPattern.toLowerCase())) {
                await adminAuth.deleteUser(userRecord.uid);
                console.log(`  ✅ Deleted from Auth (${userRecord.email})`);
                detail.auth = true;
                userFound = true;
                break;
              }
            }
            
            pageToken = listUsersResult.pageToken;
          } while (pageToken && !userFound);
          
          if (!userFound) {
            console.log(`  ℹ️  User not found in Auth`);
          }
        } catch (error: any) {
          console.error(`  ❌ Error deleting from Auth:`, error.message);
        }

        if (detail.auth || detail.firestore || detail.dataconnect) {
          results.deleted.push(username);
        } else {
          results.failed.push({
            username,
            error: 'No accounts found to delete'
          });
        }

        results.details.push(detail);

      } catch (error: any) {
        console.error(`❌ Failed to delete ${username}:`, error.message);
        results.failed.push({
          username,
          error: error.message
        });
        results.details.push(detail);
      }
    }

    return NextResponse.json({
      success: true,
      deleted: results.deleted,
      failed: results.failed,
      details: results.details,
      summary: {
        total: TEST_ACCOUNTS.length,
        deleted: results.deleted.length,
        failed: results.failed.length
      }
    });

  } catch (error) {
    console.error('Error deleting test accounts:', error);
    return NextResponse.json(
      { error: 'Failed to delete test accounts', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
