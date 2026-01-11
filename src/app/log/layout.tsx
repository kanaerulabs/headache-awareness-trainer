import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log Headache | Headache Awareness Trainer",
  description:
    "Quick and easy headache logging with progressive feature unlocking. Track intensity, location, and patterns to build awareness.",
  openGraph: {
    title: "Log Headache | Headache Awareness Trainer",
    description:
      "Quick and easy headache logging with progressive feature unlocking.",
    type: "website",
  },
};

export default function LogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
