import { describe, it, expect } from 'vitest';
import { Classifier } from '../Classifier';
import { Extractor } from '../Extractor';
import { Scorer } from '../Scorer';

describe('Rule Engine Tests', () => {
  it('Classifier works', () => {
    const classifier = new Classifier();
    const email = {
      id: '1',
      subject: 'Invoice',
      from: 'test@test.com',
      to: 'me@test.com',
      date: new Date(),
      snippet: '',
      plainText: 'Your bill is due',
      htmlText: '',
      attachments: []
    };
    expect(classifier.classify(email)).toBe('Bills');
  });

  it('Extractor works', () => {
    const extractor = new Extractor();
    const amounts = extractor.extractAmount('Total: $100');
    expect(amounts).toContain('$100');
  });

  it('Scorer works', () => {
    const scorer = new Scorer();
    const email = {
      id: '1',
      subject: 'Test',
      from: 'test@test.com',
      to: 'me@test.com',
      date: new Date(),
      snippet: '',
      plainText: '',
      htmlText: '',
      attachments: [],
      category: 'Other' as const,
      extractedData: {
        amounts: [],
        dueDates: [],
        urls: [],
        times: [],
        otpCodes: []
      },
      importanceScore: 0
    };
    expect(scorer.calculateScore(email)).toBe(3);
  });
});
