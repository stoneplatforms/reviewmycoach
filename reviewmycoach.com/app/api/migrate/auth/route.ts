import { NextRequest, NextResponse } from 'next/server';

/**
 * Migration API Endpoint: Firebase Auth to Supabase Auth
 * 
 * POST /api/migrate/auth
 * Authorization: Bearer <MIGRATION_SECRET>
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const migrationSecret = process.env.MIGRATION_SECRET || 'change-me-in-production';
  
  if (authHeader !== `Bearer ${migrationSecret}`) {
    return NextResponse.json(
      { error: 'Unauthorized. Provide valid MIGRATION_SECRET in Authorization header.' },
      { status: 401 }
    );
  }

  try {
    const migrationModule = await import('../../../../scripts/migrate-firebase-auth-to-supabase');
    const result = await migrationModule.default();
    
    return NextResponse.json({
      success: true,
      message: 'Firebase Auth to Supabase Auth migration completed successfully',
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

