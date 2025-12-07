# Design Document

## Overview

AutoMail Day Planner is a single-page web application (SPA) built with a local-first architecture that processes Gmail data entirely in the browser. The system uses Google OAuth 2.0 for authentication, the Gmail API for read-only email access, and a deterministic rule engine for email classification and data extraction. All processing occurs in volatile browser memory with zero persistence, ensuring complete privacy.

The application follows a pipeline architecture: Authentication → Fetch → Parse → Classify → Extract → Score → Summarize → Render. Each stage transforms data without side effects, making the system predictable and testable.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (Client-Side Only)               │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              React Application                      │    │
│  │                                                      │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │    │
│  │  │ Auth Module  │  │ Email Fetcher│  │ UI Layer │ │    │
│  │  └──────────────┘  └──────────────┘  └──────────┘ │    │
│  │                                                      │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │         Rule Engine Pipeline                  │  │    │
│  │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐     │  │    │
│  │  │  │Classifier│→│Extractor │→│  Scorer  │     │  │    │
│  │  │  └──────────┘ └──────────┘ └──────────┘     │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  │                                                      │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │      Summary Generator & Renderer             │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  └────────────────────────────────────────────────────┘    │
│                           ↕                                  │
│                    Gmail API (HTTPS)                        │
└─────────────────────────────────────────────────────────────┘
                            ↕
                ┌───────────────────────┐
                │   Google OAuth 2.0    │
                │   Gmail API Servers   │
                └───────────────────────┘
```

### Technology Stack

- **Frontend Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios or Fetch API
- **OAuth Library**: @react-oauth/google
- **Date Parsing**: date-fns
- **State Management**: React Context API (no Redux needed - ephemeral state only)
- **Testing**: Vitest for unit tests, fast-check for property-based testing

### Data Flow

1. **Authentication Flow**: User → OAuth Consent → Google → Access Token → Memory Storage
2. **Fetch Flow**: User Action → Gmail API Request → Message IDs → Batch Fetch → Raw Email Data
3. **Processing Flow**: Raw Email → Parser → Rule Engine → Structured Email Object
4. **Summary Flow**: Structured Emails → Aggregator → Category Groups → UI Renderer
5. **Send Flow**: User Action → Summary HTML → Gmail API Send → Confirmation

## Components and Interfaces

### 1. Authentication Module

**Responsibility**: Manage Google OAuth flow and token lifecycle

```typescript
interface AuthModule {
  initiateLogin(): Promise<void>;
  getAccessToken(): string | null;
  isAuthenticated(): boolean;
  logout(): void;
}

interface OAuthConfig {
  clientId: string;
  scopes: string[];
  redirectUri: string;
}
```

**Key Methods**:
- `initiateLogin()`: Triggers Google OAuth popup with gmail.readonly scope
- `getAccessToken()`: Returns current token from memory (not localStorage)
- `isAuthenticated()`: Checks token validity
- `logout()`: Clears token from memory

### 2. Email Fetcher Module

**Responsibility**: Retrieve emails from Gmail API

```typescript
interface EmailFetcher {
  fetchMessageIds(maxResults: number): Promise<string[]>;
  fetchMessageDetails(messageId: string): Promise<GmailMessage>;
  fetchBatch(messageIds: string[]): Promise<GmailMessage[]>;
}

interface GmailMessage {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  payload: MessagePayload;
  internalDate: string;
}

interface MessagePayload {
  headers: Header[];
  body: MessageBody;
  parts?: MessagePart[];
}
```

**Key Methods**:
- `fetchMessageIds()`: Calls `GET /gmail/v1/users/me/messages?maxResults=50`
- `fetchMessageDetails()`: Calls `GET /gmail/v1/users/me/messages/:id`
- `fetchBatch()`: Parallel fetch with Promise.all for performance

### 3. Email Parser Module

**Responsibility**: Transform raw Gmail API response into structured format

```typescript
interface EmailParser {
  parse(gmailMessage: GmailMessage): ParsedEmail;
  extractPlainText(payload: MessagePayload): string;
  extractHtmlText(payload: MessagePayload): string;
  extractAttachments(payload: MessagePayload): Attachment[];
}

