import type { GmailMessage, ParsedEmail, ProcessedEmail, EmailSummary, EmailCategory, ExtractedData } from './email';

// Authentication Module
export interface AuthModule {
  initiateLogin(): Promise<void>;
  getAccessToken(): string | null;
  isAuthenticated(): boolean;
  logout(): void;
}

export interface OAuthConfig {
  clientId: string;
  scopes: string[];
  redirectUri: string;
}

// Email Fetcher Module
export interface EmailFetcher {
  fetchMessageIds(maxResults: number): Promise<string[]>;
  fetchMessageDetails(messageId: string): Promise<GmailMessage>;
  fetchBatch(
    messageIds: string[],
    onProgress?: (fetched: number, total: number) => void
  ): Promise<GmailMessage[]>;
}

// Email Parser Module
export interface EmailParser {
  parse(gmailMessage: GmailMessage): ParsedEmail;
  extractPlainText(payload: any): string;
  extractHtmlText(payload: any): string;
  extractAttachments(payload: any): any[];
}

// Rule Engine Modules
export interface Classifier {
  classify(email: ParsedEmail): EmailCategory;
}

export interface Extractor {
  extractAmount(text: string): string[];
  extractDueDate(text: string): Date[];
  extractUrls(text: string): string[];
  extractTime(text: string): string[];
  extractOtp(text: string): string[];
  extractAll(text: string): ExtractedData;
}

export interface Scorer {
  calculateScore(email: ProcessedEmail): number;
}

export interface RuleEngine {
  process(email: ParsedEmail): ProcessedEmail;
}

// Summary Generator Module
export interface SummaryGenerator {
  generate(emails: ProcessedEmail[]): EmailSummary;
}

// Email Sender Module
export interface EmailSender {
  sendSummary(summary: EmailSummary, userEmail: string): Promise<void>;
}

export interface EmailComposer {
  composeHtml(summary: EmailSummary): string;
  composeRfc822(to: string, subject: string, html: string): string;
}
