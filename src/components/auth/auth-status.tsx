/**
 * AuthStatus Component
 *
 * Display current authentication status with user info or sign-in prompt.
 * Composable component using auth store hooks.
 */

"use client";

import { useUser, useIsAuthenticated } from "@/stores/auth";
import { UserAvatar } from "./user-avatar";
import { SignInButton } from "./sign-in-button";
import { SignOutButton } from "./sign-out-button";
import { cn } from "@/lib/utils";

export interface AuthStatusProps {
  /**
   * Additional CSS classes to apply to the container
   */
  className?: string;

  /**
   * Whether to show the full status or compact view
   * @default 'full'
   */
  variant?: "full" | "compact";

  /**
   * Whether to show sign-out button when authenticated
   * @default true
   */
  showSignOut?: boolean;

  /**
   * Callback URL for sign-in/sign-out
   */
  callbackUrl?: string;
}

/**
 * AuthStatus Component
 *
 * Shows user information when authenticated, or sign-in prompt when not.
 * Uses auth store hooks to access authentication state.
 *
 * @example
 * ```tsx
 * // Full status with sign-out button
 * <AuthStatus />
 *
 * // Compact view
 * <AuthStatus variant="compact" />
 *
 * // Without sign-out button
 * <AuthStatus showSignOut={false} />
 * ```
 */
export function AuthStatus({
  className,
  variant = "full",
  showSignOut = true,
  callbackUrl,
}: AuthStatusProps) {
  const user = useUser();
  const isAuthenticated = useIsAuthenticated();

  if (!isAuthenticated || !user) {
    // Not authenticated - show sign-in prompt
    return (
      <div
        className={cn(
          "flex items-center gap-3",
          variant === "compact" ? "justify-center" : "justify-between",
          className,
        )}
        data-testid="auth-status"
      >
        {variant === "full" && (
          <div className="text-sm text-muted-foreground">
            <p>Not signed in</p>
          </div>
        )}
        <SignInButton
          callbackUrl={callbackUrl}
          size={variant === "compact" ? "sm" : "default"}
        />
      </div>
    );
  }

  // Authenticated - show user info
  if (variant === "compact") {
    return (
      <div
        className={cn("flex items-center gap-2", className)}
        data-testid="auth-status"
      >
        <UserAvatar user={user} size="sm" />
        {showSignOut && (
          <SignOutButton callbackUrl={callbackUrl} size="sm" variant="ghost" />
        )}
      </div>
    );
  }

  // Full variant
  return (
    <div
      className={cn("flex items-center justify-between gap-4", className)}
      data-testid="auth-status"
    >
      <div className="flex items-center gap-3">
        <UserAvatar user={user} size="md" showBorder />
        <div className="flex flex-col">
          <p className="text-sm font-medium leading-none">
            {user.getDisplayName()}
          </p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
      </div>
      {showSignOut && <SignOutButton callbackUrl={callbackUrl} />}
    </div>
  );
}
