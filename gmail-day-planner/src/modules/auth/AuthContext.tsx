import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import { OAUTH_SCOPES } from '../../constants';
import type { AuthModule } from '../../types';

interface AuthContextType extends AuthModule {
  userEmail: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderInnerProps {
  children: React.ReactNode;
}

function AuthProviderInner({ children }: AuthProviderInnerProps) {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setAuthToken(tokenResponse.access_token);

      // Fetch user email
      try {
        const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        });
        const data = await response.json();
        setUserEmail(data.email);
      } catch (error) {
        // Silent fail for email fetch
      }
    },
    onError: () => {
      // Login failed - user can retry
    },
    scope: OAUTH_SCOPES.join(' '),
    flow: 'implicit',
  });

  const initiateLogin = useCallback(async () => {
    login();
  }, [login]);

  const getAccessToken = useCallback(() => {
    return authToken;
  }, [authToken]);

  const isAuthenticated = useCallback(() => {
    return authToken !== null;
  }, [authToken]);

  const logout = useCallback(() => {
    setAuthToken(null);
    setUserEmail(null);
    sessionStorage.clear();
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.clear();
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      setAuthToken(null);
      setUserEmail(null);
      sessionStorage.clear();
    };
  }, []);

  const value: AuthContextType = {
    initiateLogin,
    getAccessToken,
    isAuthenticated,
    logout,
    userEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!clientId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">
          Error: VITE_GOOGLE_CLIENT_ID is not set. Please check your .env file.
        </div>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <AuthProviderInner>{children}</AuthProviderInner>
    </GoogleOAuthProvider>
  );
}
