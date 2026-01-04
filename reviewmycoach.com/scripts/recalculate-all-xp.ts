/**
 * Script to recalculate XP for all coaches
 *
 * Run with: npx tsx scripts/recalculate-all-xp.ts
 *
 * For production with 100k+ coaches, run against your deployed API:
 * BASE_URL=https://reviewmycoach.com npx tsx scripts/recalculate-all-xp.ts
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const BATCH_SIZE = 2000; // Coaches per API call
const DELAY_BETWEEN_BATCHES = 1000; // 1 second delay between batches

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function recalculateAllXP() {
  console.log('🚀 Starting XP recalculation for all coaches...');
  console.log(`📡 API: ${BASE_URL}`);
  console.log(`📦 Batch size: ${BATCH_SIZE}`);
  console.log('');

  let offset = 0;
  let totalProcessed = 0;
  let totalUpdated = 0;
  let totalErrors = 0;
  let batchNumber = 0;
  let hasMore = true;

  const startTime = Date.now();

  while (hasMore) {
    batchNumber++;
    console.log(`\n📊 Batch ${batchNumber}: Processing offset ${offset}...`);

    try {
      const response = await fetch(
        `${BASE_URL}/api/coaches/recalculate-xp?offset=${offset}&limit=${BATCH_SIZE}`,
        { method: 'POST' }
      );

      if (!response.ok) {
        const error = await response.text();
        console.error(`❌ Batch ${batchNumber} failed:`, error);

        // Retry logic - wait and try again
        console.log('⏳ Waiting 5 seconds before retry...');
        await sleep(5000);
        continue;
      }

      const result = await response.json();

      totalProcessed += result.processed;
      totalUpdated += result.updated;
      totalErrors += result.errors;
      offset = result.nextOffset;
      hasMore = result.hasMore;

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
      const rate = (totalProcessed / parseFloat(elapsed)).toFixed(1);

      console.log(`✅ Batch ${batchNumber} complete:`);
      console.log(`   - Processed: ${result.processed} coaches`);
      console.log(`   - Updated: ${result.updated}, Errors: ${result.errors}`);
      console.log(`   - Duration: ${result.durationSeconds}s`);
      console.log(`   - Total so far: ${totalProcessed} (${rate} coaches/sec)`);
      console.log(`   - Has more: ${hasMore}`);

      if (hasMore) {
        console.log(`⏳ Waiting ${DELAY_BETWEEN_BATCHES}ms before next batch...`);
        await sleep(DELAY_BETWEEN_BATCHES);
      }

    } catch (error) {
      console.error(`❌ Batch ${batchNumber} error:`, error);
      console.log('⏳ Waiting 10 seconds before retry...');
      await sleep(10000);
    }
  }

  const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);
  const avgRate = (totalProcessed / parseFloat(totalDuration)).toFixed(1);

  console.log('\n' + '='.repeat(50));
  console.log('🎉 XP RECALCULATION COMPLETE');
  console.log('='.repeat(50));
  console.log(`📊 Total coaches processed: ${totalProcessed.toLocaleString()}`);
  console.log(`✅ Successfully updated: ${totalUpdated.toLocaleString()}`);
  console.log(`❌ Errors: ${totalErrors.toLocaleString()}`);
  console.log(`⏱️  Total duration: ${totalDuration} seconds`);
  console.log(`🚀 Average rate: ${avgRate} coaches/second`);
  console.log('='.repeat(50));
}

// Run the script
recalculateAllXP().catch(console.error);
