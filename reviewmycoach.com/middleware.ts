import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Verify Firebase ID token (Edge-compatible - uses fetch to call our API)
async function verifyFirebaseToken(token: string, baseUrl: string): Promise<{ uid: string; email?: string } | null> {
  try {
    // Call our API route to verify the token (since we can't use Firebase Admin directly in Edge)
    const response = await fetch(`${baseUrl}/api/auth/verify-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.valid ? { uid: data.uid, email: data.email } : null;
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    return null;
  }
}

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/signin',
  '/signup',
  '/verify-email',
  '/about',
  '/privacy',
  '/terms',
  '/search',
  '/coaches',
  '/classes',
  '/coach',
];

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/admin',
  '/profile',
  '/onboarding',
  '/subscription',
  '/cards-marketplace',
];

// Routes that require specific roles
const coachOnlyRoutes = ['/dashboard/coach'];
const adminOnlyRoutes = ['/admin'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for API routes, static files, and Next.js internals
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/public')
  ) {
    return NextResponse.next();
  }

  // Check if route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  // Check if route requires authentication
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  // Check if route is coach-only
  const isCoachOnlyRoute = coachOnlyRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  // Check if route is admin-only
  const isAdminOnlyRoute = adminOnlyRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  // Get Firebase token from cookie
  const token = request.cookies.get('firebase-token')?.value;

  // If accessing a protected route without a token, redirect to signin
  if (isProtectedRoute && !token) {
    const signInUrl = new URL('/signin', request.url);
    signInUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // If token exists, verify it
  if (token) {
    const baseUrl = request.nextUrl.origin;
    const decodedToken = await verifyFirebaseToken(token, baseUrl);
    
    if (decodedToken) {
      // Token is valid - check user role via internal API call
      try {
        const roleResponse = await fetch(`${baseUrl}/api/auth/user-role?userId=${decodedToken.uid}`, {
          headers: {
            'Cookie': request.headers.get('cookie') || '',
          },
        });

        if (roleResponse.ok) {
          const userData = await roleResponse.json();
          const userRole = userData?.role || null;
          const onboardingCompleted = userData?.onboardingCompleted || false;
          const userEmail = decodedToken.email || userData?.email || null;
          const userId = decodedToken.uid;

          // Redirect away from onboarding if already completed
          if (onboardingCompleted && pathname === '/onboarding') {
            if (userRole === 'coach') {
              return NextResponse.redirect(new URL('/dashboard/coach', request.url));
            }
            return NextResponse.redirect(new URL('/dashboard', request.url));
          }

          // Redirect to onboarding if not completed (except if already on onboarding page)
          if (!onboardingCompleted && pathname !== '/onboarding' && isProtectedRoute) {
            const onboardingUrl = new URL('/onboarding', request.url);
            // Preserve user context in redirect URL
            if (userId) {
              onboardingUrl.searchParams.set('userId', userId);
            }
            if (userEmail) {
              onboardingUrl.searchParams.set('email', userEmail);
            }
            return NextResponse.redirect(onboardingUrl);
          }
          
          // Allow access to onboarding page if onboarding not completed (prevents redirect loops)
          if (pathname === '/onboarding' && !onboardingCompleted) {
            return NextResponse.next();
          }

          // Handle coach-only routes
          if (isCoachOnlyRoute) {
            if (userRole !== 'coach' && userRole !== 'admin') {
              // Non-coaches trying to access coach dashboard -> redirect to user dashboard
              return NextResponse.redirect(new URL('/dashboard', request.url));
            }
          }

          // Handle admin-only routes
          if (isAdminOnlyRoute) {
            if (userRole !== 'admin') {
              // Non-admins trying to access admin -> redirect to appropriate dashboard
              if (userRole === 'coach') {
                return NextResponse.redirect(new URL('/dashboard/coach', request.url));
              }
              return NextResponse.redirect(new URL('/dashboard', request.url));
            }
          }

          // Handle dashboard routing based on role
          if (pathname === '/dashboard') {
            if (userRole === 'coach' && userRole !== 'admin') {
              // Coaches accessing /dashboard -> redirect to coach dashboard
              return NextResponse.redirect(new URL('/dashboard/coach', request.url));
            }
          }

          // Redirect authenticated users away from signin/signup
          if (pathname === '/signin' || pathname === '/signup') {
            if (userRole === 'coach' && userRole !== 'admin') {
              return NextResponse.redirect(new URL('/dashboard/coach', request.url));
            }
            return NextResponse.redirect(new URL('/dashboard', request.url));
          }
        }
      } catch (error) {
        // If API call fails, allow request through (fallback to client-side auth)
        console.error('Error fetching user role in middleware:', error);
      }
    } else {
      // Token is invalid or expired, clear it and redirect to signin if accessing protected route
      if (isProtectedRoute) {
        const response = NextResponse.redirect(new URL('/signin', request.url));
        response.cookies.delete('firebase-token');
        return response;
      }
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
