# Implementation Plan

- [x] 1. Set up project structure and development environment
  - Initialize React + TypeScript + Vite project
  - Configure Tailwind CSS for styling
  - Install dependencies: @react-oauth/google, axios, date-fns, fast-check, vitest
  - Set up TypeScript configuration with strict mode
  - Create directory structure: src/modules, src/components, src/types, src/test-utils
  - Configure Vitest for unit and property-based testing
  - _Requirements: All (foundation for entire system)_

- [x] 2. Implement core type definitions and interfaces
  - Define TypeScript types for GmailMessage, ParsedEmail, ProcessedEmail, EmailSummary
  - Define EmailCategory, ExtractedData, and Attachment types
  - Define interface types for all modules (AuthModule, EmailFetcher, EmailParser, etc.)
  - Create constants file for category keywords and regex patterns
  - _Requirements: 3.1-3.7, 4.1-4.7_

- [x] 3. Implement authentication module
  - Create AuthModule with OAuth 2.0 integration using @react-oauth/google
  - Implement initiateLogin() to trigger Google OAuth with gmail.readonly scope
  - Implement getAccessToken() to retrieve token from memory (React state)
  - Implement isAuthenticated() to check token validity
  - Implement logout() to clear token from memory
  - Store token in React Context, not localStorage
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 8.6, 12.1_

- [x]* 3.1 Write property test for OAuth scope configuration
  - **Property 2: Read-only OAuth scope**
  - **Validates: Requirements 1.1, 8.6, 12.1**

- [x]* 3.2 Write property test for memory-only token storage
  - **Property 1: No persistent storage (token portion)**
  - **Validates: Requirements 1.2, 1.3**

- [x]* 3.3 Write property test for token cleanup on unmount
  - **Property 4: Memory cleanup on unmount**
  - **Validates: Requirements 1.4, 8.5**

- [x]* 3.4 Write unit tests for authentication module
  - Test OAuth flow initiation
  - Test token retrieval
  - Test logout clears token
  - Test error handling for failed authentication
  - _Requirements: 1.1, 1.2, 1.5_

- [x] 4. Implement email fetcher module






  - Create EmailFetcher class with Gmail API integration
  - Implement fetchMessageIds() to call Gmail API messages.list endpoint
  - Implement fetchMessageDetails() to call Gmail API messages.get endpoint
  - Implement fetchBatch() using Promise.all for parallel fetching
  - Add error handling for network failures and rate limiting
  - Use Axios with access token in Authorization header
  - _Requirements: 2.1, 2.2_

- [x]* 4.1 Write property test for complete message fetching
  - **Property 5: Complete message fetching**
  - **Validates: Requirements 2.2**

- [x]* 4.2 Write unit tests for email fetcher
  - Test API call with correct parameters
  - Test batch fetching with multiple IDs
  - Test error handling for network failures
  - Test rate limiting response handling
  - _Requirements: 2.1, 2.2_

- [x] 5. Implement email parser module


  - Create EmailParser class to transform Gmail API responses
  - Implement parse() to extract headers (subject, from, to, date)
  - Implement extractPlainText() to decode base64 body and handle MIME parts
  - Implement extractHtmlText() to extract HTML content
  - Implement extractAttachments() to parse attachment metadata
  - Add fallback logic: HTML stripping for HTML-only emails, snippet for empty body
  - Handle edge cases: invalid dates, malformed payloads
  - _Requirements: 2.3, 9.1, 9.2, 9.3_

- [x]* 5.1 Write property test for complete email parsing
  - **Property 6: Complete email parsing**
  - **Validates: Requirements 2.3**

- [x]* 5.2 Write unit tests for email parser
  - Test header extraction
  - Test base64 decoding
  - Test MIME multipart handling
  - Test HTML stripping fallback (edge case)
  - Test snippet fallback for empty body (edge case)
  - Test invalid date handling (edge case)
  - _Requirements: 2.3, 9.1, 9.2, 9.3_

- [x] 6. Implement rule engine classifier


  - Create Classifier class with keyword-based categorization
  - Implement classify() method using CATEGORY_KEYWORDS constants
  - Check for Bills keywords: bill, invoice, payment, amount due, due date, receipt
  - Check for Jobs keywords: job, hiring, apply, intern, opportunity
  - Check for Meetings keywords: join meeting, google meet, zoom link, schedule, invite
  - Check for OTP patterns: "your code is" or 6-digit regex
  - Check for Attachments: attachments array length > 0
  - Default to "Other" category if no matches
  - Ensure exactly one category assigned per email
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [x]* 6.1 Write property test for Bills classification
  - **Property 7: Bills keyword classification**
  - **Validates: Requirements 3.1**

