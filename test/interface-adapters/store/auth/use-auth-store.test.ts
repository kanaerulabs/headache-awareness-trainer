/**
 * @jest-environment jsdom
 *
 * Auth Store Custom Hooks Unit Tests
 *
 * Tests for custom hooks that provide optimized selectors for auth store.
 * These hooks prevent unnecessary re-renders by selecting only needed state.
 *
 * Test Coverage:
 * - useSession hook
 * - useUser hook
 * - useIsAuthenticated hook
 * - useAuthLoading hook
 * - useAuthError hook
 * - useIsSessionExpired hook
 * - useUserId hook
 * - useUserEmail hook
 * - useIsSessionExpiringSoon hook
 * - useAuthActions hook
 * - useAuth hook
 */

import { renderHook, act } from "@testing-library/react";
import {
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
} from "@/interface-adapters/store/auth/use-auth-store";
import { useAuthStore } from "@/interface-adapters/store/auth/auth.store";
import { Session } from "@/domains/auth/value-objects/session.vo";

describe("Auth Store Custom Hooks", () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useAuthStore.getState().reset();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("useSession hook", () => {
    it("should return null when no session exists", () => {
      // Act
      const { result } = renderHook(() => useSession());

      // Assert
      expect(result.current).toBeNull();
    });

    it("should return session when session exists", () => {
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

      // Act
      const { result } = renderHook(() => useSession());

      // Assert
      expect(result.current).toEqual(mockSession);
      expect(result.current?.user.id).toBe("user-123");
    });

    it("should update when session changes", () => {
      // Arrange
      const { result } = renderHook(() => useSession());

      // Act - set session
      const mockSession = Session.create({
        user: {
          id: "user-123",
          email: "test@example.com",
          name: "Test User",
        },
        expires: new Date(Date.now() + 3600000),
      });
      act(() => {
        useAuthStore.getState().setSession(mockSession);
      });

      // Assert
      expect(result.current).toEqual(mockSession);
    });
  });

  describe("useUser hook", () => {
    it("should return null when no session exists", () => {
      // Act
      const { result } = renderHook(() => useUser());

      // Assert
      expect(result.current).toBeNull();
    });

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

      // Act
      const { result } = renderHook(() => useUser());

      // Assert
      expect(result.current).toBeDefined();
      expect(result.current?.id).toBe("user-123");
      expect(result.current?.email).toBe("test@example.com");
      expect(result.current?.name).toBe("Test User");
    });

    it("should update when session changes", () => {
      // Arrange
      const { result } = renderHook(() => useUser());

      // Act - set session
      const mockSession = Session.create({
        user: {
          id: "user-456",
          email: "new@example.com",
          name: "New User",
        },
        expires: new Date(Date.now() + 3600000),
      });
      act(() => {
        useAuthStore.getState().setSession(mockSession);
      });

      // Assert
      expect(result.current?.id).toBe("user-456");
      expect(result.current?.email).toBe("new@example.com");
    });
  });

  describe("useIsAuthenticated hook", () => {
    it("should return false when no session exists", () => {
      // Act
      const { result } = renderHook(() => useIsAuthenticated());

      // Assert
      expect(result.current).toBe(false);
    });

    it("should return true when valid session exists", () => {
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

      // Act
      const { result } = renderHook(() => useIsAuthenticated());

      // Assert
      expect(result.current).toBe(true);
    });

    it("should return false when session is expired", () => {
      // Arrange
      const mockSession = Session.create({
        user: {
          id: "user-123",
          email: "test@example.com",
          name: "Test User",
        },
        expires: new Date(Date.now() - 1000), // expired
      });
      useAuthStore.getState().setSession(mockSession);

      // Act
      const { result } = renderHook(() => useIsAuthenticated());

      // Assert
      expect(result.current).toBe(false);
    });

    it("should update when authentication state changes", () => {
      // Arrange
      const { result } = renderHook(() => useIsAuthenticated());
      expect(result.current).toBe(false);

      // Act - login
      const mockSession = Session.create({
        user: {
          id: "user-123",
          email: "test@example.com",
          name: "Test User",
        },
        expires: new Date(Date.now() + 3600000),
      });
      act(() => {
        useAuthStore.getState().setSession(mockSession);
      });

      // Assert
      expect(result.current).toBe(true);

      // Act - logout
      act(() => {
        useAuthStore.getState().setSession(null);
      });

      // Assert
      expect(result.current).toBe(false);
    });
  });

  describe("useAuthLoading hook", () => {
    it("should return false initially", () => {
      // Act
      const { result } = renderHook(() => useAuthLoading());

      // Assert
      expect(result.current).toBe(false);
    });

    it("should return true when loading", () => {
      // Arrange
      useAuthStore.getState().setLoading(true);

      // Act
      const { result } = renderHook(() => useAuthLoading());

      // Assert
      expect(result.current).toBe(true);
    });

    it("should update when loading state changes", () => {
      // Arrange
      const { result } = renderHook(() => useAuthLoading());

      // Act - start loading
      act(() => {
        useAuthStore.getState().setLoading(true);
      });

      // Assert
      expect(result.current).toBe(true);

      // Act - stop loading
      act(() => {
        useAuthStore.getState().setLoading(false);
      });

      // Assert
      expect(result.current).toBe(false);
    });
  });

  describe("useAuthError hook", () => {
    it("should return null initially", () => {
      // Act
      const { result } = renderHook(() => useAuthError());

      // Assert
      expect(result.current).toBeNull();
    });

    it("should return error message when error exists", () => {
      // Arrange
      useAuthStore.getState().setError("Authentication failed");

      // Act
      const { result } = renderHook(() => useAuthError());

      // Assert
      expect(result.current).toBe("Authentication failed");
    });

    it("should update when error changes", () => {
      // Arrange
      const { result } = renderHook(() => useAuthError());

      // Act - set error
      act(() => {
        useAuthStore.getState().setError("Network error");
      });

      // Assert
      expect(result.current).toBe("Network error");

      // Act - clear error
      act(() => {
        useAuthStore.getState().clearError();
      });

      // Assert
      expect(result.current).toBeNull();
    });
  });

  describe("useIsSessionExpired hook", () => {
    it("should return false when no session exists", () => {
      // Act
      const { result } = renderHook(() => useIsSessionExpired());

      // Assert
      expect(result.current).toBe(false);
    });

    it("should return true when session is expired", () => {
      // Arrange
      const mockSession = Session.create({
        user: {
          id: "user-123",
          email: "test@example.com",
          name: "Test User",
        },
        expires: new Date(Date.now() - 1000), // expired
      });
      useAuthStore.getState().setSession(mockSession);

      // Act
      const { result } = renderHook(() => useIsSessionExpired());

      // Assert
      expect(result.current).toBe(true);
    });

    it("should return false when session is valid", () => {
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

      // Act
      const { result } = renderHook(() => useIsSessionExpired());

      // Assert
      expect(result.current).toBe(false);
    });
  });

  describe("useUserId hook", () => {
    it("should return null when no session exists", () => {
      // Act
      const { result } = renderHook(() => useUserId());

      // Assert
      expect(result.current).toBeNull();
    });

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

      // Act
      const { result } = renderHook(() => useUserId());

      // Assert
      expect(result.current).toBe("user-123");
    });

    it("should update when session changes", () => {
      // Arrange
      const { result } = renderHook(() => useUserId());

      // Act - set first session
      const mockSession1 = Session.create({
        user: {
          id: "user-123",
          email: "test1@example.com",
          name: "Test User 1",
        },
        expires: new Date(Date.now() + 3600000),
      });
      act(() => {
        useAuthStore.getState().setSession(mockSession1);
      });

      // Assert
      expect(result.current).toBe("user-123");

      // Act - set second session
      const mockSession2 = Session.create({
        user: {
          id: "user-456",
          email: "test2@example.com",
          name: "Test User 2",
        },
        expires: new Date(Date.now() + 3600000),
      });
      act(() => {
        useAuthStore.getState().setSession(mockSession2);
      });

      // Assert
      expect(result.current).toBe("user-456");
    });
  });

  describe("useUserEmail hook", () => {
    it("should return null when no session exists", () => {
      // Act
      const { result } = renderHook(() => useUserEmail());

      // Assert
      expect(result.current).toBeNull();
    });

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

      // Act
      const { result } = renderHook(() => useUserEmail());

      // Assert
      expect(result.current).toBe("test@example.com");
    });

    it("should update when session changes", () => {
      // Arrange
      const { result } = renderHook(() => useUserEmail());

      // Act - set session
      const mockSession = Session.create({
        user: {
          id: "user-123",
          email: "new@example.com",
          name: "Test User",
        },
        expires: new Date(Date.now() + 3600000),
      });
      act(() => {
        useAuthStore.getState().setSession(mockSession);
      });

      // Assert
      expect(result.current).toBe("new@example.com");
    });
  });

  describe("useIsSessionExpiringSoon hook", () => {
    it("should return false when no session exists", () => {
      // Act
      const { result } = renderHook(() => useIsSessionExpiringSoon());

      // Assert
      expect(result.current).toBe(false);
    });

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

      // Act
      const { result } = renderHook(() => useIsSessionExpiringSoon());

      // Assert
      expect(result.current).toBe(true);
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

      // Act
      const { result } = renderHook(() => useIsSessionExpiringSoon());

      // Assert
      expect(result.current).toBe(false);
    });
  });

  describe("useAuthActions hook", () => {
    it("should return all action methods", () => {
      // Act
      const { result } = renderHook(() => useAuthActions());

      // Assert
      expect(result.current.setSession).toBeDefined();
      expect(result.current.setLoading).toBeDefined();
      expect(result.current.setError).toBeDefined();
      expect(result.current.clearError).toBeDefined();
      expect(result.current.reset).toBeDefined();
    });

    it("should allow setting session via returned actions", () => {
      // Arrange
      const { result } = renderHook(() => useAuthActions());
      const mockSession = Session.create({
        user: {
          id: "user-123",
          email: "test@example.com",
          name: "Test User",
        },
        expires: new Date(Date.now() + 3600000),
      });

      // Act
      act(() => {
        result.current.setSession(mockSession);
      });

      // Assert
      const state = useAuthStore.getState();
      expect(state.session).toEqual(mockSession);
    });

    it("should allow setting loading via returned actions", () => {
      // Arrange
      const { result } = renderHook(() => useAuthActions());

      // Act
      act(() => {
        result.current.setLoading(true);
      });

      // Assert
      const state = useAuthStore.getState();
      expect(state.isLoading).toBe(true);
    });

    it("should allow setting error via returned actions", () => {
      // Arrange
      const { result } = renderHook(() => useAuthActions());

      // Act
      act(() => {
        result.current.setError("Authentication failed");
      });

      // Assert
      const state = useAuthStore.getState();
      expect(state.error).toBe("Authentication failed");
    });

    it("should allow clearing error via returned actions", () => {
      // Arrange
      const { result } = renderHook(() => useAuthActions());
      useAuthStore.getState().setError("Some error");

      // Act
      act(() => {
        result.current.clearError();
      });

      // Assert
      const state = useAuthStore.getState();
      expect(state.error).toBeNull();
    });

    it("should allow resetting store via returned actions", () => {
      // Arrange
      const { result } = renderHook(() => useAuthActions());
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
      useAuthStore.getState().setError("Error");

      // Act
      act(() => {
        result.current.reset();
      });

      // Assert
      const state = useAuthStore.getState();
      expect(state.session).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe("useAuth hook", () => {
    it("should return complete auth state and actions", () => {
      // Act
      const { result } = renderHook(() => useAuth());

      // Assert
      expect(result.current.session).toBeDefined();
      expect(result.current.isLoading).toBeDefined();
      expect(result.current.error).toBeDefined();
      expect(result.current.setSession).toBeDefined();
      expect(result.current.setLoading).toBeDefined();
      expect(result.current.setError).toBeDefined();
      expect(result.current.clearError).toBeDefined();
      expect(result.current.reset).toBeDefined();
    });

    it("should reflect complete state", () => {
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
      useAuthStore.getState().setError("Some error");
      // Set loading after error since setError sets loading to false
      useAuthStore.getState().setLoading(true);

      // Act
      const { result } = renderHook(() => useAuth());

      // Assert
      expect(result.current.session).toEqual(mockSession);
      expect(result.current.isLoading).toBe(true);
      expect(result.current.error).toBe("Some error");
    });

    it("should allow updating state through returned actions", () => {
      // Arrange
      const { result } = renderHook(() => useAuth());

      // Act - set loading
      act(() => {
        result.current.setLoading(true);
      });

      // Assert
      expect(result.current.isLoading).toBe(true);

      // Act - set error
      act(() => {
        result.current.setError("Failed");
      });

      // Assert
      expect(result.current.error).toBe("Failed");
      expect(result.current.isLoading).toBe(false); // setError stops loading
    });
  });

  describe("hook re-render optimization", () => {
    it("useSession should only re-render when session changes", () => {
      // Arrange
      const { result } = renderHook(() => useSession());
      const initialRender = result.current;

      // Act - change loading (should not trigger re-render for useSession)
      act(() => {
        useAuthStore.getState().setLoading(true);
      });

      // Assert - reference should be same (no re-render)
      expect(result.current).toBe(initialRender);
    });

    it("useIsAuthenticated should only re-render when session validity changes", () => {
      // Arrange
      const { result } = renderHook(() => useIsAuthenticated());
      const initialValue = result.current;

      // Act - change loading (should not affect authentication status)
      act(() => {
        useAuthStore.getState().setLoading(true);
      });

      // Assert - value should be same
      expect(result.current).toBe(initialValue);
    });

    it("useAuthLoading should only re-render when loading changes", () => {
      // Arrange
      const { result } = renderHook(() => useAuthLoading());
      const initialValue = result.current;

      // Act - change error (should not trigger re-render for useAuthLoading)
      act(() => {
        useAuthStore.getState().setError("Some error");
      });

      // Assert - value should be same
      expect(result.current).toBe(initialValue);
    });
  });

  describe("edge cases", () => {
    it("should handle session being set to null after being set", () => {
      // Arrange
      const { result: sessionResult } = renderHook(() => useSession());
      const { result: userResult } = renderHook(() => useUser());
      const { result: authResult } = renderHook(() => useIsAuthenticated());

      const mockSession = Session.create({
        user: {
          id: "user-123",
          email: "test@example.com",
          name: "Test User",
        },
        expires: new Date(Date.now() + 3600000),
      });

      // Act - set session
      act(() => {
        useAuthStore.getState().setSession(mockSession);
      });

      // Assert
      expect(sessionResult.current).toEqual(mockSession);
      expect(userResult.current?.id).toBe("user-123");
      expect(authResult.current).toBe(true);

      // Act - clear session
      act(() => {
        useAuthStore.getState().setSession(null);
      });

      // Assert
      expect(sessionResult.current).toBeNull();
      expect(userResult.current).toBeNull();
      expect(authResult.current).toBe(false);
    });

    it("should handle multiple hooks reading same state simultaneously", () => {
      // Arrange
      const { result: hook1 } = renderHook(() => useSession());
      const { result: hook2 } = renderHook(() => useSession());
      const { result: hook3 } = renderHook(() => useUser());

      const mockSession = Session.create({
        user: {
          id: "user-123",
          email: "test@example.com",
          name: "Test User",
        },
        expires: new Date(Date.now() + 3600000),
      });

      // Act
      act(() => {
        useAuthStore.getState().setSession(mockSession);
      });

      // Assert - all hooks should see same state
      expect(hook1.current).toEqual(mockSession);
      expect(hook2.current).toEqual(mockSession);
      expect(hook3.current?.id).toBe("user-123");
    });
  });
});
