import type { Metadata } from "next";
import { LoginForm } from "@/components/organisms/LoginForm";

/**
 * Metadata for the login page (SEO)
 */
export const metadata: Metadata = {
  title: "Sign In | Headache Awareness Trainer",
  description:
    "Sign in to Headache Awareness Trainer with your Google account to track and manage your headaches.",
  openGraph: {
    title: "Sign In | Headache Awareness Trainer",
    description:
      "Sign in to Headache Awareness Trainer with your Google account",
    type: "website",
  },
};

/**
 * Login page - Server Component
 *
 * This page handles user authentication via Google OAuth.
 * The actual authentication logic is in the LoginForm client component.
 */
export default function LoginPage() {
  return (
    <main
      role="main"
      className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-primary/5 to-primary/10"
      data-testid="login-page"
    >
      <LoginForm />
    </main>
  );
}
