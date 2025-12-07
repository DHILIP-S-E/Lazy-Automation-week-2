import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { EmailParser } from '../EmailParser';
import { gmailMessageGenerator } from '../../../test-utils/generators';
import type { GmailMessage } from '../../../types/email';

describe('EmailParser', () => {
  const parser = new EmailParser();

  describe('Property Tests', () => {
    it('Property 6: Complete email parsing', () => {
      fc.assert(
        fc.property(gmailMessageGenerator, (gmailMessage) => {
          const parsed = parser.parse(gmailMessage);
          expect(parsed.id).toBe(gmailMessage.id);
          expect(parsed.date).toBeInstanceOf(Date);
          expect(parsed).toHaveProperty('subject');
          expect(parsed).toHaveProperty('from');
          expect(parsed).toHaveProperty('attachments');
        })
      );
    });
  });

  describe('Unit Tests', () => {
    it('extracts headers correctly', () => {
      const message: GmailMessage = {
        id: 'test-id',
        threadId: 'thread-id',
        payload: {
          headers: [
            { name: 'Subject', value: 'Test Subject' },
            { name: 'From', value: 'sender@example.com' },
            { name: 'To', value: 'receiver@example.com' },
            { name: 'Date', value: 'Mon, 1 Jan 2024 10:00:00 +0000' },
          ],
          body: { data: btoa('Test body') },
        },
        snippet: 'Test snippet',
        internalDate: '1704096000000',
      };

      const parsed = parser.parse(message);
      expect(parsed.subject).toBe('Test Subject');
      expect(parsed.from).toBe('sender@example.com');
      expect(parsed.to).toBe('receiver@example.com');
    });

    it('decodes base64 body content', () => {
      const message: GmailMessage = {
        id: 'test-id',
        threadId: 'thread-id',
        payload: {
          headers: [{ name: 'Content-Type', value: 'text/plain' }],
          body: { data: btoa('Hello World') },
        },
        snippet: '',
        internalDate: '1704096000000',
      };

      const parsed = parser.parse(message);
      expect(parsed.plainText).toContain('Hello');
    });

    it('handles MIME multipart messages', () => {
      const message: GmailMessage = {
        id: 'test-id',
        threadId: 'thread-id',
        payload: {
          headers: [],
          body: {},
          parts: [
            { mimeType: 'text/plain', body: { data: btoa('Plain text') } },
            { mimeType: 'text/html', body: { data: btoa('<p>HTML</p>') } },
          ],
        },
        snippet: '',
        internalDate: '1704096000000',
      };

      const parsed = parser.parse(message);
      expect(parsed.plainText).toContain('Plain text');
    });

    it('uses snippet as fallback', () => {
      const message: GmailMessage = {
        id: 'test-id',
        threadId: 'thread-id',
        payload: { headers: [], body: {} },
        snippet: 'Snippet text',
        internalDate: '1704096000000',
      };

      const parsed = parser.parse(message);
      expect(parsed.plainText).toBe('Snippet text');
    });

    it('extracts attachments', () => {
      const message: GmailMessage = {
        id: 'test-id',
        threadId: 'thread-id',
        payload: {
          headers: [],
          body: {},
          parts: [{ filename: 'doc.pdf', mimeType: 'application/pdf', body: { size: 1000 } }],
        },
        snippet: '',
        internalDate: '1704096000000',
      };

      const parsed = parser.parse(message);
      expect(parsed.attachments).toHaveLength(1);
      expect(parsed.attachments[0].filename).toBe('doc.pdf');
    });
  });
});
