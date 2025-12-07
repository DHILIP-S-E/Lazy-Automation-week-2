import { describe, it, expect, vi, beforeEach } from 'vitest';
import fc from 'fast-check';
import axios from 'axios';
import { EmailFetcher, EmailFetcherError } from '../EmailFetcher';
import { GMAIL_API_BASE } from '../../../constants';

vi.mock('axios');

describe('EmailFetcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Property Tests', () => {
    it('Property 5: Complete message fetching', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.uuid(), { minLength: 1, maxLength: 10 }),
          async (messageIds) => {
            const mockMessages = messageIds.map((id) => ({
              id,
              threadId: fc.sample(fc.uuid(), 1)[0],
              payload: { headers: [], body: { data: '' } },
            }));

            vi.mocked(axios.get).mockImplementation((url: string) => {
              if (url.includes('/messages/')) {
                const id = url.split('/').pop()?.split('?')[0];
                const msg = mockMessages.find((m) => m.id === id);
                return Promise.resolve({ data: msg });
              }
              return Promise.resolve({ data: { messages: [] } });
            });

            const fetcher = new EmailFetcher('test-token');
            const results = await fetcher.fetchBatch(messageIds);

            expect(results).toHaveLength(messageIds.length);
            expect(results.every((r) => messageIds.includes(r.id))).toBe(true);
          }
        ),
        { numRuns: 10 }
      );
    });
  });

  describe('Unit Tests', () => {
    it('calls Gmail API with correct parameters', async () => {
      vi.mocked(axios.get).mockResolvedValue({
        data: { messages: [{ id: '123', threadId: 'abc' }] },
      });

      const fetcher = new EmailFetcher('test-token');
      await fetcher.fetchMessageIds(50);

      expect(axios.get).toHaveBeenCalledWith(
        `${GMAIL_API_BASE}/users/me/messages`,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
          params: { maxResults: 50 },
        })
      );
    });

    it('fetches batch of messages', async () => {
      const messageIds = ['id1', 'id2', 'id3'];
      vi.mocked(axios.get).mockImplementation((url: string) => {
        const id = url.split('/').pop()?.split('?')[0];
        return Promise.resolve({
          data: { id, threadId: 'thread', payload: { headers: [], body: {} } },
        });
      });

      const fetcher = new EmailFetcher('test-token');
      const results = await fetcher.fetchBatch(messageIds);

      expect(results).toHaveLength(3);
    });

    it('handles network failures', async () => {
      vi.mocked(axios.get).mockRejectedValue({
        isAxiosError: true,
        code: 'ECONNABORTED',
      });

      const fetcher = new EmailFetcher('test-token');

      await expect(fetcher.fetchMessageIds()).rejects.toThrow(EmailFetcherError);
    });

    it('returns empty array when no messages exist', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: {} });

      const fetcher = new EmailFetcher('test-token');
      const ids = await fetcher.fetchMessageIds();

      expect(ids).toEqual([]);
    });
  });
});
