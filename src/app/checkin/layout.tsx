import type { Metadata } from "next";

/**
 * SEO Metadata for Check-in Page
 */
export const metadata: Metadata = {
  title: "Quick Check-in | Headache Awareness Trainer",
  description:
    "Fast daily check-ins to track mood, body tension, and sleep quality even on good days. Complete in under 15 seconds.",
  openGraph: {
    title: "Quick Check-in | Headache Awareness Trainer",
    description:
      "Track your daily wellness factors to identify headache patterns.",
  },
};

export default function CheckinLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
