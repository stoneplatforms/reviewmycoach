import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import { supabaseAdmin } from '../../../lib/supabase';

/**
 * POST /api/setup/schema
 * Initialize database schema
 * Note: Supabase requires SQL to be executed via Dashboard or Management API
 * This endpoint provides instructions and can be extended with Management API integration
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const setupSecret = process.env.SETUP_SECRET || 'change-me-in-production';
    
    // Simple auth check (use proper auth in production)
    if (authHeader !== `Bearer ${setupSecret}`) {
      return NextResponse.json(
        { 
          error: 'Unauthorized',
          message: 'Provide SETUP_SECRET in Authorization header',
          instructions: 'Run: curl -X POST http://localhost:3000/api/setup/schema -H "Authorization: Bearer your-secret"'
        },
        { status: 401 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase admin not configured' },
        { status: 500 }
      );
    }

    // Read schema file
    const schemaPath = join(process.cwd(), 'scripts', 'supabase-schema.sql');
    let schemaSQL: string;
    
    try {
      schemaSQL = readFileSync(schemaPath, 'utf-8');
    } catch (error) {
      return NextResponse.json(
        { 
          error: 'Schema file not found',
          path: schemaPath,
          message: 'Please ensure scripts/supabase-schema.sql exists'
        },
        { status: 404 }
      );
    }

    // Check which tables exist
    const tablesToCheck = ['users', 'coaches', 'reviews', 'classes', 'services'];
    const existingTables: string[] = [];
    const missingTables: string[] = [];

    for (const table of tablesToCheck) {
      try {
        const { error } = await supabaseAdmin
          .from(table)
          .select('*')
          .limit(1);
        
        if (error && error.code === 'PGRST116') {
          missingTables.push(table);
        } else {
          existingTables.push(table);
        }
      } catch {
        missingTables.push(table);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Schema check complete',
      existingTables,
      missingTables,
      instructions: missingTables.length > 0 ? {
        step1: 'Go to Supabase Dashboard → SQL Editor',
        step2: 'Copy the SQL from scripts/supabase-schema.sql',
        step3: 'Paste and execute in SQL Editor',
        step4: 'Or use Supabase CLI: supabase db reset',
        schemaFile: schemaPath,
        sqlPreview: schemaSQL.substring(0, 500) + '...',
      } : {
        message: 'All tables exist!',
      },
    });

  } catch (error: any) {
    console.error('Schema setup error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check schema',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/setup/schema
 * Check schema status
 */
export async function GET(request: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: 'Supabase admin not configured' },
      { status: 500 }
    );
  }

  const tablesToCheck = [
    'users', 'coaches', 'reviews', 'classes', 'services',
    'jobs', 'job_applications', 'bookings', 'conversations',
    'messages', 'cards', 'user_cards', 'reports', 'sports',
    'tags', 'bookmarks', 'identity_verifications', 'notifications', 'analytics'
  ];

  const status: Record<string, boolean> = {};

  for (const table of tablesToCheck) {
    try {
      const { error } = await supabaseAdmin
        .from(table)
        .select('*')
        .limit(1);
      
      status[table] = !error || error.code !== 'PGRST116';
    } catch {
      status[table] = false;
    }
  }

  const existing = Object.entries(status).filter(([, exists]) => exists).map(([table]) => table);
  const missing = Object.entries(status).filter(([, exists]) => !exists).map(([table]) => table);

  return NextResponse.json({
    existing,
    missing,
    allTablesExist: missing.length === 0,
    instructions: missing.length > 0 ? {
      message: 'Some tables are missing. Run schema setup:',
      command: 'curl -X POST http://localhost:3000/api/setup/schema -H "Authorization: Bearer your-setup-secret"',
      or: 'Go to Supabase Dashboard → SQL Editor → Run scripts/supabase-schema.sql',
    } : {
      message: 'All tables exist! ✅',
    },
  });
}

