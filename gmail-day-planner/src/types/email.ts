// Gmail API types
export interface GmailMessage {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  payload: MessagePayload;
  internalDate: string;
}

export interface MessagePayload {
  headers: Header[];
  body: MessageBody;
  parts?: MessagePart[];
}

export interface Header {
  name: string;
  value: string;
}

export interface MessageBody {
  size: number;
  data?: string;
}

export interface MessagePart {
  partId: string;
  mimeType: string;
  filename: string;
  headers: Header[];
  body: MessageBody;
  parts?: MessagePart[];
}

// Parsed email types
export interface Attachment {
  filename: string;
  mimeType: string;
  size: number;
}

export interface ParsedEmail {
  id: string;
  subject: string;
  from: string;
  to: string;
  date: Date;
  snippet: string;
  plainText: string;
  htmlText: string;
  attachments: Attachment[];
}

// Email categories
export type EmailCategory = 'Bills' | 'Student Meetings' | 'Job Meetings' | 'Internship Meetings' | 'Meetings' | 'Promotions' | 'OTP' | 'Jobs' | 'Attachments' | 'Other';

// Extracted data types
export interface ExtractedData {
  amounts: string[];
  dueDates: Date[];
  urls: string[];
  times: string[];
  otpCodes: string[];
}

// Processed email with classification and extraction
export interface ProcessedEmail extends ParsedEmail {
  category: EmailCategory;
  extractedData: ExtractedData;
  importanceScore: number;
}

// Email summary structure
export interface EmailSummary {
  bills: ProcessedEmail[];
  studentMeetings: ProcessedEmail[];
  jobMeetings: ProcessedEmail[];
  internshipMeetings: ProcessedEmail[];
  meetings: ProcessedEmail[];
  promotions: ProcessedEmail[];
  jobs: ProcessedEmail[];
  otp: ProcessedEmail[];
  attachments: ProcessedEmail[];
  important: ProcessedEmail[];
  generatedAt: Date;
}
