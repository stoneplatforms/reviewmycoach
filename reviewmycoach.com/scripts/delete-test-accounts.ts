/**
 * Delete test kevinvera accounts
 * Usage: BASE_URL=http://localhost:3000 npx tsx scripts/delete-test-accounts.ts
 */

async function deleteTestAccounts() {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

  console.log('🗑️  Starting deletion of test accounts...\n');
  console.log(`Using base URL: ${baseUrl}\n`);

  try {
    const response = await fetch(`${baseUrl}/api/admin/delete-test-accounts`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    console.log('\n' + '='.repeat(50));
    console.log('📊 Deletion Summary');
    console.log('='.repeat(50));
    console.log(`✅ Successfully deleted: ${result.summary.deleted}`);
    console.log(`❌ Failed: ${result.summary.failed}`);
    console.log(`📋 Total: ${result.summary.total}`);

    if (result.deleted.length > 0) {
      console.log('\nDeleted accounts:');
      result.deleted.forEach((username: string) => {
        console.log(`  ✅ ${username}`);
      });
    }

    if (result.failed.length > 0) {
      console.log('\nFailed deletions:');
      result.failed.forEach((item: any) => {
        console.log(`  ❌ ${item.username}: ${item.error}`);
      });
    }

    console.log('='.repeat(50));
  } catch (error: any) {
    console.error('\n💥 Script failed:', error.message);
    process.exit(1);
  }
}

deleteTestAccounts()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });
