/**
 * SignInButton Component
 *
 * Button that triggers Google OAuth sign-in via NextAuth.
 * Pure presentational component with accessibility features.
 */

'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface SignInButtonProps {
  /**
   * Callback URL to redirect to after successful sign-in
   * @default '/' - redirects to home page
   */
  callbackUrl?: string;

  /**
   * Additional CSS classes to apply to the button
   */
  className?: string;

  /**
   * Button variant
   * @default 'default'
   */
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link';

  /**
   * Button size
   * @default 'default'
   */
  size?: 'default' | 'sm' | 'lg' | 'icon';

  /**
   * Custom button text
   * @default 'Sign in with Google'
   */
  children?: React.ReactNode;
}

/**
 * SignInButton Component
 *
 * Provides a button to trigger Google OAuth authentication.
 * Handles loading state and errors gracefully.
 *
 * @example
 * ```tsx
 * <SignInButton callbackUrl="/dashboard" />
 * <SignInButton variant="outline">Custom Sign In Text</SignInButton>
 * ```
 */
export function SignInButton({
  callbackUrl = '/',
  className,
  variant = 'default',
  size = 'default',
  children = 'Sign in with Google',
}: SignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      // Trigger NextAuth sign-in with Google provider
      await signIn('google', { callbackUrl });
    } catch (error) {
      // Error handling is managed by NextAuth
      // It will show error page if authentication fails
      console.error('Sign in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSignIn}
      disabled={isLoading}
      variant={variant}
      size={size}
      className={cn(className)}
      data-testid="sign-in-button"
      aria-label={isLoading ? 'Signing in...' : 'Sign in with Google'}
      aria-busy={isLoading}
    >
      {isLoading ? (
        <>
          <span
            className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]"
            role="status"
            aria-label="Loading"
          />
          <span>Signing in...</span>
        </>
      ) : (
        children
      )}
    </Button>
  );
}
