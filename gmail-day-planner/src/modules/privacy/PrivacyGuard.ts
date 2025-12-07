// Privacy safeguards to ensure no data leaks

const ALLOWED_DOMAINS = ['gmail.googleapis.com', 'accounts.google.com', 'oauth2.googleapis.com'];

export class PrivacyGuard {
  private static instance: PrivacyGuard;
  private originalConsoleLog: typeof console.log;
  private originalConsoleError: typeof console.error;
  private isDevMode: boolean;

  private constructor() {
    this.originalConsoleLog = console.log;
    this.originalConsoleError = console.error;
    this.isDevMode = import.meta.env.DEV;
  }

  static getInstance(): PrivacyGuard {
    if (!PrivacyGuard.instance) {
      PrivacyGuard.instance = new PrivacyGuard();
    }
    return PrivacyGuard.instance;
  }

  // Check if URL is allowed (Gmail API only)
  isAllowedUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return ALLOWED_DOMAINS.some((domain) => urlObj.hostname.includes(domain));
    } catch {
      return false;
    }
  }

  // Validate network request
  validateRequest(url: string, method: string): { allowed: boolean; reason?: string } {
    if (!this.isAllowedUrl(url)) {
      return { allowed: false, reason: `Request to ${url} blocked - not an allowed domain` };
    }

    // Block dangerous methods except for send endpoint
    const isSendEndpoint = url.includes('/messages/send');
    if (['DELETE', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
      return { allowed: false, reason: `${method} requests are not allowed` };
    }

    if (method.toUpperCase() === 'POST' && !isSendEndpoint) {
      return { allowed: false, reason: 'POST requests only allowed for sending summary' };
    }

    return { allowed: true };
  }

  // Check for storage writes (returns true if storage is being used)
  checkStorageUsage(): { localStorage: boolean; sessionStorage: boolean; indexedDB: boolean } {
    return {
      localStorage: typeof localStorage !== 'undefined' && localStorage.length > 0,
      sessionStorage: typeof sessionStorage !== 'undefined' && sessionStorage.length > 0,
      indexedDB: false, // Would need async check
    };
  }


  // Sanitize data before logging (remove email content)
  sanitizeForLogging(data: unknown): unknown {
    if (data === null || data === undefined) return data;
    
    if (typeof data === 'string') {
      // Don't log strings that look like email content
      if (data.length > 100) return '[REDACTED - long string]';
      return data;
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.sanitizeForLogging(item));
    }

    if (typeof data === 'object') {
      const sanitized: Record<string, unknown> = {};
      const sensitiveKeys = ['body', 'plainText', 'htmlText', 'snippet', 'subject', 'from', 'to', 'data'];
      
      for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
        if (sensitiveKeys.includes(key)) {
          sanitized[key] = '[REDACTED]';
        } else {
          sanitized[key] = this.sanitizeForLogging(value);
        }
      }
      return sanitized;
    }

    return data;
  }

  // Override console methods in production to prevent email content logging
  enableConsoleProtection(): void {
    if (this.isDevMode) return; // Allow logging in dev mode

    console.log = (...args: unknown[]) => {
      const sanitized = args.map((arg) => this.sanitizeForLogging(arg));
      this.originalConsoleLog.apply(console, sanitized);
    };

    console.error = (...args: unknown[]) => {
      const sanitized = args.map((arg) => this.sanitizeForLogging(arg));
      this.originalConsoleError.apply(console, sanitized);
    };
  }

  // Restore original console methods
  disableConsoleProtection(): void {
    console.log = this.originalConsoleLog;
    console.error = this.originalConsoleError;
  }

  // Get CSP meta tag content
  getCSPContent(): string {
    return [
      "default-src 'self'",
      "script-src 'self' https://accounts.google.com",
      "style-src 'self' 'unsafe-inline'",
      "connect-src 'self' https://gmail.googleapis.com https://accounts.google.com https://oauth2.googleapis.com",
      "frame-src https://accounts.google.com",
      "img-src 'self' data: https:",
    ].join('; ');
  }
}

export const privacyGuard = PrivacyGuard.getInstance();

export function createPrivacyGuard(): PrivacyGuard {
  return PrivacyGuard.getInstance();
}
