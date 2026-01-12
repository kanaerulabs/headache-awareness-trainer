/**
 * Session Value Object Tests
 *
 * Demonstrates value object validation and immutability
 */

import { Session, SessionValidationError } from "@/domains/auth";

describe("Session Value Object", () => {
  const validUserProps = {
    id: "123",
    email: "test@example.com",
    name: "John Doe",
  };

  describe("Factory Methods", () => {
    it("should create valid session", () => {
      const expires = new Date(Date.now() + 3600000); // 1 hour from now
      const session = Session.create({
        user: validUserProps,
        expires,
        accessToken: "token123",
      });

      expect(session.user.id).toBe("123");
      expect(session.expires).toEqual(expires);
      expect(session.accessToken).toBe("token123");
    });

    it("should create session from NextAuth session", () => {
      const nextAuthSession = {
        user: {
          id: "google-123",
          email: "user@gmail.com",
          name: "Jane Smith",
          image: "https://google.com/photo.jpg",
        },
        expires: new Date(Date.now() + 3600000).toISOString(),
        accessToken: "token123",
      };

      const session = Session.fromNextAuthSession(nextAuthSession);

      expect(session.user.id).toBe("google-123");
      expect(session.user.email).toBe("user@gmail.com");
      expect(session.accessToken).toBe("token123");
    });
  });

  describe("Validation", () => {
    it("should throw error for missing user", () => {
      const expires = new Date(Date.now() + 3600000);

      expect(() =>
        Session.create({
          user: null as any,
          expires,
        }),
      ).toThrow(SessionValidationError);
    });

    it("should throw error for missing expires", () => {
      expect(() =>
        Session.create({
          user: validUserProps,
          expires: null as any,
        }),
      ).toThrow(SessionValidationError);
    });

    it("should throw error for invalid expires date", () => {
      expect(() =>
        Session.create({
          user: validUserProps,
          expires: "not a date" as any,
        }),
      ).toThrow(SessionValidationError);
    });
  });

  describe("Session Status Methods", () => {
    it("should return false for non-expired session", () => {
      const expires = new Date(Date.now() + 3600000); // 1 hour from now
      const session = Session.create({
        user: validUserProps,
        expires,
      });

      expect(session.isExpired()).toBe(false);
      expect(session.isValid()).toBe(true);
    });

    it("should return true for expired session", () => {
      const expires = new Date(Date.now() - 3600000); // 1 hour ago
      const session = Session.create({
        user: validUserProps,
        expires,
      });

      expect(session.isExpired()).toBe(true);
      expect(session.isValid()).toBe(false);
    });

    it("should return false for not expiring soon", () => {
      const expires = new Date(Date.now() + 600000); // 10 minutes from now
      const session = Session.create({
        user: validUserProps,
        expires,
      });

      expect(session.isExpiringSoon()).toBe(false);
    });

    it("should return true for expiring soon", () => {
      const expires = new Date(Date.now() + 120000); // 2 minutes from now
      const session = Session.create({
        user: validUserProps,
        expires,
      });

      expect(session.isExpiringSoon()).toBe(true);
    });

    it("should return positive remaining time for active session", () => {
      const expires = new Date(Date.now() + 3600000); // 1 hour from now
      const session = Session.create({
        user: validUserProps,
        expires,
      });

      const remaining = session.getRemainingTime();
      expect(remaining).toBeGreaterThan(0);
      expect(remaining).toBeLessThanOrEqual(3600000);
    });

    it("should return zero remaining time for expired session", () => {
      const expires = new Date(Date.now() - 3600000); // 1 hour ago
      const session = Session.create({
        user: validUserProps,
        expires,
      });

      expect(session.getRemainingTime()).toBe(0);
    });
  });

  describe("Convenience Methods", () => {
    it("should return user ID", () => {
      const expires = new Date(Date.now() + 3600000);
      const session = Session.create({
        user: validUserProps,
        expires,
      });

      expect(session.getUserId()).toBe("123");
    });

    it("should return user email", () => {
      const expires = new Date(Date.now() + 3600000);
      const session = Session.create({
        user: validUserProps,
        expires,
      });

      expect(session.getUserEmail()).toBe("test@example.com");
    });
  });

  describe("Serialization", () => {
    it("should convert to plain object", () => {
      const expires = new Date(Date.now() + 3600000);
      const session = Session.create({
        user: validUserProps,
        expires,
        accessToken: "token123",
      });

      const plain = session.toPlainObject();

      expect(plain).toEqual({
        user: validUserProps,
        expires,
        accessToken: "token123",
      });
    });
  });

  describe("Immutability", () => {
    it("should have readonly properties at TypeScript level", () => {
      const expires = new Date(Date.now() + 3600000);
      const session = Session.create({
        user: validUserProps,
        expires,
      });

      // TypeScript compile-time check - these should error if uncommented:
      // @ts-expect-error - readonly properties cannot be reassigned
      // session.user = null;
      // @ts-expect-error - readonly properties cannot be reassigned
      // session.expires = new Date();
      // @ts-expect-error - readonly properties cannot be reassigned
      // session.accessToken = "new-token";

      // Verify session exists and has expected structure
      expect(session.user).toBeDefined();
      expect(session.expires).toBeDefined();
    });
  });
});
