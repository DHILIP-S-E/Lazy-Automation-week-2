import axios, { AxiosError } from 'axios';
import type { GmailMessage } from '../../types/email';
import type { EmailFetcher as IEmailFetcher } from '../../types/modules';
import { GMAIL_API_BASE } from '../../constants';

interface GmailListResponse {
  messages?: { id: string; threadId: string }[];
  nextPageToken?: string;
  resultSizeEstimate?: number;
}

export class EmailFetcherError extends Error {
  readonly code: string;
  readonly retryable: boolean;

  constructor(message: string, code: string, retryable: boolean = false) {
    super(message);
    this.name = 'EmailFetcherError';
    this.code = code;
    this.retryable = retryable;
  }
}

export class EmailFetcher implements IEmailFetcher {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private getHeaders() {
    return {
      Authorization: `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  async fetchMessageIds(maxResults: number = 50): Promise<string[]> {
    try {
      const response = await axios.get<GmailListResponse>(
        `${GMAIL_API_BASE}/users/me/messages`,
        {
          headers: this.getHeaders(),
          params: { maxResults },
        }
      );

      if (!response.data.messages) {
        return [];
      }

      return response.data.messages.map((msg) => msg.id);
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch message IDs');
    }
  }

  async fetchMessageDetails(messageId: string): Promise<GmailMessage> {
    try {
      const response = await axios.get<GmailMessage>(
        `${GMAIL_API_BASE}/users/me/messages/${messageId}`,
        {
          headers: this.getHeaders(),
          params: { format: 'full' },
        }
      );

      return response.data;
    } catch (error) {
      throw this.handleError(error, `Failed to fetch message ${messageId}`);
    }
  }


  async fetchBatch(
    messageIds: string[],
    onProgress?: (fetched: number, total: number) => void
  ): Promise<GmailMessage[]> {
    if (messageIds.length === 0) {
      return [];
    }

    const results: GmailMessage[] = [];
    const batchSize = 5; // Fetch 5 at a time to avoid rate limits
    const delayMs = 200; // 200ms delay between batches

    for (let i = 0; i < messageIds.length; i += batchSize) {
      const batch = messageIds.slice(i, i + batchSize);
      
      try {
        const batchResults = await Promise.all(
          batch.map((id) => this.fetchMessageDetails(id))
        );
        results.push(...batchResults);
        
        onProgress?.(results.length, messageIds.length);
        
        // Add delay between batches (except for the last one)
        if (i + batchSize < messageIds.length) {
          await this.delay(delayMs);
        }
      } catch (error) {
        // If we hit rate limit, wait longer and retry the batch
        if (this.isRateLimitError(error)) {
          await this.delay(1000); // Wait 1 second
          i -= batchSize; // Retry this batch
          continue;
        }
        throw this.handleError(error, 'Failed to fetch batch messages');
      }
    }

    return results;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private isRateLimitError(error: unknown): boolean {
    if (axios.isAxiosError(error)) {
      return error.response?.status === 429;
    }
    return false;
  }

  private handleError(error: unknown, defaultMessage: string): EmailFetcherError {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ error?: { message?: string; code?: number } }>;
      const status = axiosError.response?.status;
      const apiMessage = axiosError.response?.data?.error?.message;

      if (status === 401) {
        return new EmailFetcherError(
          'Authentication expired. Please login again.',
          'AUTH_EXPIRED',
          false
        );
      }

      if (status === 429) {
        return new EmailFetcherError(
          'Too many requests. Please wait before trying again.',
          'RATE_LIMITED',
          true
        );
      }

      if (status === 403) {
        return new EmailFetcherError(
          'Access denied. Please check permissions.',
          'ACCESS_DENIED',
          false
        );
      }

      if (status && status >= 500) {
        return new EmailFetcherError(
          'Gmail service temporarily unavailable.',
          'SERVICE_ERROR',
          true
        );
      }

      if (axiosError.code === 'ECONNABORTED' || axiosError.code === 'ETIMEDOUT') {
        return new EmailFetcherError(
          'Request timed out. Please try again.',
          'TIMEOUT',
          true
        );
      }

      if (!axiosError.response) {
        return new EmailFetcherError(
          'Network error. Please check your connection.',
          'NETWORK_ERROR',
          true
        );
      }

      return new EmailFetcherError(
        apiMessage || defaultMessage,
        'API_ERROR',
        false
      );
    }

    return new EmailFetcherError(defaultMessage, 'UNKNOWN_ERROR', false);
  }
}

export function createEmailFetcher(accessToken: string): EmailFetcher {
  return new EmailFetcher(accessToken);
}
