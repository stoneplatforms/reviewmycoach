/**
 * XP Validation Script
 *
 * Validates all coaches by recalculating XP and comparing with stored totalXp field.
 * Reports any discrepancies greater than the threshold.
 *
 * Usage:
 *   npm run validate:xp
 *   BASE_URL=https://reviewmycoach.com npm run validate:xp
 *
 * Environment Variables:
 *   BASE_URL - API base URL (default: http://localhost:3000)
 *   BATCH_SIZE - Coaches per batch (default: 500)
 *   THRESHOLD - Max XP difference to tolerate (default: 5)
 */

import { config } from 'dotenv';
import { writeFileSync } from 'fs';
import { calculateCoachXP, getCoachTier, type XPCalculationInputs } from '../app/lib/xp-calculator';

// Load environment variables from .env.local
config({ path: '.env.local' });

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || '500', 10);
const DELAY_BETWEEN_BATCHES = 2000; // 2 seconds
const XP_DIFFERENCE_THRESHOLD = parseInt(process.env.THRESHOLD || '5', 10);
const OUTPUT_FILE = 'xp-validation-report.csv';
const SUMMARY_FILE = 'xp-validation-summary.json';

interface ValidationResult {
  coachId: string;
  username: string;
  storedXp: number;
  calculatedXp: number;
  difference: number;
  percentDifference: number;
  currentTier: string;
  calculatedTier: string;
  tierMismatch: boolean;
  status: 'PASS' | 'FAIL' | 'ERROR';
  errorMessage?: string;
}

interface ValidationSummary {
  totalCoaches: number;
  passed: number;
  failed: number;
  errors: number;
  maxDifference: number;
  avgDifference: number;
  tierMismatches: number;
  durationSeconds: number;
  passRate: number;
}

/**
 * Validate a batch of coaches
 */
