import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/cards/marketplace
 * Temporarily returns empty - marketplace coming soon
 */
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      cards: [],
    });
  } catch (error) {
    console.error('Error fetching marketplace cards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch marketplace cards' },
      { status: 500 }
    );
  }
}

