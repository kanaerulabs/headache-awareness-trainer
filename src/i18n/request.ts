import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';

export const locales = ['en', 'ja'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en'; // Default to English if no preference detected

/**
 * Detects preferred locale from browser's Accept-Language header
 * Returns the first supported locale found, or null if none match
 */
function detectBrowserLocale(acceptLanguage: string | null): Locale | null {
  if (!acceptLanguage) return null;

  // Parse Accept-Language header (e.g., "ja,en-US;q=0.9,en;q=0.8")
  const languages = acceptLanguage
    .split(',')
    .map(lang => {
      const [code, priority] = lang.trim().split(';q=');
      return {
        code: code.split('-')[0].toLowerCase(), // Get base language code (e.g., "en" from "en-US")
        priority: priority ? parseFloat(priority) : 1.0,
      };
    })
    .sort((a, b) => b.priority - a.priority);

  // Find first supported locale
  for (const lang of languages) {
    if (locales.includes(lang.code as Locale)) {
      return lang.code as Locale;
    }
  }

  return null;
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const headerStore = await headers();

  // Priority: 1. Cookie (user's explicit choice) > 2. Browser language > 3. Default
  const localeCookie = cookieStore.get('locale')?.value;

  let locale: Locale;

  if (locales.includes(localeCookie as Locale)) {
    // User has explicitly set their preference via cookie
    locale = localeCookie as Locale;
  } else {
    // Detect from browser's Accept-Language header
    const acceptLanguage = headerStore.get('accept-language');
    const browserLocale = detectBrowserLocale(acceptLanguage);
    locale = browserLocale ?? defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
