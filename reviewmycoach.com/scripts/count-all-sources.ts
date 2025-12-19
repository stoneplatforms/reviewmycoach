/**
 * Count coaches in all data sources
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.local
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function countSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('⚠️  Supabase credentials not found');
    return 0;
  }
  
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/coaches?select=count`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'count=exact'
      }
    });
    
    const countHeader = response.headers.get('content-range');
    const count = countHeader ? parseInt(countHeader.split('/')[1]) : 0;
    
    return count;
  } catch (error) {
    console.error('Error querying Supabase:', error);
    return 0;
  }
}

async function countDataConnect() {
  try {
    // Use the count API endpoint
    const response = await fetch('http://localhost:3001/api/search/coaches/count');
    const data = await response.json();
    return data.total || 0;
  } catch (error) {
    console.error('Error counting Data Connect coaches:', error);
    return 0;
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  COUNTING COACHES IN ALL DATA SOURCES                      ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  console.log('📊 Counting...\n');
  
  const [supabaseCount, dataConnectCount] = await Promise.all([
    countSupabase(),
    countDataConnect()
  ]);
  
  console.log('='.repeat(60));
  console.log('RESULTS:');
  console.log('='.repeat(60));
  console.log(`Supabase:              ${supabaseCount.toLocaleString()} coaches`);
  console.log(`Firebase Data Connect: ${dataConnectCount.toLocaleString()} coaches`);
  console.log('='.repeat(60));
  
  console.log('\n💡 ANALYSIS:\n');
  
  if (supabaseCount > 20000 && dataConnectCount < 5000) {
    console.log('⚠️  COACHES HAVE NOT BEEN FULLY MIGRATED!');
    console.log(`\n   Supabase has ${supabaseCount.toLocaleString()} coaches`);
    console.log(`   Data Connect only has ${dataConnectCount.toLocaleString()} coaches`);
    console.log(`   Missing: ${(supabaseCount - dataConnectCount).toLocaleString()} coaches`);
    console.log('\n📝 ACTION NEEDED:');
    console.log('   You need to run a full migration from Supabase to Data Connect');
    console.log('   to transfer all 29k+ coaches.\n');
  } else if (dataConnectCount > supabaseCount) {
    console.log('✅ Data Connect has more coaches than Supabase');
    console.log('   Migration appears complete!\n');
  } else {
    console.log(`⚠️  Some coaches may not be migrated yet.`);
    console.log(`   Difference: ${Math.abs(supabaseCount - dataConnectCount).toLocaleString()} coaches\n`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

