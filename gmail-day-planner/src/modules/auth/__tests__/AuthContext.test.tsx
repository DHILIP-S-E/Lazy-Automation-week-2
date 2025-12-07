import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import fc from 'fast-check';
import { AuthProvider, useAuth } from '../AuthContext';
import { OAUTH_SCOPES } from '../../../constants';

const mockLogin = vi.fn();

vi.mock('@react-oauth/google', () => ({
  GoogleOAuthProvider: ({ children }: any) => children,
  useGoogleLogin: (config: any) => {
    mockLogin.mockImplementation(() => {
      config.onSuccess({ access_token: 'mock-token-123' });
    });
    return mockLogin;
  },
}));

describe('AuthContext', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'test-client-id');
    mockLogin.mockClear();
  });

  describe('Property Tests', () => {
    it('Property 2: OAuth scope must be read-only', () => {
      fc.assert(
        fc.property(fc.constant(OAUTH_SCOPES), (scopes) => {
          expect(scopes).toContain('https://www.googleapis.com/auth/gmail.readonly');
          expect(scopes.every(s => !s.includes('modify') && !s.includes('send'))).toBe(true);
        })
      );
    });

    it('Property 1: Token stored in memory only', () => {
      const wrapper = ({ children }: any) => <AuthProvider>{children}</AuthProvider>;
      const { result } = renderHook(() => useAuth(), { wrapper });

      act(() => {
        result.current.initiateLogin();
      });

      expect(localStorage.getItem('authToken')).toBeNull();
      expect(sessionStorage.getItem('authToken')).toBeNull();
      expect(result.current.getAccessToken()).toBeTruthy();
    });

    it('Property 4: Memory cleanup on unmount', async () => {
      const wrapper = ({ children }: any) => <AuthProvider>{children}</AuthProvider>;
      const { result, unmount } = renderHook(() => useAuth(), { wrapper });

      act(() => {
        result.current.initiateLogin();
      });

      const tokenBeforeUnmount = result.current.getAccessToken();
      expect(tokenBeforeUnmount).toBeTruthy();

      unmount();

      await waitFor(() => {
        expect(localStorage.getItem('authToken')).toBeNull();
      });
    });
  });

  describe('Unit Tests', () => {
    it('initiates OAuth flow on login', () => {
      const wrapper = ({ children }: any) => <AuthProvider>{children}</AuthProvider>;
      const { result } = renderHook(() => useAuth(), { wrapper });

      act(() => {
        result.current.initiateLogin();
      });

      expect(mockLogin).toHaveBeenCalled();
    });

    it('retrieves access token after login', () => {
      const wrapper = ({ children }: any) => <AuthProvider>{children}</AuthProvider>;
      const { result } = renderHook(() => useAuth(), { wrapper });

      act(() => {
        result.current.initiateLogin();
      });

      expect(result.current.getAccessToken()).toBe('mock-token-123');
    });

    it('clears token on logout', () => {
      const wrapper = ({ children }: any) => <AuthProvider>{children}</AuthProvider>;
      const { result } = renderHook(() => useAuth(), { wrapper });

      act(() => {
        result.current.initiateLogin();
      });

      expect(result.current.isAuthenticated()).toBe(true);

      act(() => {
        result.current.logout();
      });

      expect(result.current.isAuthenticated()).toBe(false);
      expect(result.current.getAccessToken()).toBeNull();
    });
  });
});
