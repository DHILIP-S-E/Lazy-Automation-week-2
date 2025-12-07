# Requirements Document

## Introduction

AutoMail Day Planner is a fully client-side, privacy-preserving, local-only web application that automates the daily task of reading and organizing email. The system authenticates users through Google OAuth (read-only), fetches emails directly into browser memory, processes each email through a deterministic rule engine, extracts structured meaning (amounts, due dates, meeting times, deadlines), and generates a consolidated daily summary. The entire system runs inside the user's browser with zero backend storage, ensuring mathematical privacy guarantees.

## Glossary

- **System**: The AutoMail Day Planner web application
- **User**: The person accessing their Gmail account through the System
- **Rule Engine**: The deterministic logic component that classifies and extracts data from emails using keywords and regex patterns
- **Summary**: The structured daily report generated from processed emails
- **Local-First**: Architecture pattern where all processing occurs in the browser with no backend servers or databases
- **OAuth Token**: The read-only access credential obtained from Google for Gmail API access
- **Category**: A classification label assigned to emails (Bills, Jobs, Meetings, OTP, Attachments, Other)
- **Importance Score**: A numeric value (0-10) assigned to emails based on urgency and relevance
- **Browser Memory**: Volatile RAM storage that is cleared when the browser tab closes

## Requirements

### Requirement 1

**User Story:** As a user, I want to authenticate with Google using OAuth, so that the System can access my Gmail data securely without storing my credentials.

#### Acceptance Criteria

1. WHEN the User clicks the login button, THE System SHALL initiate Google OAuth flow requesting profile, email, and gmail.readonly scopes
2. WHEN Google returns an access token, THE System SHALL store the token in browser memory only
3. THE System SHALL NOT persist the OAuth token to localStorage, sessionStorage, or any persistent storage mechanism
4. WHEN the browser tab closes, THE System SHALL automatically discard the OAuth token from memory
5. IF OAuth authentication fails, THEN THE System SHALL display an error message and allow retry

### Requirement 2

**User Story:** As a user, I want to fetch my recent emails into the browser, so that they can be processed locally without backend storage.

#### Acceptance Criteria

1. WHEN the User clicks "Scan Emails", THE System SHALL request up to 50 recent message IDs from Gmail API
2. WHEN message IDs are received, THE System SHALL fetch full message details for each ID using Gmail API
3. THE System SHALL parse each email payload into structured format containing subject, from, date, snippet, plainText, htmlText, and attachments
4. THE System SHALL store all fetched email data in browser memory only
5. THE System SHALL NOT write email data to any persistent storage, database, or file system
6. WHEN email fetching completes, THE System SHALL display the total count of emails processed

### Requirement 3

**User Story:** As a user, I want emails to be automatically categorized by type, so that I can quickly understand what kinds of messages I received.

#### Acceptance Criteria

1. WHEN an email contains keywords "bill", "invoice", "payment", "amount due", "due date", or "receipt", THE System SHALL assign category "Bills"
2. WHEN an email contains keywords "job", "hiring", "apply", "intern", or "opportunity", THE System SHALL assign category "Jobs"
3. WHEN an email contains keywords "join meeting", "Google Meet", "Zoom link", "schedule", or "invite", THE System SHALL assign category "Meetings"
4. WHEN an email contains pattern "your code is" or matches 6-digit code regex, THE System SHALL assign category "OTP"
5. WHEN an email contains attachments, THE System SHALL assign category "Attachments"
6. WHEN an email does not match any category rules, THE System SHALL assign category "Other"
7. THE System SHALL assign exactly one primary category to each email

### Requirement 4

**User Story:** As a user, I want important information extracted from emails automatically, so that I don't have to manually read each message to find key details.

#### Acceptance Criteria

1. WHEN processing an email, THE System SHALL extract monetary amounts using regex pattern matching currency symbols and numeric formats
2. WHEN processing an email, THE System SHALL extract due dates using regex pattern matching date formats (DD/MM/YYYY, DD-MM-YYYY, and common variations)
3. WHEN processing an email, THE System SHALL extract URLs using regex pattern matching http/https protocols
4. WHEN processing an email, THE System SHALL extract time values using regex pattern matching HH:MM AM/PM formats
5. WHEN processing an email, THE System SHALL extract 6-digit OTP codes using regex pattern matching numeric sequences
6. WHEN extraction finds multiple matches of the same type, THE System SHALL store all matches in an array
7. WHEN extraction finds no matches for a pattern, THE System SHALL store an empty value without error

### Requirement 5

**User Story:** As a user, I want emails scored by importance, so that urgent items appear first in my summary.

#### Acceptance Criteria

1. WHEN an email is categorized as "Bills" and due date is within 1 day, THE System SHALL assign importance score 10
2. WHEN an email is categorized as "Jobs" and deadline is within 3 days, THE System SHALL assign importance score 8
3. WHEN an email is categorized as "Meetings" and meeting time is today, THE System SHALL assign importance score 9
4. WHEN an email contains attachments, THE System SHALL assign importance score 6
5. WHEN an email does not match high-priority rules, THE System SHALL assign importance score 3
6. THE System SHALL use importance scores to sort emails within each category in descending order

