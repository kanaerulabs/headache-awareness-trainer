/**
 * Auth Store Hooks
 *
 * Convenience hooks for accessing auth store with optimized selectors.
 * These hooks prevent unnecessary re-renders by selecting only needed state.
 *
 * Design Decisions:
 * - Custom hooks for common use cases
 * - Optimized selectors to minimize re-renders
 * - Type-safe return types
 * - Follows React hooks naming convention
 */

import { Session } from "@/domains/auth/value-objects/session.vo";
import { User } from "@/domains/auth/entities/user.entity";
import {
  useAuthStore,
  selectUser,
  selectIsAuthenticated,
  selectIsSessionExpired,
  selectUserId,
  selectUserEmail,
  selectIsSessionExpiringSoon,
} from "./auth.store";

/**
 * Get the current session
 *
 * @returns Current session or null if not authenticated
 *
 * @example
 * ```typescript
 * const session = useSession();
 * if (session) {
 *   console.log('Session expires:', session.expires);
 * }
 * ```
 */
export function useSession(): Session | null {
  return useAuthStore((state) => state.session);
}

/**
 * Get the current user
 *
 * @returns Current user or null if not authenticated
 *
 * @example
 * ```typescript
 * const user = useUser();
 * if (user) {
 *   console.log('User name:', user.name);
 * }
 * ```
 */
export function useUser(): User | null {
  return useAuthStore(selectUser);
}

/**
 * Check if user is authenticated
 *
 * @returns true if user has a valid (non-expired) session
 *
 * @example
 * ```typescript
 * const isAuthenticated = useIsAuthenticated();
 * if (!isAuthenticated) {
 *   return <LoginPage />;
 * }
 * ```
 */
export function useIsAuthenticated(): boolean {
  return useAuthStore(selectIsAuthenticated);
}

/**
 * Get authentication loading state
 *
 * @returns true if authentication operation is in progress
 *
 * @example
 * ```typescript
 * const isLoading = useAuthLoading();
 * if (isLoading) {
 *   return <Spinner />;
 * }
 * ```
 */
export function useAuthLoading(): boolean {
  return useAuthStore((state) => state.isLoading);
}

/**
 * Get authentication error
 *
 * @returns Error message string or null if no error
 *
 * @example
 * ```typescript
 * const error = useAuthError();
 * if (error) {
 *   return <ErrorAlert message={error} />;
 * }
 * ```
 */
export function useAuthError(): string | null {
  return useAuthStore((state) => state.error);
}

/**
 * Check if session is expired
 *
 * @returns true if session exists but is expired
 *
 * @example
 * ```typescript
 * const isExpired = useIsSessionExpired();
 * if (isExpired) {
 *   return <SessionExpiredModal />;
 * }
 * ```
 */
export function useIsSessionExpired(): boolean {
  return useAuthStore(selectIsSessionExpired);
}

/**
 * Get user ID from session
 *
 * @returns User ID string or null if no session
 *
 * @example
 * ```typescript
 * const userId = useUserId();
 * if (userId) {
 *   // Use userId for API calls
 * }
 * ```
 */
export function useUserId(): string | null {
  return useAuthStore(selectUserId);
}

/**
 * Get user email from session
 *
 * @returns User email string or null if no session
 *
 * @example
 * ```typescript
 * const email = useUserEmail();
 * console.log('Logged in as:', email);
 * ```
 */
export function useUserEmail(): string | null {
  return useAuthStore(selectUserEmail);
}

/**
 * Check if session is expiring soon (within 5 minutes)
 *
 * @returns true if session is expiring soon
 *
 * @example
 * ```typescript
 * const isExpiringSoon = useIsSessionExpiringSoon();
 * if (isExpiringSoon) {
 *   return <SessionExpiringWarning />;
 * }
 * ```
 */
export function useIsSessionExpiringSoon(): boolean {
  return useAuthStore(selectIsSessionExpiringSoon);
}

/**
 * Get auth store actions
 *
 * @returns Object containing all auth store actions
 *
 * @example
 * ```typescript
 * const { setSession, setLoading, setError, clearError, reset } = useAuthActions();
 *
 * // Use in a custom hook or component
 * const handleLogin = async () => {
 *   setLoading(true);
 *   try {
 *     // ... login logic
 *     setSession(newSession);
 *   } catch (error) {
 *     setError(error.message);
 *   }
 * };
 * ```
 */
export function useAuthActions() {
  const setSession = useAuthStore((state) => state.setSession);
  const setLoading = useAuthStore((state) => state.setLoading);
  const setError = useAuthStore((state) => state.setError);
  const clearError = useAuthStore((state) => state.clearError);
  const reset = useAuthStore((state) => state.reset);

  return {
    setSession,
    setLoading,
    setError,
    clearError,
    reset,
  };
}

/**
 * Get complete auth store state and actions
 *
 * @returns Complete auth store state and actions
 *
 * @example
 * ```typescript
 * const auth = useAuth();
 * if (auth.isLoading) return <Spinner />;
 * if (auth.error) return <ErrorAlert message={auth.error} />;
 * if (!auth.session) return <LoginPage />;
 * return <Dashboard user={auth.session.user} />;
 * ```
 */
export function useAuth() {
  return useAuthStore();
}
