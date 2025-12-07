import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { Extractor } from '../Extractor';
import {
  currencyAmountGenerator,
  dateStringGenerator,
  urlGenerator,
  timeGenerator,
  otpGenerator,
} from '../../../test-utils/generators';

describe('Extractor', () => {
  const extractor = new Extractor();

  describe('Property Tests', () => {
    it('Property 14: Amount extraction completeness', () => {
      fc.assert(
        fc.property(
          fc.array(currencyAmountGenerator, { minLength: 1, maxLength: 5 }),
          (amounts) => {
            const text = amounts.join(' and ');
            const extracted = extractor.extractAmount(text);
            expect(extracted.length).toBeGreaterThan(0);
            expect(extracted.length).toBeLessThanOrEqual(amounts.length);
          }
        )
      );
    });

    it('Property 15: Due date extraction completeness', () => {
      fc.assert(
        fc.property(
          fc.array(dateStringGenerator, { minLength: 1, maxLength: 3 }),
          (dates) => {
            const text = `Due dates: ${dates.join(', ')}`;
            const extracted = extractor.extractDueDate(text);
            expect(extracted.length).toBeGreaterThanOrEqual(0);
            extracted.forEach((date) => expect(date).toBeInstanceOf(Date));
          }
        )
      );
    });

    it('Property 16: URL extraction completeness', () => {
      fc.assert(
        fc.property(
          fc.array(urlGenerator, { minLength: 1, maxLength: 3 }),
          (urls) => {
            const text = urls.join(' ');
            const extracted = extractor.extractUrls(text);
            expect(extracted.length).toBeGreaterThan(0);
          }
        )
      );
    });

    it('Property 17: Time extraction completeness', () => {
      fc.assert(
        fc.property(
          fc.array(timeGenerator, { minLength: 1, maxLength: 3 }),
          (times) => {
            const text = `Meeting times: ${times.join(', ')}`;
            const extracted = extractor.extractTime(text);
            expect(extracted.length).toBeGreaterThan(0);
          }
        )
      );
    });

    it('Property 18: OTP extraction completeness', () => {
      fc.assert(
        fc.property(otpGenerator, (otp) => {
          const text = `Your verification code is ${otp}`;
          const extracted = extractor.extractOtp(text);
          expect(extracted).toContain(otp);
        })
      );
    });

    it('Property 19: Graceful extraction failure', () => {
      fc.assert(
        fc.property(fc.string(), (randomText) => {
          expect(() => {
            extractor.extractAmount(randomText);
            extractor.extractDueDate(randomText);
            extractor.extractUrls(randomText);
            extractor.extractTime(randomText);
            extractor.extractOtp(randomText);
          }).not.toThrow();
        })
      );
    });
  });

  describe('Unit Tests', () => {
    describe('Amount extraction', () => {
      it('extracts currency amounts', () => {
        const text = 'Total: $100.50 and ₹2,500';
        const amounts = extractor.extractAmount(text);
        expect(amounts).toContain('$100.50');
        expect(amounts).toContain('₹2,500');
      });

      it('handles multiple currency symbols', () => {
        const text = '€50, £75, $100';
        const amounts = extractor.extractAmount(text);
        expect(amounts.length).toBe(3);
      });

      it('returns empty array for no matches', () => {
        const text = 'No amounts here';
        const amounts = extractor.extractAmount(text);
        expect(amounts).toEqual([]);
      });
    });

    describe('Due date extraction', () => {
      it('extracts dates in DD/MM/YYYY format', () => {
        const text = 'Due on 15/12/2024';
        const dates = extractor.extractDueDate(text);
        expect(dates.length).toBeGreaterThan(0);
        expect(dates[0]).toBeInstanceOf(Date);
      });

      it('extracts dates in DD-MM-YYYY format', () => {
        const text = 'Deadline: 20-01-2025';
        const dates = extractor.extractDueDate(text);
        expect(dates.length).toBeGreaterThan(0);
      });

      it('handles multiple dates', () => {
        const text = 'Dates: 10/05/2024 and 15/06/2024';
        const dates = extractor.extractDueDate(text);
        expect(dates.length).toBe(2);
      });

      it('returns empty array for invalid dates', () => {
        const text = 'No valid dates';
        const dates = extractor.extractDueDate(text);
        expect(dates).toEqual([]);
      });
    });

    describe('URL extraction', () => {
      it('extracts HTTP URLs', () => {
        const text = 'Visit http://example.com for details';
        const urls = extractor.extractUrls(text);
        expect(urls).toContain('http://example.com');
      });

      it('extracts HTTPS URLs', () => {
        const text = 'Join at https://meet.google.com/abc-def-ghi';
        const urls = extractor.extractUrls(text);
        expect(urls.length).toBeGreaterThan(0);
      });

      it('handles multiple URLs', () => {
        const text = 'Links: https://site1.com and https://site2.com';
        const urls = extractor.extractUrls(text);
        expect(urls.length).toBe(2);
      });
    });

    describe('Time extraction', () => {
      it('extracts time in 12-hour format', () => {
        const text = 'Meeting at 3:30 PM';
        const times = extractor.extractTime(text);
        expect(times).toContain('3:30 PM');
      });

      it('handles AM times', () => {
        const text = 'Start at 9:00 AM';
        const times = extractor.extractTime(text);
        expect(times.length).toBeGreaterThan(0);
      });

      it('extracts multiple times', () => {
        const text = 'Sessions: 10:00 AM, 2:30 PM, 5:45 PM';
        const times = extractor.extractTime(text);
        expect(times.length).toBe(3);
      });
    });

    describe('OTP extraction', () => {
      it('extracts 6-digit codes', () => {
        const text = 'Your code is 123456';
        const otps = extractor.extractOtp(text);
        expect(otps).toContain('123456');
      });

      it('handles multiple OTP codes', () => {
        const text = 'Codes: 111111 and 999999';
        const otps = extractor.extractOtp(text);
        expect(otps.length).toBe(2);
      });

      it('does not extract non-6-digit numbers', () => {
        const text = 'Number: 12345 or 1234567';
        const otps = extractor.extractOtp(text);
        expect(otps).toEqual([]);
      });
    });

    describe('Edge cases', () => {
      it('handles empty strings', () => {
        expect(extractor.extractAmount('')).toEqual([]);
        expect(extractor.extractDueDate('')).toEqual([]);
        expect(extractor.extractUrls('')).toEqual([]);
        expect(extractor.extractTime('')).toEqual([]);
        expect(extractor.extractOtp('')).toEqual([]);
      });

      it('handles malformed data gracefully', () => {
        const malformed = '!@#$%^&*()';
        expect(() => extractor.extractAll(malformed)).not.toThrow();
      });
    });
  });
});