- [x]* 6.2 Write property test for Jobs classification
  - **Property 8: Jobs keyword classification**
  - **Validates: Requirements 3.2**

- [x]* 6.3 Write property test for Meetings classification
  - **Property 9: Meetings keyword classification**
  - **Validates: Requirements 3.3**

- [x]* 6.4 Write property test for OTP classification
  - **Property 10: OTP pattern classification**
  - **Validates: Requirements 3.4**

- [x]* 6.5 Write property test for Attachment classification
  - **Property 11: Attachment classification**
  - **Validates: Requirements 3.5**

- [x]* 6.6 Write property test for default Other classification
  - **Property 12: Default category classification**
  - **Validates: Requirements 3.6**

- [x]* 6.7 Write property test for single category assignment
  - **Property 13: Single category assignment**
  - **Validates: Requirements 3.7**

- [x]* 6.8 Write unit tests for classifier
  - Test each category with specific examples
  - Test edge cases with multiple keyword matches
  - Test emails with no keywords
  - _Requirements: 3.1-3.7_


- [x] 7. Implement rule engine extractor

  - Create Extractor class with regex-based data extraction
  - Implement extractAmount() using currency regex pattern
  - Implement extractDueDate() using date format regex pattern
  - Implement extractUrls() using URL regex pattern
  - Implement extractTime() using time format regex pattern
  - Implement extractOtp() using 6-digit code regex pattern
  - Return arrays for all extraction methods to capture multiple matches
  - Return empty arrays when no matches found (no errors)
  - Handle edge cases: multiple matches, no matches, malformed data
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

- [x]* 7.1 Write property test for amount extraction
  - **Property 14: Amount extraction completeness**
  - **Validates: Requirements 4.1, 4.6**

- [x]* 7.2 Write property test for due date extraction
  - **Property 15: Due date extraction completeness**
  - **Validates: Requirements 4.2, 4.6**

- [x]* 7.3 Write property test for URL extraction
  - **Property 16: URL extraction completeness**
  - **Validates: Requirements 4.3, 4.6**

- [x]* 7.4 Write property test for time extraction
  - **Property 17: Time extraction completeness**
  - **Validates: Requirements 4.4, 4.6**

- [x]* 7.5 Write property test for OTP extraction
  - **Property 18: OTP extraction completeness**
  - **Validates: Requirements 4.5, 4.6**

- [x]* 7.6 Write property test for graceful extraction failure
  - **Property 19: Graceful extraction failure**
  - **Validates: Requirements 4.7**

- [x]* 7.7 Write unit tests for extractor
  - Test each regex pattern with specific examples
  - Test multiple matches captured
  - Test empty results for no matches
  - Test edge cases with malformed data
  - _Requirements: 4.1-4.7_


- [x] 8. Implement rule engine scorer

  - Create Scorer class with importance scoring logic
  - Implement calculateScore() method
  - Score 10 for Bills with due date within 1 day
  - Score 8 for Jobs with deadline within 3 days
  - Score 9 for Meetings with time today
  - Score 6 for emails with attachments
  - Score 3 as default for other emails
  - Add helper functions: isDueSoon(), isToday()
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x]* 8.1 Write property test for urgent bills scoring
  - **Property 20: Urgent bills scoring**
  - **Validates: Requirements 5.1**

- [x]* 8.2 Write property test for urgent jobs scoring
  - **Property 21: Urgent jobs scoring**
  - **Validates: Requirements 5.2**

- [x]* 8.3 Write property test for today's meetings scoring
  - **Property 22: Today's meetings scoring**
  - **Validates: Requirements 5.3**

- [x]* 8.4 Write property test for attachment scoring
  - **Property 23: Attachment scoring**
  - **Validates: Requirements 5.4**

- [x]* 8.5 Write property test for default scoring
  - **Property 24: Default scoring**
  - **Validates: Requirements 5.5**

- [x]* 8.6 Write unit tests for scorer
  - Test each scoring rule with specific examples
  - Test helper methods (isDueSoon, isToday)
  - Test priority ordering
  - _Requirements: 5.1-5.5_amples
  - Test default score
  - Test edge cases with multiple scoring conditions
  - _Requirements: 5.1-5.5_


- [x] 9. Integrate rule engine pipeline

  - Create RuleEngine class that orchestrates Classifier, Extractor, and Scorer
  - Implement process() method that takes ParsedEmail and returns ProcessedEmail
  - Chain operations: classify → extract → score
  - Ensure pipeline is pure (no side effects)
  - Add error handling to continue processing on individual email failures
  - _Requirements: 3.1-3.7, 4.1-4.7, 5.1-5.5_

