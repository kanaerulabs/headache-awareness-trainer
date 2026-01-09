import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BottomNav, BottomNavSpacer } from "@/components/organisms/BottomNav";
import { InstallPrompt } from "@/components/organisms/InstallPrompt";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icon-192x192.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={`${inter.className} pt-safe`}>
        <main className="min-h-screen-safe">
          {children}
        </main>
        <BottomNavSpacer />
        <BottomNav />
        <InstallPrompt />
      </body>
    </html>
  );
}
