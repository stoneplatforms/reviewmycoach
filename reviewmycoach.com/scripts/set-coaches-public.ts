/**
 * Script to set all coaches as public
 * 
 * Run this to make all your 29k+ coaches visible in search
 */

import { db } from '../app/lib/firebase-admin';

async function setAllCoachesPublic() {
  console.log('🔧 Setting all coaches to public...\n');

  try {
    // Get all coaches from Firestore
    const coachesRef = db.collection('coaches');
    const snapshot = await coachesRef.get();

    console.log(`📊 Found ${snapshot.size} coaches in Firestore`);

    let updatedCount = 0;
    let alreadyPublicCount = 0;
    let batch = db.batch();
    let batchCount = 0;

    for (const doc of snapshot.docs) {
      const data = doc.data();
      
      // Check if already public
      if (data.isPublic === true || data.is_public === true) {
        alreadyPublicCount++;
        continue;
      }

      // Update to public
      batch.update(doc.ref, {
        isPublic: true,
        is_public: true, // Support both naming conventions
        updatedAt: new Date(),
        updated_at: new Date(),
      });

      updatedCount++;
      batchCount++;

      // Commit batch every 500 updates
      if (batchCount >= 500) {
        await batch.commit();
        console.log(`  ✓ Updated ${updatedCount} coaches so far...`);
        batch = db.batch();
        batchCount = 0;
      }
    }

    // Commit remaining updates
    if (batchCount > 0) {
      await batch.commit();
    }

    console.log('\n✅ Update complete!');
    console.log(`  Total coaches: ${snapshot.size}`);
    console.log(`  Already public: ${alreadyPublicCount}`);
    console.log(`  Updated to public: ${updatedCount}`);
    console.log(`\n🎉 All coaches are now public and visible in search!`);

  } catch (error) {
    console.error('❌ Error updating coaches:', error);
    throw error;
  }
}

// Run the script
setAllCoachesPublic()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

