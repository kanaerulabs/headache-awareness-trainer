import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['en', 'ja'];
const defaultLocale = 'en';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname.startsWith('/sw.js') ||
    pathname.startsWith('/workbox-')
  ) {
    return NextResponse.next();
  }

  // Check if locale cookie exists
  const localeCookie = request.cookies.get('locale')?.value;

  // If no locale cookie, try to detect from Accept-Language header
  if (!localeCookie) {
    const acceptLanguage = request.headers.get('Accept-Language') || '';
    const detectedLocale = acceptLanguage.includes('ja') ? 'ja' : defaultLocale;

    const response = NextResponse.next();
    response.cookies.set('locale', detectedLocale, {
      maxAge: 365 * 24 * 60 * 60, // 1 year
      path: '/',
    });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
