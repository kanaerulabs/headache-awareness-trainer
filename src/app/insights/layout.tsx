import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Insights & Patterns | Headache Awareness Trainer",
  description:
    "Discover patterns and triggers in your headache journey. View calendar insights, correlation analysis, and personalized recommendations based on your data.",
  keywords: [
    "headache patterns",
    "headache triggers",
    "correlation analysis",
    "headache insights",
    "pattern recognition",
    "health tracking",
  ],
  openGraph: {
    title: "Insights & Patterns | Headache Awareness Trainer",
    description:
      "Discover patterns and triggers in your headache journey with data-driven insights.",
    type: "website",
  },
};

export default function InsightsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
