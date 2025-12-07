// API validator to enforce read-only access to Gmail

const BLOCKED_ENDPOINTS = [
  '/modify',
  '/trash',
  '/untrash',
  '/delete',
  '/labels',
  '/drafts',
];

const ALLOWED_SEND_ENDPOINT = '/messages/send';

export interface ValidationResult {
  allowed: boolean;
  reason?: string;
}

export class ApiValidator {
  // Validate if an API call is allowed
  validateApiCall(url: string, method: string): ValidationResult {
    const upperMethod = method.toUpperCase();

    // Always allow GET requests to read endpoints
    if (upperMethod === 'GET') {
      return { allowed: true };
    }

    // Allow POST only for sending summary email
    if (upperMethod === 'POST') {
      if (url.includes(ALLOWED_SEND_ENDPOINT)) {
        return { allowed: true };
      }
      return {
        allowed: false,
        reason: 'POST requests are only allowed for sending summary emails',
      };
    }

    // Block all other methods
    if (['DELETE', 'PUT', 'PATCH'].includes(upperMethod)) {
      return {
        allowed: false,
        reason: `${upperMethod} requests are not allowed - read-only access`,
      };
    }

    // Check for blocked endpoints
    for (const endpoint of BLOCKED_ENDPOINTS) {
      if (url.includes(endpoint)) {
        return {
          allowed: false,
          reason: `Access to ${endpoint} is blocked - read-only access`,
        };
      }
    }

    return { allowed: true };
  }

  // Create a validated fetch wrapper
  createValidatedFetch(): typeof fetch {
    const validator = this;
    
    return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const url = typeof input === 'string' ? input : input.toString();
      const method = init?.method || 'GET';

      const validation = validator.validateApiCall(url, method);
      
      if (!validation.allowed) {
        throw new Error(`API call blocked: ${validation.reason}`);
      }

      return fetch(input, init);
    };
  }
}

export const apiValidator = new ApiValidator();

export function createApiValidator(): ApiValidator {
  return new ApiValidator();
}
