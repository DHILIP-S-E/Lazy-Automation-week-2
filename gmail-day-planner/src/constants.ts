// Category keywords for email classification
export const CATEGORY_KEYWORDS = {
  Bills: ['invoice', 'payment', 'bill', 'receipt', 'charge', 'transaction', 'amount due', 'due date', 'billing', 'subscription'],
  'Student Meetings': ['class', 'lecture', 'assignment', 'exam', 'course', 'professor', 'university', 'college', 'semester', 'student', 'academic', 'education'],
  'Job Meetings': ['interview', 'job interview', 'recruiter', 'hiring manager', 'screening call', 'round'],
  'Internship Meetings': ['internship', 'intern', 'intern interview', 'intern opportunity'],
  Meetings: ['meeting', 'meet', 'zoom', 'teams', 'conference', 'call', 'join', 'webinar', 'session'],
  Promotions: ['offer', 'discount', 'sale', 'deal', 'promo', 'coupon', 'limited', 'save', 'free', 'exclusive', 'shop'],
  OTP: ['otp', 'verification', 'verify', 'code', 'one-time', 'security code', 'authentication', 'confirm'],
  Jobs: ['job', 'hiring', 'apply', 'position', 'vacancy', 'career', 'opening', 'opportunity', 'role'],
} as const;

// Regex patterns for data extraction
export const REGEX_PATTERNS = {
  amount: /[₹$€£]\s?\d+(?:,\d{3})*(?:\.\d{1,2})?/g,
  dueDate: /\d{1,2}[/-]\d{1,2}[/-]\d{4}/g,
  url: /https?:\/\/\S+/g,
  time: /\d{1,2}:\d{2}\s?(?:AM|PM|am|pm)/gi,
  otp: /\b\d{4,8}\b/g,
} as const;

// OAuth configuration
export const OAUTH_SCOPES = [
  'profile',
  'email',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/calendar',
] as const;

// Google Calendar API
export const CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3';

// Gmail API endpoints
export const GMAIL_API_BASE = 'https://gmail.googleapis.com/gmail/v1';

// Importance score thresholds
export const IMPORTANCE_SCORES = {
  URGENT_BILL: 10,
  URGENT_JOB: 8,
  TODAY_MEETING: 9,
  HAS_ATTACHMENT: 6,
  DEFAULT: 3,
  IMPORTANT_THRESHOLD: 8,
} as const;

// Performance thresholds (in milliseconds)
export const PERFORMANCE_THRESHOLDS = {
  BATCH_PROCESSING: 2500,
  SUMMARY_GENERATION: 200,
  SINGLE_EMAIL_EXTRACTION: 50,
  LOADING_INDICATOR_DELAY: 500,
} as const;