- [ ]* 9.1 Write unit tests for rule engine integration
  - Test full pipeline with sample emails
  - Test error handling for malformed emails
  - Test that pipeline doesn't mutate input
  - _Requirements: 3.1-5.5_

- [x] 10. Checkpoint - Ensure all tests pass

  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Implement summary generator


  - Create SummaryGenerator class
  - Implement generate() method that takes ProcessedEmail[] and returns EmailSummary
  - Group emails by category into separate arrays
  - Sort each category array by importanceScore descending
  - Create "important" array with emails scoring >= 8
  - Add generatedAt timestamp
  - Ensure summary structure has all required category arrays
  - _Requirements: 6.1, 5.6_

- [ ]* 11.1 Write property test for complete summary structure
  - **Property 26: Complete summary structure**
  - **Validates: Requirements 6.1**

- [ ]* 11.2 Write property test for category sorting
  - **Property 25: Category sorting by importance**
  - **Validates: Requirements 5.6**

- [ ]* 11.3 Write unit tests for summary generator
  - Test category grouping
  - Test sorting within categories
  - Test important emails filtering
  - Test empty email array handling
  - _Requirements: 6.1, 5.6_

- [x] 12. Create test utilities and generators


  - Create fast-check generators in src/test-utils/generators.ts
  - Implement emailGenerator for random ParsedEmail objects
  - Implement gmailMessageGenerator for random Gmail API responses
  - Implement keywordEmailGenerator for emails with specific keywords
  - Implement dateStringGenerator for various date formats
  - Implement currencyAmountGenerator for monetary amounts
  - Implement urlGenerator for valid URLs
  - Implement otpGenerator for 6-digit codes
  - Create fixtures in src/test-utils/fixtures.ts with sample email data
  - _Requirements: All (testing infrastructure)_


- [x] 13. Implement UI components - Login screen

  - Create LoginScreen component
  - Add "Login with Google" button using @react-oauth/google
  - Display privacy message: "This app reads your emails locally. No data is stored."
  - Style with Tailwind CSS for clean, minimal design
  - Handle OAuth callback and token storage
  - _Requirements: 1.1, 10.1_

- [ ]* 13.1 Write unit tests for login screen
  - Test component renders with button and message
  - Test button click triggers OAuth
  - Test error display on auth failure
  - _Requirements: 1.1, 1.5, 10.1_


- [x] 14. Implement UI components - Dashboard

  - Create Dashboard component
  - Add "Scan Emails" button
  - Add "View Summary" button
  - Add "Email Summary to Myself" button
  - Display email count after scanning
  - Show loading indicator during operations
  - Display error messages when operations fail
  - Style with Tailwind CSS
  - _Requirements: 2.6, 10.2, 10.6_

- [ ]* 14.1 Write unit tests for dashboard
  - Test component renders with all action buttons
  - Test loading indicator appears during async operations
  - Test email count display
  - Test error message display
  - _Requirements: 2.6, 10.2, 10.6_


- [x] 15. Implement UI components - Summary view

  - Create SummaryView component with tabbed interface
  - Create tabs for: Bills, Jobs, Meetings, Attachments, Important
  - Add category-specific icons (💰 Bills, 💼 Jobs, 📅 Meetings, 📎 Attachments, ⭐ Important)
  - Implement tab switching logic
  - Style with Tailwind CSS
  - _Requirements: 6.2, 10.3, 10.5_

- [ ]* 15.1 Write property test for summary category sections
  - **Property 39: Summary category sections**
  - **Validates: Requirements 6.2, 10.3, 10.5**

- [ ]* 15.2 Write unit tests for summary view
  - Test all tabs render
  - Test tab switching
  - Test icons display for each category
  - _Requirements: 6.2, 10.3, 10.5_


- [x] 16. Implement UI components - Email card

  - Create EmailCard component to display individual emails
  - Display subject, sender (from), and date
  - Display extracted amounts and due dates for Bills
  - Display extracted deadlines and URLs for Jobs
  - Display extracted times and join links for Meetings
  - Display attachment filenames for Attachments
  - Display extracted OTP codes prominently for OTP
  - Style with Tailwind CSS for readable card layout
  - _Requirements: 6.3, 6.4, 6.5, 6.6, 6.7, 10.4_

- [ ]* 16.1 Write property test for bill display completeness
  - **Property 27: Bill display completeness**
  - **Validates: Requirements 6.3**

