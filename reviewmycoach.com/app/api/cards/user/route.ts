import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/cards/user?userId=xxx
 * Temporarily returns empty - tier cards stored in memory for now
 */
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      cards: [],
      activeCard: null,
    });
  } catch (error) {
    console.error('Error fetching user cards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user cards' },
      { status: 500 }
    );
  }
}

