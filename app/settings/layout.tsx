import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings | Headache Awareness Trainer",
  description:
    "Customize your headache tracking experience. Configure reminders, tracking preferences, display settings, and manage your data.",
  keywords: [
    "headache settings",
    "tracking preferences",
    "reminder configuration",
    "data management",
    "customization",
  ],
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