- [ ]* 16.2 Write property test for job display completeness
  - **Property 28: Job display completeness**
  - **Validates: Requirements 6.4**

- [ ]* 16.3 Write property test for meeting display completeness
  - **Property 29: Meeting display completeness**
  - **Validates: Requirements 6.5**

- [ ]* 16.4 Write property test for attachment display completeness
  - **Property 30: Attachment display completeness**
  - **Validates: Requirements 6.6**

- [ ]* 16.5 Write property test for OTP display completeness
  - **Property 31: OTP display completeness**
  - **Validates: Requirements 6.7**

- [ ]* 16.6 Write property test for email card completeness
  - **Property 40: Email card completeness**
  - **Validates: Requirements 10.4**

- [ ]* 16.7 Write unit tests for email card
  - Test card renders all required fields
  - Test category-specific data display
  - Test handling of missing extracted data
  - _Requirements: 6.3-6.7, 10.4_


- [x] 17. Implement email sender module

  - Create EmailSender class
  - Create EmailComposer helper class
  - Implement composeHtml() to generate HTML email body from summary
  - Implement composeRfc822() to format message according to RFC822 standard
  - Implement sendSummary() to call Gmail API send endpoint
  - Set recipient to authenticated user's email
  - Set subject to "Your Daily Email Summary - [Current Date]"
  - Add error handling for send failures
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ]* 17.1 Write property test for RFC822 format
  - **Property 33: RFC822 message format**
  - **Validates: Requirements 7.2**

- [ ]* 17.2 Write property test for summary recipient correctness
  - **Property 34: Summary recipient correctness**
  - **Validates: Requirements 7.3**

- [ ]* 17.3 Write property test for summary subject format
  - **Property 35: Summary subject format**
  - **Validates: Requirements 7.4**

- [ ]* 17.4 Write unit tests for email sender
  - Test HTML composition from summary
  - Test RFC822 formatting
  - Test API call with correct parameters
  - Test error handling for send failures
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [x] 18. Implement application state management


  - Create AppContext using React Context API
  - Define AppState type with authToken, userEmail, emails, summary, isLoading, error
  - Create AppProvider component to wrap application
  - Implement state update functions: setAuth, setEmails, setSummary, setLoading, setError
  - Ensure state is memory-only (no persistence)
  - Implement cleanup on component unmount
  - _Requirements: 1.2, 1.3, 1.4, 2.4, 2.5, 6.8, 8.3, 8.5_

- [ ]* 18.1 Write property test for no persistent storage
  - **Property 1: No persistent storage (complete)**
  - **Validates: Requirements 1.2, 1.3, 2.4, 2.5, 8.3**

- [ ]* 18.2 Write property test for summary memory-only storage
  - **Property 32: Summary memory-only storage**
  - **Validates: Requirements 6.8**

- [ ]* 18.3 Write unit tests for state management
  - Test state initialization
  - Test state updates
  - Test cleanup on unmount
  - Test no localStorage/sessionStorage writes
  - _Requirements: 1.2-1.4, 2.4, 2.5, 6.8, 8.3, 8.5_

- [x] 19. Implement privacy safeguards


  - Add checks to prevent localStorage/sessionStorage writes
  - Add checks to prevent IndexedDB usage
  - Implement network request monitoring to ensure only Gmail API calls
  - Override console.log/error to prevent email content logging (dev mode only)
  - Add Content Security Policy meta tags
  - _Requirements: 8.2, 8.3, 8.4_

- [ ]* 19.1 Write property test for no external data transmission
  - **Property 36: No external data transmission**
  - **Validates: Requirements 8.2**

- [ ]* 19.2 Write property test for no email content logging
  - **Property 37: No email content logging**
  - **Validates: Requirements 8.4**

- [ ]* 19.3 Write unit tests for privacy safeguards
  - Test localStorage detection and prevention
  - Test network request filtering
  - Test console logging prevention
  - _Requirements: 8.2, 8.3, 8.4_


- [x] 20. Implement read-only API enforcement

  - Add API call validator to check endpoint methods
  - Ensure only GET requests for email fetching
  - Allow POST only for send summary endpoint
  - Block DELETE, PUT, PATCH requests
  - Block modify/trash/label endpoints
  - _Requirements: 12.2, 12.3, 12.4, 12.5_

- [ ]* 20.1 Write property test for read-only API usage
  - **Property 3: Read-only API usage**
  - **Validates: Requirements 12.2, 12.3, 12.4, 12.5**

