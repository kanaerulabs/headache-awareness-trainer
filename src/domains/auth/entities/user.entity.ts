/**
 * User Domain Entity
 *
 * Represents an authenticated user in the system.
 * This is the core domain model - framework agnostic.
 */

export interface UserProps {
  id: string;
  email: string;
  name: string;
  image?: string;
  emailVerified?: Date;
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field?: string,
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * User Entity
 *
 * Encapsulates all business rules for users:
 * - Email must be valid format
 * - Name must not be empty
 * - ID must be provided
 */
export class User {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly image?: string;
  readonly emailVerified?: Date;

  private constructor(props: UserProps) {
    this.id = props.id;
    this.email = props.email;
    this.name = props.name;
    this.image = props.image;
    this.emailVerified = props.emailVerified;
  }

  /**
   * Factory method - creates and validates User from session data
   * Use this when creating a User from authentication session
   */
  static create(props: UserProps): User {
    User.validate(props);
    return new User(props);
  }

  /**
   * Factory method - creates User from NextAuth session
   * Convenience method for creating from session object
   */
  static fromSession(sessionUser: {
    id?: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
  }): User {
    if (!sessionUser.id) {
      throw new ValidationError("User ID is required", "id");
    }
    if (!sessionUser.email) {
      throw new ValidationError("User email is required", "email");
    }
    if (!sessionUser.name) {
      throw new ValidationError("User name is required", "name");
    }

    return User.create({
      id: sessionUser.id,
      email: sessionUser.email,
      name: sessionUser.name,
      image: sessionUser.image || undefined,
    });
  }

  /**
   * Validation rules for User
   */
  private static validate(props: UserProps): void {
    // ID validation
    if (!props.id || props.id.trim().length === 0) {
      throw new ValidationError("User ID is required", "id");
    }

    // Email validation
    if (!props.email || props.email.trim().length === 0) {
      throw new ValidationError("Email is required", "email");
    }
    if (!User.isValidEmail(props.email)) {
      throw new ValidationError("Invalid email format", "email");
    }

    // Name validation
    if (!props.name || props.name.trim().length === 0) {
      throw new ValidationError("Name is required", "name");
    }
    if (props.name.length > 100) {
      throw new ValidationError(
        "Name cannot exceed 100 characters",
        "name",
      );
    }

    // Email verified date validation (if provided)
    if (props.emailVerified && !(props.emailVerified instanceof Date)) {
      throw new ValidationError(
        "Email verified must be a valid date",
        "emailVerified",
      );
    }
    if (props.emailVerified && props.emailVerified > new Date()) {
      throw new ValidationError(
        "Email verified date cannot be in the future",
        "emailVerified",
      );
    }
  }

  /**
   * Email format validation
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Check if user's email is verified
   */
  isEmailVerified(): boolean {
    return this.emailVerified !== undefined;
  }

  /**
   * Get user's display name
   */
  getDisplayName(): string {
    return this.name;
  }

  /**
   * Get user's initials for avatar fallback
   */
  getInitials(): string {
    return this.name
      .split(" ")
      .map((part) => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join("");
  }

  /**
   * Convert to plain object for persistence
   */
  toPlainObject(): UserProps {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      image: this.image,
      emailVerified: this.emailVerified,
    };
  }
}
