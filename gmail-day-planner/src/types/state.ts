import type { ProcessedEmail, EmailSummary } from './email';

// Application state
export interface AppState {
  authToken: string | null;
  userEmail: string | null;
  emails: ProcessedEmail[];
  summary: EmailSummary | null;
  isLoading: boolean;
  error: string | null;
}

// State actions
export type AppAction =
  | { type: 'SET_AUTH'; payload: { token: string; email: string } }
  | { type: 'CLEAR_AUTH' }
  | { type: 'SET_EMAILS'; payload: ProcessedEmail[] }
  | { type: 'SET_SUMMARY'; payload: EmailSummary }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ALL' };
