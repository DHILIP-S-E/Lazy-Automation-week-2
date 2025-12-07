import type { ParsedEmail, ProcessedEmail, GmailMessage } from '../types/email';

export const sampleBillEmail: ParsedEmail = {
  id: 'bill-001',
  subject: 'Your electricity bill is due',
  from: 'billing@utility.com',
  to: 'user@example.com',
  date: new Date(),
  snippet: 'Your bill of $150.00 is due on 15/12/2025',
  plainText: 'Dear Customer, Your electricity bill of $150.00 is due on 15/12/2025. Please pay before the due date.',
  htmlText: '',
  attachments: [],
};

export const sampleJobEmail: ParsedEmail = {
  id: 'job-001',
  subject: 'Job Opportunity: Software Engineer',
  from: 'hr@company.com',
  to: 'user@example.com',
  date: new Date(),
  snippet: 'We are hiring for a software engineer position',
  plainText: 'We are hiring for a software engineer position. Apply now at https://company.com/apply. Deadline: 20/12/2025',
  htmlText: '',
  attachments: [],
};

export const sampleMeetingEmail: ParsedEmail = {
  id: 'meeting-001',
  subject: 'Team Standup - Join Meeting',
  from: 'calendar@company.com',
  to: 'user@example.com',
  date: new Date(),
  snippet: 'Join the meeting at 10:00 AM',
  plainText: 'Join meeting at 10:00 AM. Link: https://meet.google.com/abc-defg-hij',
  htmlText: '',
  attachments: [],
};

export const sampleOtpEmail: ParsedEmail = {
  id: 'otp-001',
  subject: 'Your verification code',
  from: 'noreply@service.com',
  to: 'user@example.com',
  date: new Date(),
  snippet: 'Your code is 123456',
  plainText: 'Your verification code is 123456. This code expires in 10 minutes.',
  htmlText: '',
  attachments: [],
};

export const sampleAttachmentEmail: ParsedEmail = {
  id: 'attachment-001',
  subject: 'Document for review',
  from: 'colleague@company.com',
  to: 'user@example.com',
  date: new Date(),
  snippet: 'Please review the attached document',
  plainText: 'Please review the attached document and provide feedback.',
  htmlText: '',
  attachments: [
    { filename: 'report.pdf', mimeType: 'application/pdf', size: 102400 },
    { filename: 'data.xlsx', mimeType: 'application/vnd.ms-excel', size: 51200 },
  ],
};


export const sampleOtherEmail: ParsedEmail = {
  id: 'other-001',
  subject: 'Newsletter: Weekly Updates',
  from: 'newsletter@blog.com',
  to: 'user@example.com',
  date: new Date(),
  snippet: 'Check out this weeks updates',
  plainText: 'Here are the latest updates from our blog. Read more at our website.',
  htmlText: '',
  attachments: [],
};

export const sampleGmailMessage: GmailMessage = {
  id: 'gmail-001',
  threadId: 'thread-001',
  labelIds: ['INBOX', 'UNREAD'],
  snippet: 'This is a test email snippet',
  payload: {
    headers: [
      { name: 'Subject', value: 'Test Email Subject' },
      { name: 'From', value: 'sender@example.com' },
      { name: 'To', value: 'recipient@example.com' },
      { name: 'Date', value: 'Sat, 06 Dec 2025 10:00:00 +0000' },
    ],
    body: {
      size: 100,
      data: btoa('This is the email body content'),
    },
  },
  internalDate: Date.now().toString(),
};

export const sampleProcessedBillEmail: ProcessedEmail = {
  ...sampleBillEmail,
  category: 'Bills',
  extractedData: {
    amounts: ['$150.00'],
    dueDates: [new Date('2025-12-15')],
    urls: [],
    times: [],
    otpCodes: [],
  },
  importanceScore: 10,
};

export const sampleProcessedJobEmail: ProcessedEmail = {
  ...sampleJobEmail,
  category: 'Jobs',
  extractedData: {
    amounts: [],
    dueDates: [new Date('2025-12-20')],
    urls: ['https://company.com/apply'],
    times: [],
    otpCodes: [],
  },
  importanceScore: 8,
};

export const sampleProcessedMeetingEmail: ProcessedEmail = {
  ...sampleMeetingEmail,
  category: 'Meetings',
  extractedData: {
    amounts: [],
    dueDates: [],
    urls: ['https://meet.google.com/abc-defg-hij'],
    times: ['10:00 AM'],
    otpCodes: [],
  },
  importanceScore: 9,
};

export const allSampleEmails: ParsedEmail[] = [
  sampleBillEmail,
  sampleJobEmail,
  sampleMeetingEmail,
  sampleOtpEmail,
  sampleAttachmentEmail,
  sampleOtherEmail,
];
