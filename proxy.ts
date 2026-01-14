/**
 * Next.js Proxy for route protection and locale detection (Next.js 16+)
 *
 * This proxy runs before page requests to:
 * 1. Protect routes that require authentication (redirect to login if not authenticated)
 * 2. Detect and set user's preferred locale via cookie
 *
 * Note: In Next.js 16, "middleware" was renamed to "proxy" for clarity.
 * See: https://nextjs.org/docs/messages/middleware-to-proxy
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

/**
 * Public routes that don't require authentication
 * ALL other routes are protected by default
 */
const publicRoutes = ["/login", "/api/auth"];

const defaultLocale = "ja"; // Default to Japanese for primary target audience

/**
 * Proxy function for auth protection and locale detection
 */
export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip for static files, service worker, and workbox files
  if (
    pathname.startsWith("/_next") ||
    pathname.includes(".") ||
    pathname.startsWith("/sw.js") ||
    pathname.startsWith("/workbox-")
  ) {
    return NextResponse.next();
  }

  // Allow public routes without auth check
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return handleLocale(request);
  }

  // ALL other routes require authentication
  const session = await auth();

  if (!session) {
    // Redirect to login if not authenticated
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // User is authenticated, handle locale and continue
  return handleLocale(request);
}

/**
 * Handle locale detection and cookie setting
 */
function handleLocale(request: NextRequest): NextResponse {
  const localeCookie = request.cookies.get("locale")?.value;

  // If no locale cookie, try to detect from Accept-Language header
  if (!localeCookie) {
    const acceptLanguage = request.headers.get("Accept-Language") || "";
    const detectedLocale = acceptLanguage.includes("ja") ? "ja" : defaultLocale;

    const response = NextResponse.next();
    response.cookies.set("locale", detectedLocale, {
      maxAge: 365 * 24 * 60 * 60, // 1 year
      path: "/",
    });
    return response;
  }

  return NextResponse.next();
}

/**
 * Matcher configuration to specify which routes run proxy
 * Excludes static files, images, and Next.js internals
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
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