function validateBatch(coaches: any[]): ValidationResult[] {
  const results: ValidationResult[] = [];

  for (const coach of coaches) {
    try {
      // Recalculate XP from coach data
      const inputs: XPCalculationInputs = {
        subscription_tier: Number(coach.subscriptionTier) || 0,
        longevity_platform_years: Number(coach.longevityPlatformYears) || 0,
        career_years: Number(coach.careerYears) || 0,
        courses_created: Number(coach.coursesCreated) || 0,
        jobs_completed: Number(coach.jobsCompleted) || 0,
        review_score: Number(coach.averageRating) || 0,
        consistency_multiplier: Number(coach.consistencyMultiplier) || 1.0,
      };

      const calculatedXp = calculateCoachXP(inputs).total_xp;
      const storedXp = Number(coach.totalXp) || 0;
      const difference = Math.abs(calculatedXp - storedXp);
      const percentDifference = storedXp > 0
        ? (difference / storedXp) * 100
        : 0;

      const calculatedTier = getCoachTier(calculatedXp).tier;
      const currentTier = getCoachTier(storedXp).tier;
      const tierMismatch = calculatedTier !== currentTier;

      const status = difference <= XP_DIFFERENCE_THRESHOLD && !tierMismatch
        ? 'PASS'
        : 'FAIL';

      results.push({
        coachId: coach.id || 'unknown',
        username: coach.username || 'unknown',
        storedXp,
        calculatedXp,
        difference,
        percentDifference,
        currentTier,
        calculatedTier,
        tierMismatch,
        status,
      });

    } catch (error) {
      results.push({
        coachId: coach.id || 'unknown',
        username: coach.username || 'unknown',
        storedXp: 0,
        calculatedXp: 0,
        difference: 0,
        percentDifference: 0,
        currentTier: 'Unknown',
        calculatedTier: 'Unknown',
        tierMismatch: false,
        status: 'ERROR',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return results;
}

/**
 * Fetch coaches from API using the recalculate-xp endpoint in dry-run mode
 */
async function fetchCoachesBatch(offset: number, limit: number): Promise<any[] | null> {
  try {
    const url = `${BASE_URL}/api/coaches/recalculate-xp?offset=${offset}&limit=${limit}&dryRun=true`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      console.error(`❌ HTTP ${response.status}: ${response.statusText}`);
      return null;
    }

    const data = await response.json();

    // The recalculate-xp endpoint processes coaches but doesn't return their data
    // We need to use a different approach - fetch raw coach data
    return null; // Will implement alternative fetch method below
  } catch (error) {
    console.error(`❌ Fetch error:`, error);
    return null;
  }
}

/**
 * Fetch coaches using direct Firebase Data Connect query
 * This requires having the Firebase Data Connect client initialized
 */
async function fetchCoachesDirectly(offset: number, limit: number): Promise<any[]> {
  // Import Firebase Data Connect
  const { initializeApp, getApps } = await import('firebase/app');
  const { getDataConnect } = await import('firebase/data-connect');
  const { getPublicCoaches } = await import('../app/lib/dataconnect/index.cjs.js');

  // Initialize Firebase if not already initialized
  if (getApps().length === 0) {
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };
    initializeApp(firebaseConfig);
  }

  const dataConnect = getDataConnect({
    connector: 'reviewmycoach',
    location: 'us-east4',
    service: 'review-my-coach-service',
  });

  const result = await getPublicCoaches(dataConnect, { offset, limit });

  // Debug: Log first coach to see what fields are returned
  if (offset === 0 && result.data.coaches && result.data.coaches.length > 0) {
    console.log('📋 Sample coach data:', JSON.stringify(result.data.coaches[0], null, 2));
  }

  return result.data.coaches || [];
}

/**
 * Generate summary statistics
 */
function generateSummary(
  results: ValidationResult[],
  duration: number
): ValidationSummary {
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const errors = results.filter(r => r.status === 'ERROR').length;

  const differences = results
    .filter(r => r.status !== 'ERROR')
    .map(r => r.difference);

  const maxDifference = differences.length > 0 ? Math.max(...differences) : 0;
  const avgDifference = differences.length > 0
    ? differences.reduce((a, b) => a + b, 0) / differences.length
    : 0;

  const tierMismatches = results.filter(r => r.tierMismatch).length;
  const passRate = results.length > 0 ? (passed / results.length) * 100 : 0;

  return {
    totalCoaches: results.length,
    passed,
    failed,
    errors,
    maxDifference,
    avgDifference,
    tierMismatches,
    durationSeconds: duration / 1000,
    passRate,
  };
}

/**
 * Print summary to console
 */
function printSummary(summary: ValidationSummary) {
  console.log('\n' + '='.repeat(60));
  console.log('📊 XP VALIDATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Coaches Validated:  ${summary.totalCoaches.toLocaleString()}`);
  console.log(`✅ Passed:                 ${summary.passed.toLocaleString()} (${summary.passRate.toFixed(2)}%)`);
  console.log(`❌ Failed:                 ${summary.failed.toLocaleString()} (${((summary.failed / summary.totalCoaches) * 100).toFixed(2)}%)`);
  console.log(`⚠️  Errors:                 ${summary.errors.toLocaleString()} (${((summary.errors / summary.totalCoaches) * 100).toFixed(2)}%)`);
  console.log(`📈 Max XP Difference:      ${summary.maxDifference.toLocaleString()} XP`);
  console.log(`📊 Avg XP Difference:      ${summary.avgDifference.toFixed(2)} XP`);
  console.log(`🎯 Tier Mismatches:        ${summary.tierMismatches.toLocaleString()}`);
  console.log(`⏱️  Duration:               ${summary.durationSeconds.toFixed(2)}s`);
  console.log(`🚀 Rate:                   ${(summary.totalCoaches / summary.durationSeconds).toFixed(1)} coaches/sec`);
  console.log('='.repeat(60));

  // Success criteria check
  console.log('\n📋 Success Criteria:');
  console.log(`   Pass rate ≥99.5%:       ${summary.passRate >= 99.5 ? '✅' : '❌'} (${summary.passRate.toFixed(2)}%)`);
  console.log(`   Avg diff ≤5 XP:         ${summary.avgDifference <= 5 ? '✅' : '❌'} (${summary.avgDifference.toFixed(2)} XP)`);
  console.log(`   Tier mismatches <0.1%:  ${(summary.tierMismatches / summary.totalCoaches) < 0.001 ? '✅' : '❌'} (${((summary.tierMismatches / summary.totalCoaches) * 100).toFixed(3)}%)`);
  console.log(`   Errors <0.5%:           ${(summary.errors / summary.totalCoaches) < 0.005 ? '✅' : '❌'} (${((summary.errors / summary.totalCoaches) * 100).toFixed(3)}%)`);
}

/**
 * Main validation function
 */
async function validateAllCoaches() {
  console.log('📊 Starting XP Validation for all coaches...');
  console.log(`🔧 Settings:`);
  console.log(`   - API: ${BASE_URL}`);
  console.log(`   - Batch size: ${BATCH_SIZE}`);
  console.log(`   - XP difference threshold: ${XP_DIFFERENCE_THRESHOLD}`);
  console.log(`   - Output file: ${OUTPUT_FILE}`);
  console.log('');

  const startTime = Date.now();
  let offset = 0;
  let allResults: ValidationResult[] = [];
  let batchNumber = 0;
  let hasMore = true;

  // CSV Header
  const csvHeaders = [
    'Status',
    'Coach ID',
    'Username',
    'Stored XP',
    'Calculated XP',
    'Difference',
    'Percent Diff',
    'Current Tier',
    'Calculated Tier',
    'Tier Mismatch',
    'Error Message',
  ].join(',');

  writeFileSync(OUTPUT_FILE, csvHeaders + '\n');

  while (hasMore) {
    batchNumber++;
    console.log(`\n📦 Batch ${batchNumber}: Fetching offset ${offset}...`);

    try {
      // Fetch coaches directly from Firebase Data Connect
      const coaches = await fetchCoachesDirectly(offset, BATCH_SIZE);

      if (coaches.length === 0) {
        console.log('✅ No more coaches to validate');
        break;
      }

      console.log(`🔍 Validating ${coaches.length} coaches...`);

      // Validate batch
      const batchResults = validateBatch(coaches);
      allResults = allResults.concat(batchResults);

      // Write results to CSV (append)
      const csvRows = batchResults.map(r => [
        r.status,
        r.coachId,
        r.username,
        r.storedXp,
        r.calculatedXp,
        r.difference,
        r.percentDifference.toFixed(2),
        `"${r.currentTier}"`, // Quote to handle commas in tier names
        `"${r.calculatedTier}"`,
        r.tierMismatch ? 'YES' : 'NO',
        r.errorMessage || '',
      ].join(','));

      writeFileSync(OUTPUT_FILE, csvRows.join('\n') + '\n', { flag: 'a' });

      // Progress stats
      const passed = batchResults.filter(r => r.status === 'PASS').length;
      const failed = batchResults.filter(r => r.status === 'FAIL').length;
      const errors = batchResults.filter(r => r.status === 'ERROR').length;

      console.log(`   ✅ Passed: ${passed}`);
      console.log(`   ❌ Failed: ${failed}`);
      console.log(`   ⚠️  Errors: ${errors}`);

      offset += coaches.length;
      hasMore = coaches.length === BATCH_SIZE;

      if (hasMore) {
        console.log(`⏳ Waiting ${DELAY_BETWEEN_BATCHES}ms before next batch...`);
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
      }

    } catch (error) {
      console.error(`❌ Batch ${batchNumber} error:`, error);
      console.log(`⏳ Waiting 10 seconds before retry...`);
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }

  // Generate and print summary
  const summary = generateSummary(allResults, Date.now() - startTime);
  printSummary(summary);

  // Save summary to file
  writeFileSync(SUMMARY_FILE, JSON.stringify(summary, null, 2));
  console.log(`\n📄 Summary saved to: ${SUMMARY_FILE}`);
  console.log(`📄 Full report saved to: ${OUTPUT_FILE}`);

  // Exit with appropriate code
  if (summary.passRate >= 99.5) {
    console.log('\n🎉 Validation PASSED! System integrity verified.');
    process.exit(0);
  } else {
    console.log('\n⚠️  Validation FAILED. Review report for discrepancies.');
    process.exit(1);
  }
}

// Run validation
validateAllCoaches().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
