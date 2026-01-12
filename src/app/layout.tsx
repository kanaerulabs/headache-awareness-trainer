import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import {
  BottomNav,
  BottomNavSpacer,
  MainContentWrapper,
} from "@/components/organisms/BottomNav";
import { InstallPrompt } from "@/components/organisms/InstallPrompt";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  title: "Headache Awareness Trainer",
  description: "Learn to listen to your body before the headache speaks",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Headache Trainer",
  },
  icons: {
    icon: "/icon-192x192.svg",
    apple: "/icon-192x192.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <link rel="apple-touch-icon" href="/icon-192x192.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('settings-storage');
                  if (stored) {
                    var settings = JSON.parse(stored);
                    var theme = settings.state && settings.state.theme;
                    if (theme === 'dark') {
                      document.documentElement.classList.add('dark');
                    } else if (theme === 'system') {
                      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                        document.documentElement.classList.add('dark');
                      }
                    }
                  } else {
                    // Default to system preference for first-time users
                    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                      document.documentElement.classList.add('dark');
                    }
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.className} pt-safe`}>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <BottomNav />
            <MainContentWrapper>
              <main className="min-h-screen-safe">
                {children}
              </main>
              <BottomNavSpacer />
            </MainContentWrapper>
            <InstallPrompt />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
