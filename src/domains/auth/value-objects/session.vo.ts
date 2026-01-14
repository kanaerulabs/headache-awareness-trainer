/**
 * Session Value Object
 *
 * Represents an authenticated user session.
 * Immutable value object following DDD principles.
 */

import { User, type UserProps } from "../entities/user.entity";

export interface SessionProps {
  user: UserProps;
  expires: Date;
  accessToken?: string;
}

export class SessionValidationError extends Error {
  constructor(
    message: string,
    public readonly field?: string,
  ) {
    super(message);
    this.name = "SessionValidationError";
  }
}

/**
 * Session Value Object
 *
 * Encapsulates session data with validation:
 * - User must be valid
 * - Expires date must be in the future
 * - Session is immutable once created
 */
export class Session {
  readonly user: User;
  readonly expires: Date;
  readonly accessToken?: string;

  private constructor(props: SessionProps) {
    this.user = User.load(props.user);
    this.expires = props.expires;
    this.accessToken = props.accessToken;
  }

  /**
   * Factory method - creates and validates Session
   */
  static create(props: SessionProps): Session {
    Session.validate(props);
    return new Session(props);
  }

  /**
   * Factory method - creates Session from NextAuth session
   */
  static fromNextAuthSession(session: {
    user?: {
      id?: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
    };
    expires: string;
    accessToken?: string;
  }): Session {
    if (!session.user) {
      throw new SessionValidationError("Session must have a user", "user");
    }

    const expiresDate = new Date(session.expires);

    return Session.create({
      user: {
        id: session.user.id || "",
        email: session.user.email || "",
        name: session.user.name || "",
        image: session.user.image || undefined,
      },
      expires: expiresDate,
      accessToken: session.accessToken,
    });
  }

  /**
   * Validation rules for Session
   */
  private static validate(props: SessionProps): void {
    // User validation
    if (!props.user) {
      throw new SessionValidationError("Session must have a user", "user");
    }

    // Expires validation
    if (!props.expires) {
      throw new SessionValidationError("Expires date is required", "expires");
    }
    if (!(props.expires instanceof Date)) {
      throw new SessionValidationError(
        "Expires must be a valid date",
        "expires",
      );
    }
    if (isNaN(props.expires.getTime())) {
      throw new SessionValidationError(
        "Expires must be a valid date",
        "expires",
      );
    }
  }

  /**
   * Check if session is expired
   */
  isExpired(): boolean {
    return new Date() > this.expires;
  }

  /**
   * Check if session is still valid
   */
  isValid(): boolean {
    return !this.isExpired();
  }

  /**
   * Get remaining time in milliseconds
   */
  getRemainingTime(): number {
    const remaining = this.expires.getTime() - Date.now();
    return Math.max(0, remaining);
  }

  /**
   * Check if session is expiring soon (within 5 minutes)
   */
  isExpiringSoon(): boolean {
    const fiveMinutes = 5 * 60 * 1000;
    return this.getRemainingTime() < fiveMinutes;
  }

  /**
   * Get user ID from session
   */
  getUserId(): string {
    return this.user.id;
  }

  /**
   * Get user email from session
   */
  getUserEmail(): string {
    return this.user.email;
  }

  /**
   * Convert to plain object for serialization
   */
  toPlainObject(): SessionProps {
    return {
      user: this.user.toPlainObject(),
      expires: this.expires,
      accessToken: this.accessToken,
    };
  }
}
