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
 * - ID is auto-generated for new users
 */
export class User {
  private _id: string;
  private _email: string;
  private _name: string;
  private _image?: string;
  private _emailVerified?: Date;

  private constructor() {
    // Private constructor - use factory methods
    this._id = "";
    this._email = "";
    this._name = "";
  }

  /**
   * Factory method - creates new User with auto-generated ID
   * Use this when creating a NEW user (not from persistence)
   */
  static create(props: Omit<UserProps, "id">): User {
    const user = new User();
    user._id = crypto.randomUUID();
    user._email = props.email;
    user._name = props.name;
    user._image = props.image;
    user._emailVerified = props.emailVerified;

    User.validateUser(user);
    return user;
  }

  /**
   * Factory method - loads User from persistence with existing ID
   * Use this when reconstructing a user from database/session
   */
  static load(props: UserProps): User {
    const user = new User();
    user._id = props.id;
    user._email = props.email;
    user._name = props.name;
    user._image = props.image;
    user._emailVerified = props.emailVerified;

    User.validateUser(user);
    return user;
  }

  /**
   * Factory method - creates User from NextAuth session
   * Convenience method for creating from session object
   * Uses load() since session provides an existing ID
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

    return User.load({
      id: sessionUser.id,
      email: sessionUser.email,
      name: sessionUser.name,
      image: sessionUser.image || undefined,
    });
  }

  /**
   * Validation rules for User
   */
  private static validateUser(user: User): void {
    // ID validation
    if (!user._id || user._id.trim().length === 0) {
      throw new ValidationError("User ID is required", "id");
    }

    // Email validation
    if (!user._email || user._email.trim().length === 0) {
      throw new ValidationError("Email is required", "email");
    }
    if (!User.isValidEmail(user._email)) {
      throw new ValidationError("Invalid email format", "email");
    }

    // Name validation
    if (!user._name || user._name.trim().length === 0) {
      throw new ValidationError("Name is required", "name");
    }
    if (user._name.length > 100) {
      throw new ValidationError("Name cannot exceed 100 characters", "name");
    }

    // Email verified date validation (if provided)
    if (user._emailVerified && !(user._emailVerified instanceof Date)) {
      throw new ValidationError(
        "Email verified must be a valid date",
        "emailVerified",
      );
    }
    if (user._emailVerified && user._emailVerified > new Date()) {
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

  // Getters for private fields
  get id(): string {
    return this._id;
  }

  get email(): string {
    return this._email;
  }

  get name(): string {
    return this._name;
  }

  get image(): string | undefined {
    return this._image;
  }

  get emailVerified(): Date | undefined {
    return this._emailVerified;
  }

  /**
   * Check if user's email is verified
   */
  isEmailVerified(): boolean {
    return this._emailVerified !== undefined;
  }

  /**
   * Get user's display name
   */
  getDisplayName(): string {
    return this._name;
  }

  /**
   * Get user's initials for avatar fallback
   */
  getInitials(): string {
    return this._name
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
      id: this._id,
      email: this._email,
      name: this._name,
      image: this._image,
      emailVerified: this._emailVerified,
    };
  }
}