### Requirement 6

**User Story:** As a user, I want to see a consolidated daily summary of my emails, so that I can understand my day's priorities at a glance.

#### Acceptance Criteria

1. WHEN email processing completes, THE System SHALL generate a structured summary object containing bills, jobs, meetings, attachments, otp, and important arrays
2. WHEN rendering the summary, THE System SHALL display each category in a separate section with appropriate icons
3. WHEN displaying bill emails, THE System SHALL show extracted amount and due date alongside subject
4. WHEN displaying job emails, THE System SHALL show application deadline and extracted URLs
5. WHEN displaying meeting emails, THE System SHALL show meeting time and join links
6. WHEN displaying attachment emails, THE System SHALL list all attachment filenames
7. WHEN displaying OTP emails, THE System SHALL show extracted codes prominently
8. THE System SHALL generate the summary in browser memory without persisting to storage

### Requirement 7

**User Story:** As a user, I want to email the summary to myself, so that I can reference it throughout the day on any device.

#### Acceptance Criteria

1. WHEN the User clicks "Email Summary to Myself", THE System SHALL compose an HTML email containing the formatted summary
2. WHEN sending via Gmail API, THE System SHALL use the send endpoint with RFC822 formatted message
3. WHEN sending the email, THE System SHALL set the recipient to the authenticated user's email address
4. WHEN sending the email, THE System SHALL set subject to "Your Daily Email Summary - [Current Date]"
5. WHEN email sending completes successfully, THE System SHALL display a confirmation message
6. IF email sending fails, THEN THE System SHALL display an error message with retry option

### Requirement 8

**User Story:** As a user, I want absolute privacy guarantees, so that my personal email data never leaves my device.

#### Acceptance Criteria

1. THE System SHALL execute all email processing logic in the browser client only
2. THE System SHALL NOT transmit email content to any backend server, database, or third-party service except Gmail API
3. THE System SHALL NOT persist email data to localStorage, sessionStorage, IndexedDB, cookies, or file system
4. THE System SHALL NOT log email content to console, analytics, or monitoring services
5. WHEN the browser tab closes, THE System SHALL automatically clear all email data from memory
6. THE System SHALL request only gmail.readonly OAuth scope and SHALL NOT request write or delete permissions

### Requirement 9

**User Story:** As a user, I want the System to handle edge cases gracefully, so that processing doesn't fail on unusual email formats.

#### Acceptance Criteria

1. WHEN an email contains only HTML body with no plain text, THE System SHALL extract text by stripping HTML tags
2. WHEN an email has no body content, THE System SHALL use the snippet field as fallback
3. WHEN an email contains invalid or unparseable dates, THE System SHALL mark date as "not found" and continue processing
4. WHEN an email has multiple attachments, THE System SHALL list all attachment names in the summary
5. WHEN a bill email has no extractable due date, THE System SHALL display "Due date not found"
6. WHEN a job email has no apply link, THE System SHALL extract the first URL found in the email body
7. WHEN a meeting email has no extractable time, THE System SHALL attempt to extract time from calendar link parameters

### Requirement 10

**User Story:** As a user, I want a clean and intuitive interface, so that I can accomplish my tasks with minimal clicks.

#### Acceptance Criteria

1. WHEN the User first visits the application, THE System SHALL display a login screen with "Login with Google" button and privacy message
2. WHEN the User is authenticated, THE System SHALL display a dashboard with "Scan Emails", "View Summary", and "Email Summary" actions
3. WHEN displaying the summary, THE System SHALL organize content into tabbed sections for Bills, Jobs, Meetings, Attachments, and Important
4. WHEN rendering email cards, THE System SHALL display subject, sender, date, and extracted information in a readable format
5. THE System SHALL use icons to visually distinguish different email categories
6. THE System SHALL provide visual feedback during email fetching and processing operations

### Requirement 11

**User Story:** As a developer, I want the System to meet performance requirements, so that users experience fast and responsive interactions.

#### Acceptance Criteria

1. WHEN processing 50 emails, THE System SHALL complete rule engine execution in less than 2500 milliseconds (excluding network latency)
2. WHEN generating the summary, THE System SHALL complete rendering in less than 200 milliseconds
3. WHEN applying regex extraction to a single email, THE System SHALL complete processing in less than 50 milliseconds
4. THE System SHALL display a loading indicator when operations exceed 500 milliseconds
5. THE System SHALL process emails incrementally and update UI progressively rather than blocking until all emails complete

### Requirement 12

**User Story:** As a user, I want the System to maintain read-only access to my Gmail, so that it cannot accidentally delete or modify my emails.

#### Acceptance Criteria

1. THE System SHALL request only gmail.readonly OAuth scope
2. THE System SHALL NOT call Gmail API endpoints for delete, trash, modify, or send operations except for the optional summary email feature
3. THE System SHALL NOT mark emails as read or unread
4. THE System SHALL NOT move emails between folders or apply labels
5. THE System SHALL NOT modify email content, headers, or metadata
