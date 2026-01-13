/**
 * Check if kevinvera test accounts exist in Firestore via API endpoint
 * Usage: BASE_URL=http://localhost:3001 npx tsx scripts/check-firestore-via-api.ts
 */

async function checkFirestoreViaAPI() {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3001';

  console.log('🔍 Checking Firestore for kevinvera test accounts via API...\n');
  console.log(`Using base URL: ${baseUrl}\n`);

  const TEST_ACCOUNTS = ['kevinvera1', 'kevinvera2', 'kevinvera3', 'kevinvera4', 'kevinvera5', 'kevinvera6', 'kevinvera7'];

  // The delete endpoint will tell us what it finds
  try {
    const response = await fetch(`${baseUrl}/api/admin/delete-test-accounts`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    console.log('\n' + '='.repeat(50));
    console.log('📊 Firestore Check Results');
    console.log('='.repeat(50));
    
    console.log('\nDetails by account:');
    result.details.forEach((detail: any) => {
      const status = [];
      if (detail.auth) status.push('Auth');
      if (detail.firestore) status.push('Firestore');
      if (detail.dataconnect) status.push('DataConnect');
      
      if (status.length > 0) {
        console.log(`  ❌ ${detail.username}: Found in ${status.join(', ')}`);
      } else {
        console.log(`  ✅ ${detail.username}: Not found anywhere`);
      }
    });

    console.log('\n' + '='.repeat(50));
    console.log(`Summary: ${result.summary.deleted} deleted, ${result.summary.failed} not found`);
    console.log('='.repeat(50));

  } catch (error: any) {
    console.error('\n💥 Script failed:', error.message);
    process.exit(1);
  }
}

checkFirestoreViaAPI()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });
