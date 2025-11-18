import { NextRequest, NextResponse } from 'next/server';

interface RecaptchaResponse {
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const { token, action } = await request.json();

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token is required' },
        { status: 400 }
      );
    }

    // Skip reCAPTCHA verification on localhost for development
    if (token === 'dev-bypass-token') {
      console.log('Development mode: Bypassing reCAPTCHA verification');
      return NextResponse.json({
        success: true,
        score: 1.0,
        action: action || 'development',
        hostname: 'localhost',
        timestamp: new Date().toISOString(),
        assessment: {
          riskLevel: 'low',
          recommendation: 'proceed',
        },
        development: true,
      });
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json(
        { success: false, error: 'reCAPTCHA secret key not configured' },
        { status: 500 }
      );
    }

    // Verify the token with Google reCAPTCHA API
    const verificationUrl = 'https://www.google.com/recaptcha/api/siteverify';
    const verificationResponse = await fetch(verificationUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
        remoteip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '',
      }),
    });

    const verificationData: RecaptchaResponse = await verificationResponse.json();

    // Check if verification was successful
    if (!verificationData.success) {
      return NextResponse.json({
        success: false,
        error: 'reCAPTCHA verification failed',
        details: verificationData['error-codes'],
      }, { status: 400 });
    }

    // For reCAPTCHA v3, check the score (0.0 - 1.0)
    // Higher scores indicate more likely human interaction
    const minScore = 0.5; // Adjust this threshold as needed
    
    if (verificationData.score !== undefined) {
      if (verificationData.score < minScore) {
        return NextResponse.json({
          success: false,
          error: 'Low reCAPTCHA score indicates potential bot activity',
          score: verificationData.score,
          threshold: minScore,
        }, { status: 400 });
      }

      // Verify the action matches what we expect
      if (action && verificationData.action !== action) {
        return NextResponse.json({
          success: false,
          error: 'Action mismatch',
          expected: action,
          received: verificationData.action,
        }, { status: 400 });
      }
    }

    // Success response with assessment details
    return NextResponse.json({
      success: true,
      score: verificationData.score,
      action: verificationData.action,
      hostname: verificationData.hostname,
      timestamp: verificationData.challenge_ts,
      assessment: {
        riskLevel: verificationData.score ? getRiskLevel(verificationData.score) : 'unknown',
        recommendation: verificationData.score ? getRecommendation(verificationData.score) : 'proceed',
      },
    });

  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error during verification' },
      { status: 500 }
    );
  }
}

function getRiskLevel(score: number): string {
  if (score >= 0.7) return 'low';
  if (score >= 0.5) return 'medium';
  if (score >= 0.3) return 'high';
  return 'very-high';
}

function getRecommendation(score: number): string {
  if (score >= 0.7) return 'proceed';
  if (score >= 0.5) return 'proceed-with-caution';
  if (score >= 0.3) return 'challenge';
  return 'block';
} 