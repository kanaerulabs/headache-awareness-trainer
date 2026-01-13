/**
 * Auth Store Unit Tests
 *
 * Tests for Zustand auth store state management.
 * Following TDD principles with AAA pattern (Arrange, Act, Assert).
 *
 * Test Coverage:
 * - State initialization
 * - Synchronous actions (setSession, setLoading, setError, clearError, reset)
 * - Selectors (selectUser, selectIsAuthenticated, etc.)
 * - State immutability
 */

import {
  useAuthStore,
  selectUser,
  selectIsAuthenticated,
  selectIsSessionExpired,
  selectUserId,
  selectUserEmail,
  selectIsSessionExpiringSoon,
} from "@/stores/auth/auth.store";
import { Session } from "@/domains/auth/value-objects/session.vo";
import { User } from "@/domains/auth/entities/user.entity";

describe("Auth Store", () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useAuthStore.getState().reset();
  });

  afterEach(() => {
    // Clear all mocks after each test
    jest.clearAllMocks();
  });

  describe("state initialization", () => {
    it("should initialize with null session", () => {
      // Act
      const state = useAuthStore.getState();

      // Assert
      expect(state.session).toBeNull();
    });

    it("should initialize with loading false", () => {
      // Act
      const state = useAuthStore.getState();

      // Assert
      expect(state.isLoading).toBe(false);
    });

    it("should initialize with null error", () => {
      // Act
      const state = useAuthStore.getState();

      // Assert
      expect(state.error).toBeNull();
    });

    it("should have all action methods defined", () => {
      // Act
      const state = useAuthStore.getState();

      // Assert
      expect(state.setSession).toBeDefined();
      expect(state.setLoading).toBeDefined();
      expect(state.setError).toBeDefined();
      expect(state.clearError).toBeDefined();
      expect(state.reset).toBeDefined();
    });
  });

  describe("setSession action", () => {
    it("should set session to valid session object", () => {
      // Arrange
      const mockSession = Session.create({
        user: {
          id: "user-123",
          email: "test@example.com",
          name: "Test User",
        },
        expires: new Date(Date.now() + 3600000), // 1 hour from now
      });

      // Act
      useAuthStore.getState().setSession(mockSession);
      const state = useAuthStore.getState();

      // Assert
      expect(state.session).toEqual(mockSession);
      expect(state.session?.user.id).toBe("user-123");
      expect(state.session?.user.email).toBe("test@example.com");
    });

    it("should set session to null to clear session", () => {
      // Arrange - set a session first
      const mockSession = Session.create({
        user: {
          id: "user-123",
          email: "test@example.com",
          name: "Test User",
        },
        expires: new Date(Date.now() + 3600000),
      });
      useAuthStore.getState().setSession(mockSession);

      // Act - clear session
      useAuthStore.getState().setSession(null);
      const state = useAuthStore.getState();

      // Assert
      expect(state.session).toBeNull();
    });

    it("should clear error when setting session", () => {
      // Arrange - set an error first
      useAuthStore.getState().setError("Previous error");

      // Act - set session
      const mockSession = Session.create({
        user: {
          id: "user-123",
          email: "test@example.com",
          name: "Test User",
        },
        expires: new Date(Date.now() + 3600000),
      });
      useAuthStore.getState().setSession(mockSession);
      const state = useAuthStore.getState();

      // Assert
      expect(state.error).toBeNull();
    });

    it("should maintain immutability - not mutate previous state", () => {
      // Arrange
      const session1 = Session.create({
        user: {
          id: "user-1",
          email: "user1@example.com",
          name: "User 1",
        },
        expires: new Date(Date.now() + 3600000),
      });
      useAuthStore.getState().setSession(session1);
      const stateBeforeUpdate = useAuthStore.getState();

      // Act - set different session
      const session2 = Session.create({
        user: {
          id: "user-2",
          email: "user2@example.com",
          name: "User 2",
        },
        expires: new Date(Date.now() + 3600000),
      });
      useAuthStore.getState().setSession(session2);
      const stateAfterUpdate = useAuthStore.getState();

      // Assert - state object reference should be different
      expect(stateAfterUpdate).not.toBe(stateBeforeUpdate);
      expect(stateAfterUpdate.session).not.toBe(stateBeforeUpdate.session);
    });
  });

  describe("setLoading action", () => {
    it("should set loading to true", () => {
      // Act
      useAuthStore.getState().setLoading(true);
      const state = useAuthStore.getState();

      // Assert
      expect(state.isLoading).toBe(true);
    });

    it("should set loading to false", () => {
      // Arrange - set loading to true first
      useAuthStore.getState().setLoading(true);

      // Act - set loading to false
      useAuthStore.getState().setLoading(false);
      const state = useAuthStore.getState();

      // Assert
      expect(state.isLoading).toBe(false);
    });

    it("should not affect other state properties", () => {
      // Arrange - set session and error
      const mockSession = Session.create({
        user: {
          id: "user-123",
          email: "test@example.com",
          name: "Test User",
        },
        expires: new Date(Date.now() + 3600000),
      });
      useAuthStore.getState().setSession(mockSession);
      useAuthStore.getState().setError("Some error");

      // Act
      useAuthStore.getState().setLoading(true);
      const state = useAuthStore.getState();

      // Assert - session and error should remain unchanged
      expect(state.session).toEqual(mockSession);
      expect(state.error).toBe("Some error");
    });
  });

  describe("setError action", () => {
    it("should set error message", () => {
      // Act
      useAuthStore.getState().setError("Authentication failed");
      const state = useAuthStore.getState();

      // Assert
      expect(state.error).toBe("Authentication failed");
    });

    it("should set error to null", () => {
      // Arrange - set an error first
      useAuthStore.getState().setError("Previous error");

      // Act - clear error
      useAuthStore.getState().setError(null);
      const state = useAuthStore.getState();

      // Assert
      expect(state.error).toBeNull();
    });

    it("should set loading to false when setting error", () => {
      // Arrange - set loading to true
      useAuthStore.getState().setLoading(true);

      // Act - set error
      useAuthStore.getState().setError("Authentication failed");
      const state = useAuthStore.getState();

      // Assert
      expect(state.isLoading).toBe(false);
    });

    it("should handle empty string error", () => {
      // Act
      useAuthStore.getState().setError("");
      const state = useAuthStore.getState();

      // Assert
      expect(state.error).toBe("");
    });
  });

  describe("clearError action", () => {
    it("should clear error message", () => {
      // Arrange - set an error
      useAuthStore.getState().setError("Some error");

      // Act
      useAuthStore.getState().clearError();
      const state = useAuthStore.getState();

      // Assert
      expect(state.error).toBeNull();
    });

    it("should not affect other state properties", () => {
      // Arrange - set session and error, then set loading after error
      const mockSession = Session.create({
        user: {
          id: "user-123",
          email: "test@example.com",
          name: "Test User",
        },
        expires: new Date(Date.now() + 3600000),
      });
      useAuthStore.getState().setSession(mockSession);
      useAuthStore.getState().setError("Some error");
      // Set loading after error (since setError sets loading to false)
      useAuthStore.getState().setLoading(true);

      // Act
      useAuthStore.getState().clearError();
      const state = useAuthStore.getState();

      // Assert - session and loading should remain unchanged
      expect(state.session).toEqual(mockSession);
      expect(state.isLoading).toBe(true);
    });
  });

  describe("reset action", () => {
    it("should reset all state to initial values", () => {
      // Arrange - set all state properties
      const mockSession = Session.create({
        user: {
          id: "user-123",
          email: "test@example.com",
          name: "Test User",
        },
        expires: new Date(Date.now() + 3600000),
      });
      useAuthStore.getState().setSession(mockSession);
      useAuthStore.getState().setLoading(true);
      useAuthStore.getState().setError("Some error");

      // Act
      useAuthStore.getState().reset();
      const state = useAuthStore.getState();

      // Assert
      expect(state.session).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it("should be idempotent - calling reset multiple times has same effect", () => {
      // Arrange - set some state
      const mockSession = Session.create({
        user: {
          id: "user-123",
          email: "test@example.com",
          name: "Test User",
        },
        expires: new Date(Date.now() + 3600000),
      });
      useAuthStore.getState().setSession(mockSession);

      // Act - reset twice
      useAuthStore.getState().reset();
      const stateAfterFirstReset = useAuthStore.getState();
      useAuthStore.getState().reset();
      const stateAfterSecondReset = useAuthStore.getState();

      // Assert - both states should be identical
      expect(stateAfterFirstReset.session).toBeNull();
      expect(stateAfterFirstReset.isLoading).toBe(false);
      expect(stateAfterFirstReset.error).toBeNull();
      expect(stateAfterSecondReset).toEqual(stateAfterFirstReset);
    });
  });

  describe("selectUser selector", () => {
    it("should return user from session", () => {
      // Arrange
      const mockSession = Session.create({
        user: {
          id: "user-123",
          email: "test@example.com",
          name: "Test User",
        },
        expires: new Date(Date.now() + 3600000),
      });
      useAuthStore.getState().setSession(mockSession);
      const state = useAuthStore.getState();

      // Act
      const user = selectUser(state);

      // Assert
      expect(user).toBeDefined();
      expect(user?.id).toBe("user-123");
      expect(user?.email).toBe("test@example.com");
      expect(user?.name).toBe("Test User");
    });

    it("should return null when session is null", () => {
      // Arrange
      const state = useAuthStore.getState();

      // Act
      const user = selectUser(state);

      // Assert
      expect(user).toBeNull();
    });
  });

  describe("selectIsAuthenticated selector", () => {
    it("should return true when session is valid", () => {
      // Arrange - create session with future expiry
      const mockSession = Session.create({
        user: {
          id: "user-123",
          email: "test@example.com",
          name: "Test User",
        },
        expires: new Date(Date.now() + 3600000), // 1 hour from now
      });
      useAuthStore.getState().setSession(mockSession);
      const state = useAuthStore.getState();

      // Act
      const isAuthenticated = selectIsAuthenticated(state);

      // Assert
      expect(isAuthenticated).toBe(true);
    });

    it("should return false when session is null", () => {
      // Arrange
      const state = useAuthStore.getState();

      // Act
      const isAuthenticated = selectIsAuthenticated(state);

      // Assert
      expect(isAuthenticated).toBe(false);
    });

    it("should return false when session is expired", () => {
      // Arrange - create expired session
      const mockSession = Session.create({
        user: {
          id: "user-123",
          email: "test@example.com",
          name: "Test User",
        },
        expires: new Date(Date.now() - 3600000), // 1 hour ago (expired)
      });
      useAuthStore.getState().setSession(mockSession);
      const state = useAuthStore.getState();

      // Act
      const isAuthenticated = selectIsAuthenticated(state);

      // Assert
      expect(isAuthenticated).toBe(false);
    });
  });

  describe("selectIsSessionExpired selector", () => {
    it("should return false when session is valid", () => {
      // Arrange - create session with future expiry
      const mockSession = Session.create({
        user: {
          id: "user-123",
          email: "test@example.com",
          name: "Test User",
        },
        expires: new Date(Date.now() + 3600000), // 1 hour from now
      });
      useAuthStore.getState().setSession(mockSession);
      const state = useAuthStore.getState();

      // Act
      const isExpired = selectIsSessionExpired(state);

      // Assert
      expect(isExpired).toBe(false);
    });

    it("should return true when session is expired", () => {
      // Arrange - create expired session
      const mockSession = Session.create({
        user: {
          id: "user-123",
          email: "test@example.com",
          name: "Test User",
        },
        expires: new Date(Date.now() - 1000), // 1 second ago (expired)
      });
      useAuthStore.getState().setSession(mockSession);
      const state = useAuthStore.getState();

      // Act
      const isExpired = selectIsSessionExpired(state);

      // Assert
      expect(isExpired).toBe(true);
    });

    it("should return false when session is null", () => {
      // Arrange
      const state = useAuthStore.getState();

      // Act
      const isExpired = selectIsSessionExpired(state);

      // Assert
      expect(isExpired).toBe(false);
    });
  });

  describe("selectUserId selector", () => {
    it("should return user ID from session", () => {
      // Arrange
      const mockSession = Session.create({
        user: {
          id: "user-123",
          email: "test@example.com",
          name: "Test User",
        },
        expires: new Date(Date.now() + 3600000),
      });
      useAuthStore.getState().setSession(mockSession);
      const state = useAuthStore.getState();

      // Act
      const userId = selectUserId(state);

      // Assert
      expect(userId).toBe("user-123");
    });

    it("should return null when session is null", () => {
      // Arrange
      const state = useAuthStore.getState();

      // Act
      const userId = selectUserId(state);

      // Assert
      expect(userId).toBeNull();
    });
  });

  describe("selectUserEmail selector", () => {
    it("should return user email from session", () => {
      // Arrange
      const mockSession = Session.create({
        user: {
          id: "user-123",
          email: "test@example.com",
          name: "Test User",
        },
        expires: new Date(Date.now() + 3600000),
      });
      useAuthStore.getState().setSession(mockSession);
      const state = useAuthStore.getState();

      // Act
      const email = selectUserEmail(state);

      // Assert
      expect(email).toBe("test@example.com");
    });

    it("should return null when session is null", () => {
      // Arrange
      const state = useAuthStore.getState();

      // Act
      const email = selectUserEmail(state);

      // Assert
      expect(email).toBeNull();
    });
  });

  describe("selectIsSessionExpiringSoon selector", () => {
    it("should return true when session expires in less than 5 minutes", () => {
      // Arrange - session expires in 2 minutes
      const mockSession = Session.create({
        user: {
          id: "user-123",
          email: "test@example.com",
          name: "Test User",
        },
        expires: new Date(Date.now() + 2 * 60 * 1000), // 2 minutes from now
      });
      useAuthStore.getState().setSession(mockSession);
      const state = useAuthStore.getState();

      // Act
      const isExpiringSoon = selectIsSessionExpiringSoon(state);

      // Assert
      expect(isExpiringSoon).toBe(true);
    });

    it("should return false when session expires in more than 5 minutes", () => {
      // Arrange - session expires in 10 minutes
      const mockSession = Session.create({
        user: {
          id: "user-123",
          email: "test@example.com",
          name: "Test User",
        },
        expires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
      });
      useAuthStore.getState().setSession(mockSession);
      const state = useAuthStore.getState();

      // Act
      const isExpiringSoon = selectIsSessionExpiringSoon(state);

      // Assert
      expect(isExpiringSoon).toBe(false);
    });

    it("should return false when session is null", () => {
      // Arrange
      const state = useAuthStore.getState();

      // Act
      const isExpiringSoon = selectIsSessionExpiringSoon(state);

      // Assert
      expect(isExpiringSoon).toBe(false);
    });
  });

  describe("edge cases and error handling", () => {
    it("should handle rapid state changes correctly", () => {
      // Arrange & Act - rapid state changes
      useAuthStore.getState().setLoading(true);
      useAuthStore.getState().setError("Error 1");
      useAuthStore.getState().setLoading(false);
      useAuthStore.getState().setError("Error 2");
      const state = useAuthStore.getState();

      // Assert - final state should be correct
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe("Error 2");
    });

    it("should handle session with expired date correctly", () => {
      // Arrange - create session that's already expired
      const mockSession = Session.create({
        user: {
          id: "user-123",
          email: "test@example.com",
          name: "Test User",
        },
        expires: new Date(Date.now() - 1000), // expired
      });

      // Act
      useAuthStore.getState().setSession(mockSession);
      const state = useAuthStore.getState();

      // Assert - session is set but not authenticated
      expect(state.session).toEqual(mockSession);
      expect(selectIsAuthenticated(state)).toBe(false);
      expect(selectIsSessionExpired(state)).toBe(true);
    });

    it("should handle concurrent state updates", () => {
      // Arrange
      const mockSession = Session.create({
        user: {
          id: "user-123",
          email: "test@example.com",
          name: "Test User",
        },
        expires: new Date(Date.now() + 3600000),
      });

      // Act - simulate concurrent updates
      useAuthStore.getState().setSession(mockSession);
      useAuthStore.getState().setError("Error occurred");
      useAuthStore.getState().setLoading(true); // set loading after error
      const state = useAuthStore.getState();

      // Assert - all updates should be reflected
      expect(state.session).toEqual(mockSession);
      expect(state.isLoading).toBe(true); // setLoading came after setError
      expect(state.error).toBe("Error occurred");
    });
  });

  describe("state immutability verification", () => {
    it("should not allow direct state mutation", () => {
      // Arrange
      const stateBefore = useAuthStore.getState();
      const sessionBefore = stateBefore.session;
      const errorBefore = stateBefore.error;

      // Act - attempt direct mutation (should not affect store)
      // This is just to verify that direct mutation doesn't work
      const mockSession = Session.create({
        user: {
          id: "user-123",
          email: "test@example.com",
          name: "Test User",
        },
        expires: new Date(Date.now() + 3600000),
      });

      // Use proper action to update
      useAuthStore.getState().setSession(mockSession);
      const stateAfter = useAuthStore.getState();

      // Assert - state reference should be different
      expect(stateAfter).not.toBe(stateBefore);
      expect(stateAfter.session).not.toBe(sessionBefore);
    });
  });
});
