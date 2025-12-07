// Category keywords for email classification
export const CATEGORY_KEYWORDS = {
  Bills: ['invoice', 'payment due', 'amount due', 'due date', 'receipt', 'subscription charge', 'transaction receipt', 'billing statement', 'pay your bill'],
  'Student Meetings': ['class', 'lecture', 'assignment', 'exam', 'course', 'professor', 'university', 'college', 'semester', 'program', 'degree', 'learning', 'education', 'training program'],
  'Job Meetings': ['interview', 'job interview', 'recruiter', 'hiring manager', 'career opportunity'],
  'Internship Meetings': ['internship', 'intern interview', 'intern opportunity', 'associate consultant intern'],
  Meetings: ['meeting', 'google meet', 'zoom', 'teams meeting', 'join', 'conference call', 'discussion', 'call scheduled'],
  Promotions: ['offer', 'discount', 'sale', 'deal', 'promo', 'coupon', 'limited time', 'save', 'free shipping'],
  OTP: ['verification code', 'otp', 'security code', 'authentication code', 'confirm your'],
  Jobs: ['job alert', 'hiring for the role', 'apply now', 'position available', 'vacancy', 'employment opportunity', 'is hiring', 'job opening'],
} as const;

// Regex patterns for data extraction
export const REGEX_PATTERNS = {
  amount: /[₹$€£]\s?\d+(?:,\d{3})*(?:\.\d{1,2})?/g,
  dueDate: /\d{1,2}[/-]\d{1,2}[/-]\d{4}/g,
  url: /https?:\/\/\S+/g,
  time: /\d{1,2}:\d{2}\s?(AM|PM)/gi,
  otp: /\b\d{6}\b/g,
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
