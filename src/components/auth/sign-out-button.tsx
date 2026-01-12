/**
 * SignOutButton Component
 *
 * Button that triggers sign-out via NextAuth.
 * Pure presentational component with accessibility features.
 */

"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface SignOutButtonProps {
  /**
   * Callback URL to redirect to after successful sign-out
   * @default '/' - redirects to home page
   */
  callbackUrl?: string;

  /**
   * Additional CSS classes to apply to the button
   */
  className?: string;

  /**
   * Button variant
   * @default 'outline'
   */
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "destructive";

  /**
   * Button size
   * @default 'default'
   */
  size?: "default" | "sm" | "lg" | "icon";

  /**
   * Custom button text
   * @default 'Sign out'
   */
  children?: React.ReactNode;
}

/**
 * SignOutButton Component
 *
 * Provides a button to trigger sign-out.
 * Handles loading state during sign-out process.
 *
 * @example
 * ```tsx
 * <SignOutButton callbackUrl="/login" />
 * <SignOutButton variant="destructive">Log Out</SignOutButton>
 * ```
 */
export function SignOutButton({
  callbackUrl = "/",
  className,
  variant = "outline",
  size = "default",
  children = "Sign out",
}: SignOutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      // Trigger NextAuth sign-out
      await signOut({ callbackUrl });
    } catch (error) {
      // Error handling is managed by NextAuth
      console.error("Sign out error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSignOut}
      disabled={isLoading}
      variant={variant}
      size={size}
      className={cn(className)}
      data-testid="sign-out-button"
      aria-label={isLoading ? "Signing out..." : "Sign out"}
      aria-busy={isLoading}
    >
      {isLoading ? (
        <>
          <span
            className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]"
            role="status"
            aria-label="Loading"
          />
          <span>Signing out...</span>
        </>
      ) : (
        children
      )}
    </Button>
  );
}
