/**
 * Auth Domain Exports
 *
 * Export all auth domain entities, value objects, and interfaces.
 */

// User Entity
export {
  User,
  ValidationError as UserValidationError,
  type UserProps,
} from "./entities/user.entity";

// Session Value Object
export {
  Session,
  SessionValidationError,
  type SessionProps,
} from "./value-objects/session.vo";

// Repository Interface
export { type IAuthRepository } from "./repositories/auth.repository.interface";