interface ParsedEmail {
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

interface Attachment {
  filename: string;
  mimeType: string;
  size: number;
}
```

**Key Logic**:
- Extract headers (Subject, From, To, Date)
- Decode base64 body content
- Handle multipart MIME messages
- Fallback to snippet if body is empty
- Strip HTML tags for plain text extraction

### 4. Rule Engine Module

**Responsibility**: Classify emails and extract structured data

```typescript
interface RuleEngine {
  process(email: ParsedEmail): ProcessedEmail;
}

interface Classifier {
  classify(email: ParsedEmail): EmailCategory;
}

interface Extractor {
  extractAmount(text: string): string[];
  extractDueDate(text: string): Date[];
  extractUrls(text: string): string[];
  extractTime(text: string): string[];
  extractOtp(text: string): string[];
}

interface Scorer {
  calculateScore(email: ProcessedEmail): number;
}

interface ProcessedEmail extends ParsedEmail {
  category: EmailCategory;
  extractedData: ExtractedData;
  importanceScore: number;
}

type EmailCategory = 'Bills' | 'Jobs' | 'Meetings' | 'OTP' | 'Attachments' | 'Other';

interface ExtractedData {
  amounts: string[];
  dueDates: Date[];
  urls: string[];
  times: string[];
  otpCodes: string[];
}
```

**Classification Rules**:
```typescript
const CATEGORY_KEYWORDS = {
  Bills: ['bill', 'invoice', 'payment', 'amount due', 'due date', 'receipt'],
  Jobs: ['job', 'hiring', 'apply', 'intern', 'opportunity'],
  Meetings: ['join meeting', 'google meet', 'zoom link', 'schedule', 'invite'],
  OTP: ['your code is', 'verification code', 'otp'],
};
```

**Extraction Patterns**:
```typescript
const REGEX_PATTERNS = {
  amount: /[₹$€£]\s?\d+(?:,\d{3})*(?:\.\d{1,2})?/g,
  dueDate: /\d{1,2}[/-]\d{1,2}[/-]\d{4}/g,
  url: /https?:\/\/\S+/g,
  time: /\d{1,2}:\d{2}\s?(AM|PM)/gi,
  otp: /\b\d{6}\b/g,
};
```

**Scoring Logic**:
```typescript
function calculateScore(email: ProcessedEmail): number {
  if (email.category === 'Bills' && isDueSoon(email.extractedData.dueDates, 1)) {
    return 10;
  }
  if (email.category === 'Jobs' && isDueSoon(email.extractedData.dueDates, 3)) {
    return 8;
  }
  if (email.category === 'Meetings' && isToday(email.extractedData.times)) {
    return 9;
  }
  if (email.attachments.length > 0) {
    return 6;
  }
  return 3;
}
```

### 5. Summary Generator Module

**Responsibility**: Aggregate processed emails into categorized summary

```typescript
interface SummaryGenerator {
  generate(emails: ProcessedEmail[]): EmailSummary;
}

interface EmailSummary {
  bills: ProcessedEmail[];
  jobs: ProcessedEmail[];
  meetings: ProcessedEmail[];
  attachments: ProcessedEmail[];
  otp: ProcessedEmail[];
  important: ProcessedEmail[];
  generatedAt: Date;
}
```

**Key Logic**:
- Group emails by category
- Sort within each category by importance score (descending)
- Filter important emails (score >= 8) into separate section
- Generate timestamp for summary

### 6. UI Renderer Module

**Responsibility**: Display summary in user-friendly format

```typescript
interface SummaryRenderer {
  renderSummary(summary: EmailSummary): React.ReactElement;
  renderCategory(category: string, emails: ProcessedEmail[]): React.ReactElement;
  renderEmailCard(email: ProcessedEmail): React.ReactElement;
}
```

**UI Components**:
- `LoginScreen`: OAuth button + privacy message
- `Dashboard`: Action buttons (Scan, View, Send)
- `SummaryView`: Tabbed interface with category sections
- `EmailCard`: Individual email display with extracted data
- `LoadingIndicator`: Progress feedback during operations

### 7. Email Sender Module

**Responsibility**: Send summary email to user

```typescript
interface EmailSender {
  sendSummary(summary: EmailSummary, userEmail: string): Promise<void>;
}

interface EmailComposer {
  composeHtml(summary: EmailSummary): string;
  composeRfc822(to: string, subject: string, html: string): string;
}
```

**Key Methods**:
- `composeHtml()`: Generate HTML email body from summary
- `composeRfc822()`: Format message according to RFC822 standard
- `sendSummary()`: Call `POST /gmail/v1/users/me/messages/send`

## Data Models

### Core Data Types

```typescript
// Raw Gmail API types (simplified)
type GmailMessage = {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  payload: MessagePayload;
  internalDate: string;
};

// Parsed email after initial processing
type ParsedEmail = {
  id: string;
  subject: string;
  from: string;
  to: string;
  date: Date;
  snippet: string;
  plainText: string;
  htmlText: string;
  attachments: Attachment[];
};

// Fully processed email after rule engine
type ProcessedEmail = ParsedEmail & {
  category: EmailCategory;
  extractedData: ExtractedData;
  importanceScore: number;
};

// Final summary structure
type EmailSummary = {
  bills: ProcessedEmail[];
  jobs: ProcessedEmail[];
  meetings: ProcessedEmail[];
  attachments: ProcessedEmail[];
  otp: ProcessedEmail[];
  important: ProcessedEmail[];
  generatedAt: Date;
};
```

### State Management

```typescript
// Application state (stored in React Context, memory only)
type AppState = {
  authToken: string | null;
  userEmail: string | null;
  emails: ProcessedEmail[];
  summary: EmailSummary | null;
  isLoading: boolean;
  error: string | null;
};

// No persistence - state cleared on unmount/tab close
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property Reflection

After analyzing all acceptance criteria, several properties can be consolidated to eliminate redundancy:

- Storage/privacy properties (1.2, 1.3, 2.4, 2.5, 8.3) → Combined into Property 1
- OAuth scope properties (8.6, 12.1) → Combined into Property 2  
- API restriction properties (12.2, 12.3, 12.4, 12.5) → Combined into Property 3
- Attachment handling (4.6 for extraction, 6.6 for display) → Kept separate as they test different stages

### Correctness Properties

Property 1: No persistent storage
*For any* email data, OAuth token, or summary object processed by the System, that data SHALL NOT appear in localStorage, sessionStorage, IndexedDB, cookies, or file system after processing completes.
**Validates: Requirements 1.2, 1.3, 2.4, 2.5, 8.3**

Property 2: Read-only OAuth scope
*For any* OAuth authentication request, the requested scopes array SHALL contain only "profile", "email", and "https://www.googleapis.com/auth/gmail.readonly" and SHALL NOT contain write, delete, or modify scopes.
**Validates: Requirements 8.6, 12.1**

Property 3: Read-only API usage
*For any* Gmail API call made by the System (excluding the optional summary send feature), the endpoint SHALL be a GET request to read-only endpoints and SHALL NOT be POST/PUT/DELETE requests to modify, delete, trash, or label endpoints.
**Validates: Requirements 12.2, 12.3, 12.4, 12.5**

Property 4: Memory cleanup on unmount
*For any* application state containing email data or OAuth tokens, when the component unmounts or tab closes, all email data and tokens SHALL be cleared from memory.
**Validates: Requirements 1.4, 8.5**

Property 5: Complete message fetching
*For any* list of message IDs received from the Gmail API, the System SHALL fetch full message details for each ID, resulting in a processed email list with length equal to the input ID list length.
**Validates: Requirements 2.2**

Property 6: Complete email parsing
*For any* Gmail API message payload, the parsed email object SHALL contain all required fields: subject, from, to, date, snippet, plainText, htmlText, and attachments array (even if empty).
**Validates: Requirements 2.3**

Property 7: Bills keyword classification
*For any* email where the combined subject and body text contains at least one of the keywords ["bill", "invoice", "payment", "amount due", "due date", "receipt"], the System SHALL assign category "Bills".
**Validates: Requirements 3.1**

Property 8: Jobs keyword classification
*For any* email where the combined subject and body text contains at least one of the keywords ["job", "hiring", "apply", "intern", "opportunity"], the System SHALL assign category "Jobs".
**Validates: Requirements 3.2**

Property 9: Meetings keyword classification
*For any* email where the combined subject and body text contains at least one of the keywords ["join meeting", "google meet", "zoom link", "schedule", "invite"], the System SHALL assign category "Meetings".
**Validates: Requirements 3.3**

Property 10: OTP pattern classification
*For any* email where the body text contains the pattern "your code is" or matches the regex /\b\d{6}\b/, the System SHALL assign category "OTP".
**Validates: Requirements 3.4**

Property 11: Attachment classification
*For any* email where the attachments array has length > 0, the System SHALL assign category "Attachments".
**Validates: Requirements 3.5**

Property 12: Default category classification
*For any* email that does not match any category-specific rules (Bills, Jobs, Meetings, OTP, Attachments), the System SHALL assign category "Other".
**Validates: Requirements 3.6**

Property 13: Single category assignment
*For any* email processed by the rule engine, the resulting ProcessedEmail object SHALL have exactly one category value from the EmailCategory type.
**Validates: Requirements 3.7**

Property 14: Amount extraction completeness
*For any* email text containing monetary amounts matching the pattern /[₹$€£]\s?\d+(?:,\d{3})*(?:\.\d{1,2})?/g, the extractedData.amounts array SHALL contain all matched amounts.
**Validates: Requirements 4.1, 4.6**

Property 15: Due date extraction completeness
*For any* email text containing dates matching the pattern /\d{1,2}[/-]\d{1,2}[/-]\d{4}/g, the extractedData.dueDates array SHALL contain all matched dates parsed as Date objects.
**Validates: Requirements 4.2, 4.6**

Property 16: URL extraction completeness
*For any* email text containing URLs matching the pattern /https?:\/\/\S+/g, the extractedData.urls array SHALL contain all matched URLs.
**Validates: Requirements 4.3, 4.6**

Property 17: Time extraction completeness
*For any* email text containing times matching the pattern /\d{1,2}:\d{2}\s?(AM|PM)/gi, the extractedData.times array SHALL contain all matched time strings.
**Validates: Requirements 4.4, 4.6**

Property 18: OTP extraction completeness
*For any* email text containing 6-digit codes matching the pattern /\b\d{6}\b/g, the extractedData.otpCodes array SHALL contain all matched codes.
**Validates: Requirements 4.5, 4.6**

Property 19: Graceful extraction failure
*For any* email text that contains no matches for a specific extraction pattern (amount, date, URL, time, or OTP), the corresponding extractedData array SHALL be empty (length 0) without throwing errors.
**Validates: Requirements 4.7**

Property 20: Urgent bills scoring
*For any* email with category "Bills" where extractedData.dueDates contains at least one date within 1 day of the current date, the importanceScore SHALL equal 10.
**Validates: Requirements 5.1**

Property 21: Urgent jobs scoring
*For any* email with category "Jobs" where extractedData.dueDates contains at least one date within 3 days of the current date, the importanceScore SHALL equal 8.
**Validates: Requirements 5.2**

Property 22: Today's meetings scoring
*For any* email with category "Meetings" where extractedData.times contains at least one time value for today's date, the importanceScore SHALL equal 9.
**Validates: Requirements 5.3**

Property 23: Attachment scoring
*For any* email where attachments array has length > 0, the importanceScore SHALL be at least 6.
**Validates: Requirements 5.4**

Property 24: Default scoring
*For any* email that does not match high-priority scoring rules (urgent bills, urgent jobs, today's meetings, or attachments), the importanceScore SHALL equal 3.
**Validates: Requirements 5.5**

Property 25: Category sorting by importance
*For any* category array in the EmailSummary (bills, jobs, meetings, etc.), the emails SHALL be sorted in descending order by importanceScore.
**Validates: Requirements 5.6**

Property 26: Complete summary structure
*For any* set of processed emails, the generated EmailSummary object SHALL contain all required category arrays: bills, jobs, meetings, attachments, otp, and important.
**Validates: Requirements 6.1**

Property 27: Bill display completeness
*For any* email in the bills category, the rendered output SHALL contain the email subject and all extracted amounts and dueDates from extractedData.
**Validates: Requirements 6.3**

Property 28: Job display completeness
*For any* email in the jobs category, the rendered output SHALL contain the email subject and all extracted dueDates and urls from extractedData.
**Validates: Requirements 6.4**

Property 29: Meeting display completeness
*For any* email in the meetings category, the rendered output SHALL contain the email subject and all extracted times and urls from extractedData.
**Validates: Requirements 6.5**

Property 30: Attachment display completeness
*For any* email with attachments, the rendered output SHALL contain all attachment filenames from the attachments array.
**Validates: Requirements 6.6**

Property 31: OTP display completeness
*For any* email in the otp category, the rendered output SHALL contain all extracted otpCodes from extractedData.
**Validates: Requirements 6.7**

Property 32: Summary memory-only storage
*For any* generated EmailSummary object, the summary SHALL exist only in application state (React Context) and SHALL NOT be written to localStorage, sessionStorage, or any persistent storage.
**Validates: Requirements 6.8**

Property 33: RFC822 message format
*For any* summary email composed for sending, the message SHALL be formatted according to RFC822 standard with proper To, Subject, and Content-Type headers.
**Validates: Requirements 7.2**

Property 34: Summary recipient correctness
*For any* summary email sent, the recipient address SHALL match the authenticated user's email address obtained from OAuth.
**Validates: Requirements 7.3**

Property 35: Summary subject format
*For any* summary email sent, the subject line SHALL match the pattern "Your Daily Email Summary - [Date]" where [Date] is the current date in readable format.
**Validates: Requirements 7.4**

Property 36: No external data transmission
*For any* network request made by the System, the request URL SHALL contain only the Gmail API domain (gmail.googleapis.com) and SHALL NOT transmit email content to other domains.
**Validates: Requirements 8.2**

Property 37: No email content logging
*For any* email data processed by the System, the email subject, body, or extracted data SHALL NOT be passed to console.log, console.error, or any analytics/monitoring functions.
**Validates: Requirements 8.4**

Property 38: Email count display accuracy
*For any* email fetching operation, the displayed count SHALL equal the length of the processed emails array.
**Validates: Requirements 2.6**

Property 39: Summary category sections
*For any* rendered summary UI, the output SHALL contain distinct sections for each category (Bills, Jobs, Meetings, Attachments, Important) with category-specific icons.
**Validates: Requirements 6.2, 10.3, 10.5**

Property 40: Email card completeness
*For any* rendered email card, the output SHALL contain the email's subject, sender (from), date, and all non-empty extracted data fields.
**Validates: Requirements 10.4**

Property 41: Loading indicator timing
*For any* asynchronous operation (fetch, process, send) that exceeds 500 milliseconds, a loading indicator SHALL be visible in the UI.
**Validates: Requirements 10.6, 11.4**

Property 42: Rule engine performance
*For any* batch of 50 emails, the rule engine SHALL complete classification, extraction, and scoring for all emails in less than 2500 milliseconds (excluding network I/O).
**Validates: Requirements 11.1**

Property 43: Summary generation performance
*For any* set of processed emails, generating the EmailSummary object and rendering the UI SHALL complete in less than 200 milliseconds.
**Validates: Requirements 11.2**

Property 44: Single email extraction performance
*For any* single email, applying all regex extraction patterns SHALL complete in less than 50 milliseconds.
**Validates: Requirements 11.3**

Property 45: Progressive UI updates
*For any* batch email processing operation, the UI SHALL update incrementally as emails are processed rather than blocking until all processing completes.
**Validates: Requirements 11.5**

## Error Handling

### Error Categories

1. **Authentication Errors**
   - OAuth popup blocked
   - User denies permission
   - Token expiration
   - Invalid credentials

2. **Network Errors**
   - Gmail API unavailable
   - Rate limiting (429 responses)
   - Timeout errors
   - Connection failures

3. **Data Processing Errors**
   - Malformed email payloads
   - Invalid MIME structure
   - Base64 decode failures
   - Regex processing errors

4. **UI Errors**
   - Render failures
   - State update errors
   - Component mount/unmount errors

### Error Handling Strategy

```typescript
interface ErrorHandler {
  handleAuthError(error: AuthError): void;
  handleNetworkError(error: NetworkError): void;
  handleProcessingError(error: ProcessingError): void;
  handleUIError(error: UIError): void;
}

type ErrorResponse = {
  message: string;
  retryable: boolean;
  action?: () => void;
};
```

**Principles**:
- Never crash the application - always catch and handle errors gracefully
- Provide clear, actionable error messages to users
- Distinguish between retryable and non-retryable errors
- Log errors to console for debugging (but never log email content)
- Maintain partial functionality when possible (e.g., show successfully processed emails even if some fail)

**Specific Handlers**:

1. **OAuth Errors**: Display error message with "Try Again" button, clear any partial auth state
2. **Rate Limiting**: Show "Too many requests" message with countdown timer before retry
3. **Malformed Emails**: Skip the problematic email, log warning, continue processing others
4. **Network Timeouts**: Retry up to 3 times with exponential backoff, then show error
5. **Parsing Failures**: Use fallback values (snippet, empty arrays) and continue

### Edge Case Handling

Based on Requirement 9, the system handles these edge cases:

1. **HTML-only emails**: Strip HTML tags using DOMParser or regex to extract plain text
2. **Empty body emails**: Use snippet field as fallback content
3. **Invalid dates**: Mark as "not found", don't crash parsing
4. **Multiple attachments**: Store all in array, display all in UI
5. **Missing due dates in bills**: Display "Due date not found" placeholder
6. **Job emails without apply links**: Extract first URL found in body
7. **Meeting emails without times**: Parse calendar link parameters for time info

## Testing Strategy

### Dual Testing Approach

The system will use both unit testing and property-based testing to ensure comprehensive correctness:

- **Unit tests** verify specific examples, edge cases, and integration points
- **Property-based tests** verify universal properties across all inputs
- Together they provide complete coverage: unit tests catch concrete bugs, property tests verify general correctness

### Property-Based Testing

**Framework**: fast-check (TypeScript property-based testing library)

**Configuration**:
- Minimum 100 iterations per property test
- Each property test tagged with format: `**Feature: gmail-day-planner, Property {number}: {property_text}**`
- Each correctness property implemented by a SINGLE property-based test

**Test Structure**:
```typescript
import fc from 'fast-check';

// Example property test
test('**Feature: gmail-day-planner, Property 7: Bills keyword classification**', () => {
  fc.assert(
    fc.property(
      fc.record({
        subject: fc.string(),
        body: fc.string().filter(s => 
          s.includes('bill') || s.includes('invoice') || 
          s.includes('payment') || s.includes('amount due')
        ),
        // ... other email fields
      }),
      (email) => {
        const result = classifier.classify(email);
        expect(result.category).toBe('Bills');
      }
    ),
    { numRuns: 100 }
  );
});
```

**Generators**:
- `emailGenerator`: Creates random ParsedEmail objects
- `gmailMessageGenerator`: Creates random Gmail API responses
- `keywordEmailGenerator`: Creates emails with specific keywords
- `dateStringGenerator`: Creates various date format strings
- `currencyAmountGenerator`: Creates monetary amounts in various formats
- `urlGenerator`: Creates valid URLs
- `otpGenerator`: Creates 6-digit codes

### Unit Testing

**Framework**: Vitest

**Test Categories**:

1. **Authentication Tests**
   - OAuth flow initiation
   - Token storage in memory
   - Logout clears token
   - Error handling for failed auth

2. **Email Fetching Tests**
   - API call with correct parameters
   - Batch fetching with Promise.all
   - Error handling for network failures

3. **Parsing Tests**
   - Header extraction
   - Base64 decoding
   - MIME multipart handling
   - HTML stripping fallback
   - Snippet fallback for empty body

4. **Classification Tests**
   - Each category keyword matching
   - Default "Other" category
   - Single category assignment

5. **Extraction Tests**
   - Each regex pattern (amount, date, URL, time, OTP)
   - Multiple matches captured
   - Empty results for no matches
   - Edge cases (HTML-only, empty body, invalid dates)

6. **Scoring Tests**
   - Each scoring rule
   - Default score
   - Sorting by score

7. **Summary Generation Tests**
   - Complete structure
   - Category grouping
   - Sorting within categories

8. **UI Rendering Tests**
   - Component rendering with React Testing Library
   - Category sections present
   - Email cards display all fields
   - Loading indicators
   - Error messages

9. **Privacy Tests**
   - No localStorage writes
   - No sessionStorage writes
   - No IndexedDB writes
   - Memory cleanup on unmount
   - Only Gmail API network calls

10. **Performance Tests**
    - 50 email processing under 2500ms
    - Summary generation under 200ms
    - Single email extraction under 50ms

### Integration Testing

While the focus is on unit and property tests, key integration points to verify:

1. **OAuth → Fetch → Process → Display** full flow
2. **Fetch → Parse → Classify → Extract → Score → Summarize** pipeline
3. **Summary → Compose → Send** email flow

### Test Organization

```
src/
  modules/
    auth/
      auth.ts
      auth.test.ts
      auth.properties.test.ts
    fetcher/
      fetcher.ts
      fetcher.test.ts
      fetcher.properties.test.ts
    parser/
      parser.ts
      parser.test.ts
      parser.properties.test.ts
    rule-engine/
      classifier.ts
      classifier.test.ts
      classifier.properties.test.ts
      extractor.ts
      extractor.test.ts
      extractor.properties.test.ts
      scorer.ts
      scorer.test.ts
      scorer.properties.test.ts
    summary/
      generator.ts
      generator.test.ts
      generator.properties.test.ts
  test-utils/
    generators.ts  // fast-check generators
    fixtures.ts    // sample email data
```

## Implementation Notes

### Security Considerations

1. **XSS Prevention**: Sanitize all email content before rendering HTML
2. **CSRF Protection**: Not applicable (no backend)
3. **Token Security**: Store in memory only, never in localStorage
4. **Content Security Policy**: Restrict script sources, no inline scripts
5. **HTTPS Only**: Enforce HTTPS for all Gmail API calls

### Performance Optimizations

1. **Batch Fetching**: Use Promise.all for parallel message fetching
2. **Lazy Rendering**: Virtualize long email lists with react-window
3. **Memoization**: Cache regex compilation, memoize expensive computations
4. **Web Workers**: Consider moving rule engine to worker thread for large batches
5. **Incremental Processing**: Process and display emails as they arrive

### Browser Compatibility

- Target: Modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Required APIs: Fetch, Promises, ES6+, Web Storage (for detection only)
- Polyfills: None required for target browsers

### Deployment

- **Hosting**: Static hosting (Vercel, Netlify, GitHub Pages)
- **Build**: Vite production build with minification
- **Environment Variables**: OAuth client ID (public, safe to expose)
- **No Backend**: Zero server-side infrastructure required

## Future Enhancements

Potential features for future iterations (not in current scope):

1. **Custom Rules**: Allow users to define their own classification keywords
2. **Multi-Account**: Support multiple Gmail accounts
3. **Scheduling**: Auto-scan at specific times (requires service worker)
4. **Export**: Download summary as PDF or CSV
5. **Filters**: Advanced filtering and search within processed emails
6. **Statistics**: Show email volume trends over time (stored locally)
7. **Dark Mode**: Theme toggle for UI
8. **Internationalization**: Support multiple languages
9. **Accessibility**: WCAG 2.1 AA compliance improvements
10. **Mobile App**: React Native version for iOS/Android
