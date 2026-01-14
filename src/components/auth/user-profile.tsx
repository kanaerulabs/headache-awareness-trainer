/**
 * UserProfile Component
 *
 * Display authenticated user information with profile picture, name, email, and sign-out button.
 * Pure presentational component using auth store hooks.
 */

"use client";

import { useEffect } from "react";
import { useUser, useIsAuthenticated, useAuthLoading } from "@/interface-adapters/store/auth";
import { UserAvatar } from "./user-avatar";
import { SignOutButton } from "./sign-out-button";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export interface UserProfileProps {
  /**
   * Additional CSS classes to apply to the container
   */
  className?: string;

  /**
   * Whether to show sign-out button
   * @default true
   */
  showSignOut?: boolean;

  /**
   * Callback URL for sign-out
   * @default '/'
   */
  callbackUrl?: string;

  /**
   * Callback fired when component detects unauthenticated state
   * Useful for redirecting or showing a login prompt
   */
  onUnauthenticated?: () => void;
}

/**
 * Loading Skeleton for UserProfile
 *
 * Displays skeleton placeholders while user data is loading
 */
function UserProfileSkeleton() {
  return (
    <div
      className="flex items-center gap-4"
      data-testid="user-profile-skeleton"
      role="status"
      aria-label="Loading user profile"
    >
      <Skeleton className="h-12 w-12 rounded-full" />

      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
    </div>
  );
}

/**
 * UserProfile Component
 *
 * Displays authenticated user's profile information:
 * - Profile picture from Google (or initials fallback)
 * - User's display name
 * - User's email address
 * - Sign-out button (optional)
 *
 * Handles three states:
 * 1. Loading - Shows skeleton placeholders
 * 2. Authenticated - Shows full user profile
 * 3. Unauthenticated - Shows nothing (calls onUnauthenticated callback if provided)
 *
 * @example
 * ```tsx
 * // Basic usage
 * <UserProfile />
 *
 * // Without sign-out button
 * <UserProfile showSignOut={false} />
 *
 * // With callback for unauthenticated state
 * <UserProfile onUnauthenticated={() => router.push('/login')} />
 * ```
 */
export function UserProfile({
  className,
  showSignOut = true,
  callbackUrl = "/",
  onUnauthenticated,
}: UserProfileProps) {
  const user = useUser();
  const isAuthenticated = useIsAuthenticated();
  const isLoading = useAuthLoading();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user) && onUnauthenticated) {
      onUnauthenticated();
    }
  }, [isLoading, isAuthenticated, user, onUnauthenticated]);

  if (isLoading) {
    return (
      <div className={cn("w-full", className)}>
        <UserProfileSkeleton />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-3 rounded-lg border border-border bg-card p-3",
        "sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-4",
        "md:p-5",
        "shadow-sm",
        className,
      )}
      data-testid="user-profile"
      role="region"
      aria-label="User profile"
    >
      <div className="flex items-center gap-3 sm:gap-4">
        <UserAvatar user={user} size="lg" showBorder />

        <div className="flex flex-col gap-1">
          <h2
            className="text-base font-semibold leading-none text-foreground"
            data-testid="user-profile-name"
          >
            {user.getDisplayName()}
          </h2>
          <p
            className="text-sm text-muted-foreground"
            data-testid="user-profile-email"
          >
            {user.email}
          </p>
          {user.isEmailVerified() && (
            <span
              className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400"
              data-testid="user-profile-verified-badge"
              role="status"
              aria-label="Email verified"
            >
              <svg
                className="h-3 w-3"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Verified
            </span>
          )}
        </div>
      </div>

      {showSignOut && (
        <div className="w-full sm:w-auto">
          <SignOutButton
            callbackUrl={callbackUrl}
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
          />
        </div>
      )}
    </div>
  );
}
