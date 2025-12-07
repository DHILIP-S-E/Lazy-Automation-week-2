import fc from 'fast-check';
import type { ParsedEmail, GmailMessage } from '../types/email';

// Safe text generators that avoid category keywords
const safeTextGenerator = fc.constantFrom(
  'Hello world',
  'Lorem ipsum dolor sit amet',
  'Thank you for your message',
  'Best regards',
  'Please see attached',
  'Following up on our conversation',
  'Hope this helps',
  'Let me know if you have questions'
);

// Generate random attachment
export const attachmentGenerator = fc.record({
  filename: fc.constantFrom('document', 'file', 'report', 'data').map((s) => s + '.pdf'),
  mimeType: fc.constantFrom('application/pdf', 'image/png', 'text/plain'),
  size: fc.integer({ min: 100, max: 1000000 }),
});

// Generate random parsed email
export const emailGenerator: fc.Arbitrary<ParsedEmail> = fc.record({
  id: fc.uuid(),
  subject: safeTextGenerator,
  from: fc.emailAddress(),
  to: fc.emailAddress(),
  date: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
  snippet: safeTextGenerator,
  plainText: safeTextGenerator,
  htmlText: fc.constant(''),
  attachments: fc.array(attachmentGenerator, { minLength: 0, maxLength: 5 }),
});

// Generate email with specific keywords (using safe text for other fields)
export const keywordEmailGenerator = (keywords: string[]): fc.Arbitrary<ParsedEmail> => {
  const keyword = fc.constantFrom(...keywords);
  return fc.record({
    id: fc.uuid(),
    subject: keyword.map((k) => `Important: ${k}`),
    from: fc.emailAddress(),
    to: fc.emailAddress(),
    date: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
    snippet: safeTextGenerator,
    plainText: safeTextGenerator,
    htmlText: fc.constant(''),
    attachments: fc.constant([]),
  });
};

// Generate Bills email
export const billsEmailGenerator = keywordEmailGenerator(['bill', 'invoice', 'payment', 'amount due', 'due date', 'receipt']);

// Generate Jobs email
export const jobsEmailGenerator = keywordEmailGenerator(['job', 'hiring', 'intern', 'opportunity']);

// Generate Meetings email
export const meetingsEmailGenerator = keywordEmailGenerator(['join meeting', 'google meet', 'zoom link', 'schedule', 'invite']);

// Generate OTP email
export const otpEmailGenerator: fc.Arbitrary<ParsedEmail> = fc.record({
  id: fc.uuid(),
  subject: fc.constant('Your verification code'),
  from: fc.emailAddress(),
  to: fc.emailAddress(),
  date: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
  snippet: fc.constant(''),
  plainText: fc.integer({ min: 100000, max: 999999 }).map((n) => `Your code is ${n}`),
  htmlText: fc.constant(''),
  attachments: fc.constant([]),
});

// Generate email with attachments (using safe text to avoid keyword conflicts)
export const attachmentEmailGenerator: fc.Arbitrary<ParsedEmail> = fc.record({
  id: fc.uuid(),
  subject: fc.constant('Document attached'),
  from: fc.emailAddress(),
  to: fc.emailAddress(),
  date: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
  snippet: safeTextGenerator,
  plainText: safeTextGenerator,
  htmlText: fc.constant(''),
  attachments: fc.array(attachmentGenerator, { minLength: 1, maxLength: 5 }),
});

// Generate date string in various formats
export const dateStringGenerator = fc.oneof(
  fc.tuple(
    fc.integer({ min: 1, max: 28 }),
    fc.integer({ min: 1, max: 12 }),
    fc.integer({ min: 2020, max: 2030 })
  ).map(([d, m, y]) => `${d}/${m}/${y}`),
  fc.tuple(
    fc.integer({ min: 1, max: 28 }),
    fc.integer({ min: 1, max: 12 }),
    fc.integer({ min: 2020, max: 2030 })
  ).map(([d, m, y]) => `${d}-${m}-${y}`)
);

// Generate currency amount
export const currencyAmountGenerator = fc.oneof(
  fc.integer({ min: 1, max: 99999 }).map((n) => `$${n}`),
  fc.integer({ min: 1, max: 99999 }).map((n) => `₹${n}`),
  fc.integer({ min: 1, max: 99999 }).map((n) => `€${n}`),
  fc.integer({ min: 1, max: 99999 }).map((n) => `£${n}`)
);

// Generate URL
export const urlGenerator = fc.webUrl();

// Generate OTP code
export const otpGenerator = fc.integer({ min: 100000, max: 999999 }).map(String);

// Generate time string
export const timeGenerator = fc.tuple(
  fc.integer({ min: 1, max: 12 }),
  fc.integer({ min: 0, max: 59 }),
  fc.constantFrom('AM', 'PM')
).map(([h, m, p]) => `${h}:${m.toString().padStart(2, '0')} ${p}`);

// Generate Gmail API message
export const gmailMessageGenerator: fc.Arbitrary<GmailMessage> = fc.record({
  id: fc.uuid(),
  threadId: fc.uuid(),
  labelIds: fc.array(fc.constantFrom('INBOX', 'UNREAD', 'IMPORTANT'), { minLength: 0, maxLength: 3 }),
  snippet: safeTextGenerator,
  payload: fc.record({
    headers: fc.constant([
      { name: 'Subject', value: 'Test Subject' },
      { name: 'From', value: 'test@example.com' },
      { name: 'To', value: 'user@example.com' },
      { name: 'Date', value: new Date().toISOString() },
    ]),
    body: fc.record({
      size: fc.integer({ min: 0, max: 1000 }),
      data: fc.constant(btoa('Test email body')),
    }),
    parts: fc.constant(undefined),
  }),
  internalDate: fc.date().map((d) => d.getTime().toString()),
});