- [ ]* 20.2 Write unit tests for API enforcement
  - Test GET requests allowed
  - Test POST allowed only for send
  - Test modify endpoints blocked
  - _Requirements: 12.2-12.5_


- [x] 21. Checkpoint - Ensure all tests pass



  - Ensure all tests pass, ask the user if questions arise.


- [x] 22. Implement performance optimizations

  - Add Promise.all for parallel email fetching
  - Memoize regex compilation in extractor
  - Add React.memo to EmailCard component
  - Implement incremental processing with UI updates
  - Add loading progress indicator (X of Y emails processed)
  - _Requirements: 11.1, 11.5_

- [ ]* 22.1 Write property test for rule engine performance
  - **Property 42: Rule engine performance**
  - **Validates: Requirements 11.1**

- [ ]* 22.2 Write property test for summary generation performance
  - **Property 43: Summary generation performance**
  - **Validates: Requirements 11.2**

- [ ]* 22.3 Write property test for single email extraction performance
  - **Property 44: Single email extraction performance**
  - **Validates: Requirements 11.3**

- [ ]* 22.4 Write property test for progressive UI updates
  - **Property 45: Progressive UI updates**
  - **Validates: Requirements 11.5**

- [ ]* 22.5 Write property test for loading indicator timing
  - **Property 41: Loading indicator timing**
  - **Validates: Requirements 10.6, 11.4**

- [ ]* 22.6 Write unit tests for performance features
  - Test parallel fetching
  - Test incremental processing
  - Test loading progress updates
  - _Requirements: 11.1, 11.2, 11.3, 11.5_


- [x] 23. Wire up complete application flow

  - Create App.tsx as main component
  - Wrap with AppProvider for state management
  - Wrap with GoogleOAuthProvider for authentication
  - Implement routing logic: LoginScreen → Dashboard → SummaryView
  - Connect Dashboard buttons to fetcher, parser, rule engine, and summary generator
  - Connect "Email Summary" button to email sender
  - Add error boundaries for graceful error handling
  - Implement logout functionality
  - _Requirements: All_

- [ ]* 23.1 Write integration tests for complete flow
  - Test OAuth → Fetch → Process → Display flow
  - Test Fetch → Parse → Classify → Extract → Score → Summarize pipeline
  - Test Summary → Compose → Send flow
  - _Requirements: All_

- [x] 24. Add edge case handling


  - Implement HTML tag stripping for HTML-only emails
  - Implement snippet fallback for empty body emails
  - Implement "not found" display for missing due dates in bills
  - Implement first URL extraction for job emails without apply links
  - Implement calendar link parsing for meeting times
  - Add error handling for invalid dates
  - Add error handling for malformed email payloads
  - _Requirements: 9.1, 9.2, 9.3, 9.5, 9.6, 9.7_

- [ ]* 24.1 Write unit tests for edge cases
  - Test HTML stripping (edge case)
  - Test snippet fallback (edge case)
  - Test invalid date handling (edge case)
  - Test missing due date display (edge case)
  - Test URL fallback for jobs (edge case)
  - Test calendar link parsing (edge case)
  - _Requirements: 9.1-9.7_

- [x] 25. Implement error handling and user feedback


  - Add error handling for OAuth failures with retry button
  - Add error handling for network failures with retry button
  - Add error handling for rate limiting with countdown timer
  - Add error handling for malformed emails (skip and continue)
  - Display clear error messages to users
  - Add success confirmation for email send
  - Ensure partial functionality on errors (show successfully processed emails)
  - _Requirements: 1.5, 7.5, 7.6_

- [ ]* 25.1 Write unit tests for error handling
  - Test OAuth error display and retry
  - Test network error handling
  - Test rate limiting handling
  - Test malformed email handling
  - Test success confirmation display
  - _Requirements: 1.5, 7.5, 7.6_

- [x] 26. Create environment configuration
  - Create .env file for OAuth client ID
  - Add .env.example with placeholder values
  - Configure Vite to load environment variables
  - Add instructions in README for obtaining OAuth credentials
  - _Requirements: 1.1_


- [x] 27. Final checkpoint - Ensure all tests pass

  - Ensure all tests pass, ask the user if questions arise.


- [x] 28. Create deployment configuration

  - Configure Vite build for production
  - Add build script to package.json
  - Create vercel.json or netlify.toml for static hosting
  - Add Content Security Policy headers
  - Test production build locally
  - _Requirements: All_

- [ ]* 28.1 Write property test for email count display accuracy
  - **Property 38: Email count display accuracy**
  - **Validates: Requirements 2.6**
