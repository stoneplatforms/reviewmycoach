/**
 * Direct PostgreSQL XP recalculation (bypasses DataConnect)
 * Uses the production database directly
 */

import { Pool } from 'pg';
import { calculateCoachXP, type XPCalculationInputs } from '../app/lib/xp-calculator';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:78900@35.245.162.116:5432/postgres';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: false
});

async function recalculateAllXP() {
  console.log('🚀 Starting XP recalculation (Direct PostgreSQL)...');
  console.log(`📡 Database: ${DATABASE_URL.replace(/:[^:]*@/, ':****@')}`);
  console.log('');

  const startTime = Date.now();
  let totalProcessed = 0;
  let totalUpdated = 0;
  let totalErrors = 0;

  try {
    // Fetch all coaches
    console.log('📊 Fetching all coaches...');
    const result = await pool.query(`
      SELECT
        id,
        "subscriptionTier",
        "longevityPlatformYears",
        "careerYears",
        "coursesCreated",
        "jobsCompleted",
        "averageRating",
        "consistencyMultiplier"
      FROM coach
      ORDER BY id
    `);

    const coaches = result.rows;
    console.log(`✅ Found ${coaches.length} coaches\n`);

    // Process in batches of 100
    const BATCH_SIZE = 100;
    for (let i = 0; i < coaches.length; i += BATCH_SIZE) {
      const batch = coaches.slice(i, i + BATCH_SIZE);
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(coaches.length / BATCH_SIZE);

      console.log(`📦 Batch ${batchNum}/${totalBatches}: Processing ${batch.length} coaches...`);

      for (const coach of batch) {
        try {
          const inputs: XPCalculationInputs = {
            subscription_tier: Number(coach.subscriptionTier) || 0,
            longevity_platform_years: Number(coach.longevityPlatformYears) || 0,
            career_years: Number(coach.careerYears) || 0,
            courses_created: Number(coach.coursesCreated) || 0,
            jobs_completed: Number(coach.jobsCompleted) || 0,
            review_score: Number(coach.averageRating) || 0,
            consistency_multiplier: Number(coach.consistencyMultiplier) || 1.0,
          };

          const xpResult = calculateCoachXP(inputs);

          await pool.query(
            'UPDATE coach SET "totalXp" = $1 WHERE id = $2',
            [xpResult.total_xp, coach.id]
          );

          totalUpdated++;
        } catch (error) {
          console.error(`  ❌ Error updating coach ${coach.id}:`, error);
          totalErrors++;
        }
        totalProcessed++;
      }

      const progress = ((totalProcessed / coaches.length) * 100).toFixed(1);
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
      const rate = (totalProcessed / parseFloat(elapsed)).toFixed(1);

      console.log(`  ✅ Batch complete: ${totalUpdated} updated, ${totalErrors} errors`);
      console.log(`  📊 Progress: ${progress}% (${totalProcessed}/${coaches.length}) @ ${rate} coaches/sec\n`);
    }

    const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);
    const avgRate = (totalProcessed / parseFloat(totalDuration)).toFixed(1);

    console.log('='.repeat(50));
    console.log('🎉 XP RECALCULATION COMPLETE');
    console.log('='.repeat(50));
    console.log(`📊 Total coaches: ${totalProcessed.toLocaleString()}`);
    console.log(`✅ Successfully updated: ${totalUpdated.toLocaleString()}`);
    console.log(`❌ Errors: ${totalErrors.toLocaleString()}`);
    console.log(`⏱️  Duration: ${totalDuration}s`);
    console.log(`🚀 Average rate: ${avgRate} coaches/second`);
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Fatal error:', error);
  } finally {
    await pool.end();
  }
}

recalculateAllXP().catch(console.error);
