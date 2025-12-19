import { NextRequest, NextResponse } from 'next/server';

/**
 * Migration API Endpoint
 * 
 * This endpoint triggers the Firestore to PostgreSQL migration.
 * 
 * Usage:
 *   POST /api/migrate
 *   Authorization: Bearer <MIGRATION_SECRET>
 * 
 * Set MIGRATION_SECRET in your environment variables for security.
 */
export async function POST(request: NextRequest) {
  // Security check
  const authHeader = request.headers.get('authorization');
  const migrationSecret = process.env.MIGRATION_SECRET || 'change-me-in-production';
  
  if (authHeader !== `Bearer ${migrationSecret}`) {
    return NextResponse.json(
      { error: 'Unauthorized. Provide valid MIGRATION_SECRET in Authorization header.' },
      { status: 401 }
    );
  }

  try {
    // Dynamically import the migration script
    const migrationModule = await import('../../../scripts/migrate-firestore-to-postgres');
    
    // Run migration
    const result = await migrationModule.default();
    
    return NextResponse.json({
      success: true,
      message: 'Migration completed successfully',
      result,
    });
  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check migration status
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const migrationSecret = process.env.MIGRATION_SECRET || 'change-me-in-production';
  
  if (authHeader !== `Bearer ${migrationSecret}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { sql } = await import('@vercel/postgres');
    
    // Check if tables exist
    const tablesResult = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    const tables = tablesResult.rows.map(row => row.table_name);
    
    // Get document counts for each table
    const counts: Record<string, number> = {};
    for (const table of tables) {
      try {
        const countResult = await sql`SELECT COUNT(*) as count FROM ${sql(table)}`;
        counts[table] = parseInt(countResult.rows[0].count);
      } catch (error) {
        counts[table] = 0;
      }
    }
    
    return NextResponse.json({
      status: 'ready',
      tables,
      counts,
      totalDocuments: Object.values(counts).reduce((a, b) => a + b, 0),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

