import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * NextAuth middleware for route protection
 *
 * Public routes (no auth required):
 * - /login
 *
 * All other routes require authentication:
 * - / (home)
 * - /onboarding
 * - /dashboard
 * - /insights
 * - /checkin
 * - /log
 * - /learn
 * - /settings
 */
export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // Only /login is public - everything else requires auth
  const isLoginPage = nextUrl.pathname === "/login";

  // Redirect unauthenticated users to login (except on login page)
  if (!isLoggedIn && !isLoginPage) {
    const loginUrl = new URL("/login", nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect logged-in users away from login page to dashboard
  if (isLoginPage && isLoggedIn) {
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
