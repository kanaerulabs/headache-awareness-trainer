import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Headache Awareness Trainer",
  description:
    "View your headache tracking insights, streak, trends, and recent activity.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
