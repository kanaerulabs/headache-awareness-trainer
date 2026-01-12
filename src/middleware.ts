/**
 * Next.js Middleware for route protection
 * 
 * This middleware runs before page requests and protects routes that require authentication.
 * It uses NextAuth.js session management to check if the user is authenticated.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

/**
 * Protected routes that require authentication
 */
const protectedRoutes = [
  '/',
  '/dashboard',
  '/profile',
  '/settings',
];

/**
 * Public routes that don't require authentication
 */
const publicRoutes = [
  '/login',
  '/api/auth',
];

/**
 * Middleware function to protect routes
 */
export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check if route requires authentication
  const isProtectedRoute = protectedRoutes.some((route) => 
    pathname === route || pathname.startsWith(`${route}/`)
  );

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Check authentication
  const session = await auth();

  if (!session) {
    // Redirect to login if not authenticated
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

/**
 * Matcher configuration to specify which routes run middleware
 * Excludes static files, images, and API routes (except /api/auth)
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public files (images, fonts, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
