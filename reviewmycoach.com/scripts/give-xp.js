#!/usr/bin/env node

/**
 * Script to give test XP to a coach
 * Run: node scripts/give-xp.js
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Parse command line arguments
const args = process.argv.slice(2);
const xpLevel = args[0] || 'moderate'; // 'moderate' or 'legendary'

// Initialize Firebase Admin
const path = require('path');
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || 
  path.join(__dirname, '../../Review My Coach Firebase Service Account.json');

let app;
try {
  app = initializeApp({
    credential: cert(require(serviceAccountPath))
  });
} catch (error) {
  console.error('❌ Error initializing Firebase Admin:', error.message);
  console.log('\n💡 Make sure your service account JSON file is in the correct location.');
  process.exit(1);
}

const db = getFirestore(app);

async function giveXP() {
  const username = 'kevinvera6';
  
  console.log(`\n🎮 Giving ${xpLevel} XP to ${username}...\n`);
  
  // Define XP configurations
  const configs = {
    moderate: {
      subscription_tier: 2,
      longevity_platform_years: 2,
      career_years: 5,
      courses_created: 3,
      jobs_completed: 50,
      average_rating: 4.5,
      total_reviews: 24,
      consistency_multiplier: 1.5,
      estimatedXP: 14250
    },
    legendary: {
      subscription_tier: 3,
      longevity_platform_years: 4,
      career_years: 10,
      courses_created: 5,
      jobs_completed: 100,
      average_rating: 5.0,
      total_reviews: 50,
      consistency_multiplier: 2.0,
      estimatedXP: 34600
    }
  };
  
  const config = configs[xpLevel] || configs.moderate;
  
  try {
    // Query for the coach by username
    const coachesRef = db.collection('coaches');
    const snapshot = await coachesRef.where('username', '==', username).limit(1).get();
    
    if (snapshot.empty) {
      console.error(`❌ Coach with username "${username}" not found in Firestore.`);
      console.log('💡 Note: This script updates Firestore, but XP is calculated from Data Connect.');
      console.log('   You may need to run the SQL script directly in Firebase Console.');
      process.exit(1);
    }
    
    const coachDoc = snapshot.docs[0];
    const coachId = coachDoc.id;
    
    console.log(`✅ Found coach: ${coachDoc.data().display_name || username}`);
    console.log(`   Document ID: ${coachId}\n`);
    
    // Update the coach document
    await coachDoc.ref.update({
      subscription_tier: config.subscription_tier,
      longevity_platform_years: config.longevity_platform_years,
      career_years: config.career_years,
      courses_created: config.courses_created,
      jobs_completed: config.jobs_completed,
      average_rating: config.average_rating,
      total_reviews: config.total_reviews,
      consistency_multiplier: config.consistency_multiplier,
      updated_at: new Date()
    });
    
    console.log('✅ Successfully updated coach stats in Firestore!\n');
    console.log('📊 XP Breakdown:');
    console.log('─────────────────────────────────────');
    console.log(`   Subscription Tier: ${config.subscription_tier} (${config.subscription_tier * 1000} XP)`);
    console.log(`   Platform Years: ${config.longevity_platform_years} (${config.longevity_platform_years * 200} XP)`);
    console.log(`   Career Years: ${config.career_years} (${config.career_years * 150} XP)`);
    console.log(`   Courses: ${config.courses_created} (${config.courses_created * 300} XP)`);
    console.log(`   Jobs Completed: ${config.jobs_completed} (${config.jobs_completed * 100} XP)`);
    console.log(`   Rating: ${config.average_rating}/5.0 (${Math.round((config.average_rating / 5) * 500)} XP)`);
    console.log(`   Consistency: ${config.consistency_multiplier}x`);
    console.log('─────────────────────────────────────');
    console.log(`   Estimated Total XP: ${config.estimatedXP.toLocaleString()} XP 🎉\n`);
    
    if (config.estimatedXP >= 20000) {
      console.log('🏆 LEGENDARY STATUS! All 5 tier cards unlocked! ⭐');
    } else if (config.estimatedXP >= 12000) {
      console.log('💎 VETERAN STATUS! Tier 4 unlocked!');
    } else if (config.estimatedXP >= 7000) {
      console.log('🥇 ELITE STATUS! Tier 3 unlocked!');
    }
    
    console.log('\n⚠️  IMPORTANT: This only updates Firestore.');
    console.log('   The XP is actually calculated from Data Connect (PostgreSQL).');
    console.log('   You still need to run the SQL script in Firebase Console:\n');
    console.log(`   👉 scripts/give-${xpLevel}-xp.sql\n`);
    console.log('📍 Next steps:');
    console.log('   1. Go to: https://console.cloud.google.com/sql/instances/review-my-coach-instance/query?project=review-my-coach');
    console.log(`   2. Run the SQL from: scripts/give-${xpLevel}-xp.sql`);
    console.log('   3. Visit: http://localhost:3001/dashboard/coach/cards');
    console.log('   4. Click "Tier Cards" tab');
    console.log('   5. Click "Check for New Tier Cards"\n');
    
  } catch (error) {
    console.error('❌ Error updating coach:', error.message);
    process.exit(1);
  }
  
  process.exit(0);
}

// Run the script
giveXP().catch(error => {
  console.error('❌ Script error:', error);
  process.exit(1);
});

