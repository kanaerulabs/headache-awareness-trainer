"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Brain, Loader2 } from "lucide-react";

/**
 * LoginForm - Client Component
 *
 * Handles Google OAuth authentication using NextAuth.js
 *
 * Features:
 * - Google OAuth sign-in
 * - Loading state during authentication
 * - Error handling and display
 * - Automatic redirect if already authenticated
 * - Accessible with ARIA labels and keyboard navigation
 */
export function LoginForm() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Redirect to home if already authenticated
   */
  useEffect(() => {
    if (status === "authenticated" && session) {
      router.push("/");
    }
  }, [status, session, router]);

  /**
   * Handle Google sign-in
   */
  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Trigger NextAuth Google OAuth flow
      // Note: signIn with redirect:true never returns (redirects browser)
      await signIn("google", {
        callbackUrl: "/",
        redirect: true,
      });
    } catch (err) {
      console.error("Sign in error:", err);
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  // Show nothing while checking authentication status
  if (status === "loading") {
    return (
      <div
        className="flex items-center justify-center"
        data-testid="auth-loading"
      >
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If already authenticated, show redirect message
  if (status === "authenticated") {
    return (
      <div
        className="text-center text-muted-foreground"
        data-testid="already-authenticated"
      >
        <p>Already signed in. Redirecting...</p>
      </div>
    );
  }

  return (
    <div
      className="w-full max-w-md space-y-8 rounded-lg border bg-card p-8 shadow-lg"
      data-testid="login-form"
    >
      {/* App Branding */}
      <div className="text-center space-y-4" data-testid="login-header">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary">
            <Brain className="h-8 w-8 text-primary-foreground" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            Headache Awareness Trainer
          </h1>
          <p className="text-sm text-muted-foreground">
            Learn to listen to your body before the headache speaks
          </p>
        </div>
      </div>

      {/* Sign In Section */}
      <div className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-center">Welcome</h2>
          <p className="text-sm text-muted-foreground text-center">
            Sign in with your Google account to get started
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div
            className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive"
            role="alert"
            data-testid="error-message"
          >
            {error}
          </div>
        )}

        {/* Google Sign In Button */}
        <Button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          size="lg"
          className="w-full"
          data-testid="google-signin-button"
          aria-label="Sign in with Google"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Sign in with Google</span>
            </>
          )}
        </Button>

        {/* Privacy Notice */}
        <p className="text-xs text-muted-foreground text-center">
          By signing in, you agree to our terms of service and privacy policy.
          Your data is stored securely and never shared with third parties.
        </p>
      </div>
    </div>
  );
}
