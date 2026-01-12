/**
 * Auth Repository Interface
 *
 * Defines the contract for authentication data access.
 * This is a domain interface - implementations live in interface-adapters layer.
 */

import { Session } from "../value-objects/session.vo";

/**
 * IAuthRepository
 *
 * Repository interface for authentication operations.
 * Follows CQRS pattern - separating read and write operations.
 */
export interface IAuthRepository {
  /**
   * Get the current authenticated session
   *
   * @returns Session if authenticated, null if not authenticated
   * @throws Error if session retrieval fails
   */
  getCurrentSession(): Promise<Session | null>;

  /**
   * Sign in with a provider (e.g., "google")
   *
   * @param provider - Authentication provider name
   * @param callbackUrl - Optional URL to redirect to after sign in
   * @throws Error if sign in fails
   */
  signIn(provider: string, callbackUrl?: string): Promise<void>;

  /**
   * Sign out the current user
   *
   * @param callbackUrl - Optional URL to redirect to after sign out
   * @throws Error if sign out fails
   */
  signOut(callbackUrl?: string): Promise<void>;
}
