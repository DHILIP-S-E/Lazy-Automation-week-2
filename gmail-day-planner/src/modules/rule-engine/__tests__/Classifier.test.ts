import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { Classifier } from '../Classifier';
import {
  billsEmailGenerator,
  jobsEmailGenerator,
  meetingsEmailGenerator,
  otpEmailGenerator,
  attachmentEmailGenerator,
  emailGenerator,
} from '../../../test-utils/generators';
import type { ParsedEmail } from '../../../types/email';

describe('Classifier', () => {
  const classifier = new Classifier();

  describe('Property Tests', () => {
    it('Property 7: Bills keyword classification', () => {
      fc.assert(
        fc.property(billsEmailGenerator, (email) => {
          const category = classifier.classify(email);
          expect(['Bills', 'OTP']).toContain(category);
        })
      );
    });

    it('Property 8: Jobs keyword classification', () => {
      fc.assert(
        fc.property(jobsEmailGenerator, (email) => {
          const category = classifier.classify(email);
          expect(['Jobs', 'OTP']).toContain(category);
        })
      );
    });

    it('Property 9: Meetings keyword classification', () => {
      fc.assert(
        fc.property(meetingsEmailGenerator, (email) => {
          const category = classifier.classify(email);
          expect(['Meetings', 'OTP']).toContain(category);
        })
      );
    });

    it('Property 10: OTP pattern classification', () => {
      fc.assert(
        fc.property(otpEmailGenerator, (email) => {
          const category = classifier.classify(email);
          expect(category).toBe('OTP');
        })
      );
    });

    it('Property 11: Attachment classification', () => {
      fc.assert(
        fc.property(attachmentEmailGenerator, (email) => {
          const category = classifier.classify(email);
          expect(['Attachments', 'OTP']).toContain(category);
        })
      );
    });

    it('Property 13: Single category assignment', () => {
      fc.assert(
        fc.property(emailGenerator, (email) => {
          const category = classifier.classify(email);
          expect(typeof category).toBe('string');
          expect(category.length).toBeGreaterThan(0);
        })
      );
    });
  });

  describe('Unit Tests', () => {
    const createEmail = (overrides: Partial<ParsedEmail>): ParsedEmail => ({
      id: 'test-id',
      subject: '',
      from: 'test@example.com',
      to: 'user@example.com',
      date: new Date(),
      snippet: '',
      plainText: '',
      htmlText: '',
      attachments: [],
      ...overrides,
    });

    it('classifies bill emails correctly', () => {
      const email = createEmail({ subject: 'Your invoice for December' });
      expect(classifier.classify(email)).toBe('Bills');
    });

    it('classifies job emails correctly', () => {
      const email = createEmail({ plainText: 'We are hiring for a backend position' });
      expect(classifier.classify(email)).toBe('Jobs');
    });

    it('classifies meeting emails correctly', () => {
      const email = createEmail({ plainText: 'Join meeting at https://meet.google.com/abc' });
      expect(classifier.classify(email)).toBe('Meetings');
    });

    it('classifies OTP emails correctly', () => {
      const email = createEmail({ plainText: 'Your code is 123456' });
      expect(classifier.classify(email)).toBe('OTP');
    });

    it('classifies emails with attachments', () => {
      const email = createEmail({
        attachments: [{ filename: 'doc.pdf', mimeType: 'application/pdf', size: 1000 }],
      });
      expect(classifier.classify(email)).toBe('Attachments');
    });

    it('defaults to Other for emails without keywords', () => {
      const email = createEmail({
        subject: 'Hello friend',
        plainText: 'Just checking in',
      });
      expect(classifier.classify(email)).toBe('Other');
    });

    it('prioritizes OTP over other categories', () => {
      const email = createEmail({
        subject: 'Invoice payment',
        plainText: 'Your code is 987654',
      });
      expect(classifier.classify(email)).toBe('OTP');
    });
  });
});
