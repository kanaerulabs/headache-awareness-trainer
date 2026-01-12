/**
 * Auth Store Barrel Export
 *
 * Central export point for all auth store exports.
 * Use this to import auth store functionality throughout the application.
 */

// Store and types
export {
  useAuthStore,
  type AuthState,
  selectUser,
  selectIsAuthenticated,
  selectIsSessionExpired,
  selectUserId,
  selectUserEmail,
  selectIsSessionExpiringSoon,
} from "./auth.store";

// Convenience hooks
export {
  useSession,
  useUser,
  useIsAuthenticated,
  useAuthLoading,
  useAuthError,
  useIsSessionExpired,
  useUserId,
  useUserEmail,
  useIsSessionExpiringSoon,
  useAuthActions,
  useAuth,
} from "./use-auth-store";
