import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * NextAuth middleware for route protection
 *
 * Protected routes require authentication:
 * - /dashboard
 * - /insights
 * - /checkin
 * - /log
 * - /learn
 * - /settings
 *
 * Public routes (no auth required):
 * - /login
 * - /onboarding
 * - /api/* (handled by API routes themselves)
 * - /_next/* (Next.js internals)
 * - Static files
 */
export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // Protected routes that require authentication
  const protectedRoutes = [
    "/dashboard",
    "/insights",
    "/checkin",
    "/log",
    "/learn",
    "/settings",
  ];

  // Check if current path is a protected route
  const isProtectedRoute = protectedRoutes.some(
    (route) =>
      nextUrl.pathname === route || nextUrl.pathname.startsWith(`${route}/`),
  );

  // Redirect unauthenticated users to login
  if (isProtectedRoute && !isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect logged-in users away from login page to dashboard
  if (nextUrl.pathname === "/login" && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (images, etc.)
     * - api routes (handled by API itself)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$|api/).*)",
  ],
};
