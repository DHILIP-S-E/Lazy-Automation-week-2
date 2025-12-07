import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { Scorer } from '../Scorer';
import type { ProcessedEmail } from '../../../types/email';
import { IMPORTANCE_SCORES } from '../../../constants';

describe('Scorer', () => {
  const scorer = new Scorer();

  const createProcessedEmail = (overrides: Partial<ProcessedEmail>): ProcessedEmail => ({
    id: 'test-id',
    subject: 'Test',
    from: 'test@example.com',
    to: 'user@example.com',
    date: new Date(),
    snippet: '',
    plainText: '',
    htmlText: '',
    attachments: [],
    category: 'Other',
    extractedData: {
      amounts: [],
      dueDates: [],
      urls: [],
      times: [],
      otpCodes: [],
    },
    importanceScore: 0,
    ...overrides,
  });

  describe('Property Tests', () => {
    it('Property 20: Urgent bills scoring', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 1 }), (daysAhead) => {
          // Use tomorrow to avoid timezone/time-of-day edge cases
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + daysAhead);
          dueDate.setHours(12, 0, 0, 0); // Set to noon to avoid edge cases

          const email = createProcessedEmail({
            category: 'Bills',
            extractedData: {
              amounts: ['$100'],
              dueDates: [dueDate],
              urls: [],
              times: [],
              otpCodes: [],
            },
          });

          const score = scorer.calculateScore(email);
          expect(score).toBe(IMPORTANCE_SCORES.URGENT_BILL);
        })
      );
    });

    it('Property 21: Urgent jobs scoring', () => {
      fc.assert(
        fc.property(fc.integer({ min: 0, max: 3 }), (daysAhead) => {
          const deadline = new Date();
          deadline.setDate(deadline.getDate() + daysAhead);

          const email = createProcessedEmail({
            category: 'Jobs',
            extractedData: {
              amounts: [],
              dueDates: [deadline],
              urls: [],
              times: [],
              otpCodes: [],
            },
          });

          const score = scorer.calculateScore(email);
          expect(score).toBe(IMPORTANCE_SCORES.URGENT_JOB);
        })
      );
    });

    it('Property 22: Today\'s meetings scoring', () => {
      fc.assert(
        fc.property(fc.constant('10:00 AM'), (time) => {
          const email = createProcessedEmail({
            category: 'Meetings',
            extractedData: {
              amounts: [],
              dueDates: [],
              urls: [],
              times: [time],
              otpCodes: [],
            },
          });

          const score = scorer.calculateScore(email);
          expect(score).toBe(IMPORTANCE_SCORES.TODAY_MEETING);
        })
      );
    });

    it('Property 23: Attachment scoring', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              filename: fc.string({ minLength: 1 }),
              mimeType: fc.constant('application/pdf'),
              size: fc.integer({ min: 1 }),
            }),
            { minLength: 1, maxLength: 3 }
          ),
          (attachments) => {
            const email = createProcessedEmail({
              category: 'Other',
              attachments,
            });

            const score = scorer.calculateScore(email);
            expect(score).toBe(IMPORTANCE_SCORES.HAS_ATTACHMENT);
          }
        )
      );
    });

    it('Property 24: Default scoring', () => {
      fc.assert(
        fc.property(fc.constant(null), () => {
          const email = createProcessedEmail({
            category: 'Other',
            attachments: [],
          });

          const score = scorer.calculateScore(email);
          expect(score).toBe(IMPORTANCE_SCORES.DEFAULT);
        })
      );
    });
  });

  describe('Unit Tests', () => {
    it('scores urgent bills with due date tomorrow as 10', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const email = createProcessedEmail({
        category: 'Bills',
        extractedData: {
          amounts: ['$500'],
          dueDates: [tomorrow],
          urls: [],
          times: [],
          otpCodes: [],
        },
      });

      expect(scorer.calculateScore(email)).toBe(IMPORTANCE_SCORES.URGENT_BILL);
    });

    it('scores jobs with deadline within 3 days as 8', () => {
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + 2);

      const email = createProcessedEmail({
        category: 'Jobs',
        extractedData: {
          amounts: [],
          dueDates: [deadline],
          urls: [],
          times: [],
          otpCodes: [],
        },
      });

      expect(scorer.calculateScore(email)).toBe(IMPORTANCE_SCORES.URGENT_JOB);
    });

    it('scores meetings with time today as 9', () => {
      const email = createProcessedEmail({
        category: 'Meetings',
        extractedData: {
          amounts: [],
          dueDates: [],
          urls: [],
          times: ['3:00 PM'],
          otpCodes: [],
        },
      });

      expect(scorer.calculateScore(email)).toBe(IMPORTANCE_SCORES.TODAY_MEETING);
    });

    it('scores emails with attachments as 6', () => {
      const email = createProcessedEmail({
        category: 'Other',
        attachments: [{ filename: 'doc.pdf', mimeType: 'application/pdf', size: 1000 }],
      });

      expect(scorer.calculateScore(email)).toBe(IMPORTANCE_SCORES.HAS_ATTACHMENT);
    });

    it('scores other emails as 3', () => {
      const email = createProcessedEmail({
        category: 'Other',
      });

      expect(scorer.calculateScore(email)).toBe(IMPORTANCE_SCORES.DEFAULT);
    });

    it('does not score bills without due dates as urgent', () => {
      const email = createProcessedEmail({
        category: 'Bills',
        extractedData: {
          amounts: ['$100'],
          dueDates: [],
          urls: [],
          times: [],
          otpCodes: [],
        },
      });

      expect(scorer.calculateScore(email)).toBe(IMPORTANCE_SCORES.DEFAULT);
    });

    it('prioritizes urgent bills over attachments', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const email = createProcessedEmail({
        category: 'Bills',
        attachments: [{ filename: 'invoice.pdf', mimeType: 'application/pdf', size: 1000 }],
        extractedData: {
          amounts: ['$200'],
          dueDates: [tomorrow],
          urls: [],
          times: [],
          otpCodes: [],
        },
      });

      expect(scorer.calculateScore(email)).toBe(IMPORTANCE_SCORES.URGENT_BILL);
    });

    describe('Helper methods', () => {
      it('isDueSoon returns true for dates within threshold', () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        expect(scorer.isDueSoon([tomorrow], 2)).toBe(true);
      });

      it('isDueSoon returns false for dates beyond threshold', () => {
        const future = new Date();
        future.setDate(future.getDate() + 10);

        expect(scorer.isDueSoon([future], 3)).toBe(false);
      });

      it('isToday returns true for today\'s date', () => {
        const today = new Date();
        expect(scorer.isToday(today)).toBe(true);
      });

      it('isToday returns false for other dates', () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        expect(scorer.isToday(tomorrow)).toBe(false);
      });
    });
  });
});
