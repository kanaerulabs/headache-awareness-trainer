/**
 * Auth Store
 *
 * Zustand store for managing authentication state.
 * This is the state management layer - stores data only, no business logic.
 *
 * Design Decisions:
 * - Uses Zustand for lightweight state management
 * - Immutable updates with spread operators
 * - No business logic - just state storage
 * - Type-safe with TypeScript interfaces
 */

import { create } from "zustand";
import { Session } from "@/domains/auth/value-objects/session.vo";
import { User } from "@/domains/auth/entities/user.entity";

/**
 * Auth Store State Interface
 *
 * Defines the shape of authentication state:
 * - session: Current user session (null if not authenticated)
 * - isLoading: Loading state for async auth operations
 * - error: Error message from auth operations
 */
export interface AuthState {
  // State
  session: Session | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setSession: (session: Session | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

/**
 * Initial state for auth store
 */
const initialState = {
  session: null,
  isLoading: false,
  error: null,
};

/**
 * Auth Store
 *
 * Manages authentication state for the application.
 * Store only - business logic lives in use cases.
 *
 * Usage:
 * ```typescript
 * const session = useAuthStore((state) => state.session);
 * const setSession = useAuthStore((state) => state.setSession);
 * ```
 */
export const useAuthStore = create<AuthState>((set) => ({
  ...initialState,

  /**
   * Set the current session
   *
   * @param session - Session object or null to clear session
   */
  setSession: (session) =>
    set({
      session,
      error: null, // Clear error on successful session update
    }),

  /**
   * Set loading state
   *
   * @param isLoading - Loading state boolean
   */
  setLoading: (isLoading) => set({ isLoading }),

  /**
   * Set error message
   *
   * @param error - Error message string or null to clear error
   */
  setError: (error) =>
    set({
      error,
      isLoading: false, // Stop loading on error
    }),

  /**
   * Clear error message
   */
  clearError: () => set({ error: null }),

  /**
   * Reset store to initial state
   * Useful for sign out or cleaning up state
   */
  reset: () => set(initialState),
}));

/**
 * Selectors for derived state
 *
 * These selectors compute derived values from the store state.
 * Use these to avoid re-renders when only derived state changes.
 */

/**
 * Get the current user from session
 *
 * @param state - Auth store state
 * @returns User object or null if no session
 */
export const selectUser = (state: AuthState): User | null => {
  return state.session?.user || null;
};

/**
 * Check if user is authenticated
 *
 * @param state - Auth store state
 * @returns true if user has a valid (non-expired) session
 */
export const selectIsAuthenticated = (state: AuthState): boolean => {
  return state.session !== null && state.session.isValid();
};

/**
 * Check if session is expired
 *
 * @param state - Auth store state
 * @returns true if session exists but is expired
 */
export const selectIsSessionExpired = (state: AuthState): boolean => {
  return state.session !== null && state.session.isExpired();
};

/**
 * Get user ID from session
 *
 * @param state - Auth store state
 * @returns User ID string or null if no session
 */
export const selectUserId = (state: AuthState): string | null => {
  return state.session?.user.id || null;
};

/**
 * Get user email from session
 *
 * @param state - Auth store state
 * @returns User email string or null if no session
 */
export const selectUserEmail = (state: AuthState): string | null => {
  return state.session?.user.email || null;
};

/**
 * Check if session is expiring soon (within 5 minutes)
 *
 * @param state - Auth store state
 * @returns true if session is expiring soon
 */
export const selectIsSessionExpiringSoon = (state: AuthState): boolean => {
  return state.session?.isExpiringSoon() || false;
};
