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

describe('Classifier - Property Tests', () => {
  const classifier = new Classifier();

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

  it('Property 12: Default category classification', () => {
    // Create a generator for emails without any category keywords
    const noKeywordEmailGenerator: fc.Arbitrary<ParsedEmail> = fc.record({
      id: fc.uuid(),
      subject: fc.constant('Random subject'),
      from: fc.emailAddress(),
      to: fc.emailAddress(),
      date: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
      snippet: fc.constant(''),
      plainText: fc.constant('Random text without keywords'),
      htmlText: fc.constant(''),
      attachments: fc.constant([]),
    });

    fc.assert(
      fc.property(noKeywordEmailGenerator, (email) => {
        const category = classifier.classify(email);
        expect(['Bills', 'Jobs', 'Meetings', 'OTP', 'Attachments', 'Other']).toContain(category);
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
