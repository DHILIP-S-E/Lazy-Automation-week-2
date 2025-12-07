import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ProcessedEmail, EmailSummary } from '../../types/email';

export interface AppState {
  authToken: string | null;
  userEmail: string | null;
  emails: ProcessedEmail[];
  summary: EmailSummary | null;
  isLoading: boolean;
  error: string | null;
}

interface AppContextValue extends AppState {
  setAuth: (token: string, email: string) => void;
  clearAuth: () => void;
  setEmails: (emails: ProcessedEmail[]) => void;
  setSummary: (summary: EmailSummary | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState: AppState = {
  authToken: null,
  userEmail: null,
  emails: [],
  summary: null,
  isLoading: false,
  error: null,
};

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(initialState);

  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.clear();
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      setState(initialState);
      sessionStorage.clear();
    };
  }, []);

  const setAuth = useCallback((token: string, email: string) => {
    setState((prev) => ({
      ...prev,
      authToken: token,
      userEmail: email,
      error: null,
    }));
  }, []);

  const clearAuth = useCallback(() => {
    setState((prev) => ({
      ...prev,
      authToken: null,
      userEmail: null,
    }));
  }, []);

  const setEmails = useCallback((emails: ProcessedEmail[]) => {
    setState((prev) => ({
      ...prev,
      emails,
      error: null,
    }));
  }, []);


  const setSummary = useCallback((summary: EmailSummary | null) => {
    setState((prev) => ({
      ...prev,
      summary,
    }));
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    setState((prev) => ({
      ...prev,
      isLoading,
    }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState((prev) => ({
      ...prev,
      error,
      isLoading: false,
    }));
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
    sessionStorage.clear();
  }, []);

  const value: AppContextValue = {
    ...state,
    setAuth,
    clearAuth,
    setEmails,
    setSummary,
    setLoading,
    setError,
    reset,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppState = (): AppContextValue => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
