import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { verifyFirebaseToken } from '../../../../../lib/firebase-admin-server';

/**
 * GET /api/cards/tier/images/[tier]
 * Serves tier card images publicly but with protections
 * - Prevents direct file downloads
 * - Blocks hotlinking from external sites
 * - Can only be loaded through your website
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tier: string }> }
) {
  try {
    const { tier } = await params;

    // Validate tier number
    const tierNumber = parseInt(tier);
    if (isNaN(tierNumber) || tierNumber < 1 || tierNumber > 5) {
      return NextResponse.json(
        { error: 'Invalid tier number. Must be 1-5.' },
        { status: 400 }
      );
    }

    // Anti-hotlinking protection (optional but recommended)
    // Block requests from external websites trying to embed your images
    const referer = request.headers.get('referer');
    const host = request.headers.get('host');
    
    // In development, allow localhost
    const isDev = process.env.NODE_ENV === 'development';
    
    if (!isDev && referer && host) {
      const refererUrl = new URL(referer);
      const allowedHosts = [
        host,
        'reviewmycoach.com',
        'www.reviewmycoach.com',
        'localhost',
      ];
      
      if (!allowedHosts.some(allowedHost => refererUrl.host.includes(allowedHost))) {
        return NextResponse.json(
          { error: 'Hotlinking not allowed' },
          { status: 403 }
        );
      }
    }

    // Read the image file from private assets folder
    const imagePath = join(process.cwd(), 'assets', 'tier-cards', `tier-${tierNumber}.png`);
    
    try {
      const imageBuffer = await readFile(imagePath);
      
      // Return the image with proper headers
      return new NextResponse(imageBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
          'X-Content-Type-Options': 'nosniff',
          // Prevent downloading (display only)
          'Content-Disposition': 'inline; filename="tier-card.png"',
          // Security headers
          'X-Frame-Options': 'SAMEORIGIN', // Prevent embedding in iframes from other sites
          'Referrer-Policy': 'strict-origin-when-cross-origin',
        },
      });
    } catch (error) {
      console.error(`Tier card image not found: ${imagePath}`);
      return NextResponse.json(
        { error: `Tier card ${tierNumber} image not found` },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error serving tier card image:', error);
    return NextResponse.json(
      { error: 'Failed to serve tier card image' },
      { status: 500 }
    );
  }
}

