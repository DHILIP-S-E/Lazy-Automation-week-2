import type { ProcessedEmail } from '../../types/email';

// Only favorite/important emails are stored permanently in localStorage
// All other data (emails, searches, session data) is cleared on logout/close
const STORAGE_KEY = 'automail_important_emails';

export class LocalStorage {
  saveImportantEmail(email: ProcessedEmail): void {
    const stored = this.getImportantEmails();
    const exists = stored.find(e => e.id === email.id);
    if (!exists) {
      stored.push(email);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    }
  }

  removeImportantEmail(emailId: string): void {
    const stored = this.getImportantEmails();
    const filtered = stored.filter(e => e.id !== emailId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }

  getImportantEmails(): ProcessedEmail[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return parsed.map((e: any) => ({
        ...e,
        date: new Date(e.date)
      }));
    } catch {
      return [];
    }
  }

  clearAllData(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  isEmailSaved(emailId: string): boolean {
    const stored = this.getImportantEmails();
    return stored.some(e => e.id === emailId);
  }
}

export const localStorage_ = new LocalStorage();
