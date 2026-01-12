/**
 * User Entity Tests
 *
 * Demonstrates domain entity validation and business logic
 */

import { User, UserValidationError } from "@/domains/auth";

describe("User Entity", () => {
  describe("Factory Methods", () => {
    it("should create valid user with all properties", () => {
      const user = User.create({
        id: "123",
        email: "test@example.com",
        name: "John Doe",
        image: "https://example.com/avatar.jpg",
        emailVerified: new Date("2024-01-01"),
      });

      expect(user.id).toBe("123");
      expect(user.email).toBe("test@example.com");
      expect(user.name).toBe("John Doe");
      expect(user.image).toBe("https://example.com/avatar.jpg");
      expect(user.emailVerified).toEqual(new Date("2024-01-01"));
    });

    it("should create user without optional properties", () => {
      const user = User.create({
        id: "123",
        email: "test@example.com",
        name: "John Doe",
      });

      expect(user.id).toBe("123");
      expect(user.image).toBeUndefined();
      expect(user.emailVerified).toBeUndefined();
    });

    it("should create user from NextAuth session", () => {
      const sessionUser = {
        id: "google-123",
        email: "user@gmail.com",
        name: "Jane Smith",
        image: "https://google.com/photo.jpg",
      };

      const user = User.fromSession(sessionUser);

      expect(user.id).toBe("google-123");
      expect(user.email).toBe("user@gmail.com");
      expect(user.name).toBe("Jane Smith");
    });
  });

  describe("Validation", () => {
    it("should throw error for missing id", () => {
      expect(() =>
        User.create({
          id: "",
          email: "test@example.com",
          name: "John Doe",
        }),
      ).toThrow(UserValidationError);
    });

    it("should throw error for missing email", () => {
      expect(() =>
        User.create({
          id: "123",
          email: "",
          name: "John Doe",
        }),
      ).toThrow(UserValidationError);
    });

    it("should throw error for invalid email format", () => {
      expect(() =>
        User.create({
          id: "123",
          email: "not-an-email",
          name: "John Doe",
        }),
      ).toThrow(UserValidationError);
    });

    it("should throw error for missing name", () => {
      expect(() =>
        User.create({
          id: "123",
          email: "test@example.com",
          name: "",
        }),
      ).toThrow(UserValidationError);
    });

    it("should throw error for name exceeding 100 characters", () => {
      const longName = "a".repeat(101);
      expect(() =>
        User.create({
          id: "123",
          email: "test@example.com",
          name: longName,
        }),
      ).toThrow(UserValidationError);
    });

    it("should throw error for future emailVerified date", () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      expect(() =>
        User.create({
          id: "123",
          email: "test@example.com",
          name: "John Doe",
          emailVerified: futureDate,
        }),
      ).toThrow(UserValidationError);
    });
  });

  describe("Business Methods", () => {
    it("should return true for verified email", () => {
      const user = User.create({
        id: "123",
        email: "test@example.com",
        name: "John Doe",
        emailVerified: new Date(),
      });

      expect(user.isEmailVerified()).toBe(true);
    });

    it("should return false for unverified email", () => {
      const user = User.create({
        id: "123",
        email: "test@example.com",
        name: "John Doe",
      });

      expect(user.isEmailVerified()).toBe(false);
    });

    it("should return display name", () => {
      const user = User.create({
        id: "123",
        email: "test@example.com",
        name: "John Doe",
      });

      expect(user.getDisplayName()).toBe("John Doe");
    });

    it("should return correct initials for two-word name", () => {
      const user = User.create({
        id: "123",
        email: "test@example.com",
        name: "John Doe",
      });

      expect(user.getInitials()).toBe("JD");
    });

    it("should return correct initials for single name", () => {
      const user = User.create({
        id: "123",
        email: "test@example.com",
        name: "Madonna",
      });

      expect(user.getInitials()).toBe("M");
    });

    it("should return correct initials for three-word name", () => {
      const user = User.create({
        id: "123",
        email: "test@example.com",
        name: "John Paul Jones",
      });

      // Should only take first 2 initials
      expect(user.getInitials()).toBe("JP");
    });
  });

  describe("Serialization", () => {
    it("should convert to plain object", () => {
      const emailVerified = new Date("2024-01-01");
      const user = User.create({
        id: "123",
        email: "test@example.com",
        name: "John Doe",
        image: "https://example.com/avatar.jpg",
        emailVerified,
      });

      const plain = user.toPlainObject();

      expect(plain).toEqual({
        id: "123",
        email: "test@example.com",
        name: "John Doe",
        image: "https://example.com/avatar.jpg",
        emailVerified,
      });
    });
  });
});
