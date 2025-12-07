# AutoMail Day Planner - Detailed Features Documentation

## 📋 Table of Contents
1. [Email Categorization](#email-categorization)
2. [Priority Scoring](#priority-scoring)
3. [Smart Insights](#smart-insights)
4. [Reminders & Notifications](#reminders--notifications)
5. [Calendar Integration](#calendar-integration)
6. [Email Summaries](#email-summaries)
7. [Search & Filtering](#search--filtering)
8. [Privacy & Security](#privacy--security)

---

## 📧 Email Categorization

### How It Works
The app uses a sophisticated rule-based engine to automatically categorize emails:

#### Categories:
1. **Bills (💰)**
   - Keywords: payment, invoice, bill, due, amount, pay
   - Extracts: amounts, due dates
   - Priority: High

2. **Student Meetings (📚)**
   - Keywords: class, lecture, assignment, professor, course
   - Extracts: meeting times, locations
   - Priority: Medium-High

3. **Job Meetings (💼)**
   - Keywords: interview, job, position, hiring, recruiter
   - Extracts: interview times, company names
   - Priority: High

4. **Internship Meetings (🎯)**
   - Keywords: internship, intern, training
   - Extracts: meeting details
   - Priority: High

5. **General Meetings (📅)**
   - Keywords: meeting, schedule, appointment, call
   - Extracts: times, dates, locations
   - Priority: Medium

6. **Promotions (⭐)**
   - Keywords: offer, sale, discount, deal
   - Priority: Low

7. **Jobs (💼)**
   - Keywords: job alert, career, opportunity
   - Priority: Medium

8. **OTP (🔐)**
   - Keywords: OTP, verification, code
   - Extracts: 4-8 digit codes
   - Priority: High (time-sensitive)

9. **Attachments (📎)**
   - Emails with files attached
   - Shows file count and sizes
   - Priority: Medium

10. **Other (📧)**
    - Uncategorized emails
    - Priority: Low

### Data Extraction
For each email, the system extracts:
- **Amounts**: $100, ₹500, €50, etc.
- **Due Dates**: "due by Jan 15", "deadline: tomorrow"
- **Times**: "3:00 PM", "15:30", "at 9am"
- **URLs**: All clickable links
- **OTP Codes**: 4-8 digit verification codes
- **Attachments**: File names and sizes

---

## 🎯 Priority Scoring

### Scoring Algorithm

```
Total Score = Bills Score + Jobs Score + Meetings Score + 
              Attachments Score + Keywords Score

Normalized to 0-100 scale based on email count
```

### Score Breakdown:
- **Bills**: Each bill email × importance score
- **Jobs/Career**: Each job-related email × importance score
- **Meetings**: Each meeting email × importance score
- **Attachments**: Each email with files × importance score
- **Keywords**: Emails with urgent keywords × importance score

### Priority Levels:
- **High (60-100)**: 🔴 Red indicator - Immediate attention needed
- **Medium (30-59)**: 🟡 Yellow indicator - Review soon
- **Low (0-29)**: 🟢 Green indicator - No urgency

### Visual Display:
- Large score number (0-100)
- Color-coded status badge
- Detailed breakdown by category
- Urgent tasks list (top 4)
- Progress bar visualization

---

## 💡 Smart Insights

### 1. Stress Level Indicator
**Purpose**: Measures email workload and urgency

**Calculation**:
- High importance emails count
- Urgent keywords frequency
- Unread email volume
- Deadline proximity

**Levels**:
- CRITICAL (8-10): 🔴 Overwhelming workload
- HIGH (6-7): 🟠 Heavy workload
- MODERATE (4-5): 🟡 Normal workload
- LOW (0-3): 🟢 Light workload

### 2. Meeting Timeline
**Features**:
- Shows all meetings for today
- Displays meeting times and subjects
- Detects scheduling conflicts
- Highlights upcoming meetings
- Color-coded urgency (within 1 hour = red)

### 3. Duplicate Detection
**How It Works**:
- Compares email subjects
- Identifies similar content
- Groups duplicates together
- Shows duplicate count
- Helps clean up inbox

### 4. Saved Emails
**Features**:
- Star important emails
- Quick access panel
- Persistent storage
- One-click save/unsave
- Separate saved view

---

## ⏰ Reminders & Notifications

### Reminder System

#### Features:
1. **Schedule Reminders**
   - Pick any future date/time
   - Send to yourself or others
   - Custom email content
   - Automatic delivery

2. **Recipient Options**:
   - Your email (default)
   - Another email address
   - Email validation

3. **Date/Time Picker**:
   - Calendar interface
   - Time selection
   - DD/MM/YYYY format
   - Future dates only
   - Quick "today" button

4. **Reminder Content**:
   - Original email subject
   - Sender information
   - Email snippet
   - Direct link to email

### Notification Types:

1. **Toast Notifications**
   - Success messages
   - Error alerts
   - Action confirmations
   - Auto-dismiss (3 seconds)
   - Top-right corner

2. **Browser Notifications**
   - Reminder scheduled
   - Summary sent
   - Calendar event added
   - Requires permission

---

## 📅 Calendar Integration

### Google Calendar Sync

#### Features:
1. **One-Click Add**
   - Automatic event creation
   - Pre-filled details
   - Meeting time extraction
   - Location parsing

2. **Event Details**:
   - Title: Email subject
   - Time: Extracted meeting time
   - Description: Email content
   - Attendees: Email sender

3. **Supported Meetings**:
   - Student meetings
   - Job interviews
   - General meetings
   - Internship meetings

4. **Smart Detection**:
   - Recognizes time formats
   - Parses date information
   - Handles time zones
   - Validates meeting data

---

## 📊 Email Summaries

### Summary Generation

#### Types:
1. **Daily Summary**
   - All emails from today
   - Categorized breakdown
   - Priority highlights
   - Urgent tasks

2. **Full Summary**
   - Complete inbox overview
   - Category statistics
   - Important emails
   - Action items

### Summary Features:

1. **Email Me**
   - Send summary to your email
   - Formatted HTML email
   - Category sections
   - Priority indicators
   - Success notification

2. **Send to Other**
   - Share with colleagues
   - Email validation
   - Custom recipient
   - Confirmation toast

3. **Today's Summary Modal**
   - Quick popup view
   - Today's highlights
   - Meeting schedule
   - Bill reminders
   - OTP codes
   - Urgent tasks

### Summary Content:
- Total email count
- Category breakdown
- High priority items
- Upcoming meetings
- Bills due today
- OTP codes
- Attachments summary

---

## 🔍 Search & Filtering

### Search Features:

1. **Quick Search**
   - Search by subject
   - Search by sender
   - Real-time results
   - Highlight matches

2. **Recent Searches**
   - Last 5 searches saved
   - Quick re-search
   - Session storage
   - Dropdown suggestions

### Filtering Options:

1. **Category Filters**
   - All emails
   - Bills only
   - Meetings only
   - Jobs only
   - OTP only
   - Attachments only
   - Saved only
   - High priority only
   - Duplicates only

2. **Sort Options**:
   - By importance (default)
   - By date (newest first)
   - By sender (alphabetical)

3. **View Density**:
   - Comfortable (default)
   - Compact (more emails visible)

### Filter Indicators:
- Active filter badge
- Email count display
- Clear filter button
- Visual feedback

---

## 🔒 Privacy & Security

### Security Measures:

1. **Authentication**
   - OAuth 2.0 via Google
   - No password storage
   - Secure token handling
   - Auto-logout on close

2. **Data Protection**
   - Client-side only processing
   - No server storage
   - No third-party sharing
   - Local browser storage

3. **Input Validation**
   - Email format validation
   - URL validation
   - Token verification
   - XSS prevention

4. **Security Utils**:
   ```typescript
   - validateEmail()
   - sanitizeHTML()
   - escapeHTML()
   - validateAccessToken()
   ```

5. **Privacy Guard**
   - Console log sanitization
   - Sensitive data redaction
   - Network request validation
   - Allowed domains only

6. **Secure Features**:
   - Async clipboard (no alerts)
   - External links: nofollow
   - HTTPS only
   - CSP headers

### Data Handling:

1. **What We Access**:
   - Email metadata
   - Email content
   - OAuth tokens

2. **What We DON'T Do**:
   - Store on servers
   - Share with third parties
   - Sell data
   - Track users
   - Log sensitive info

3. **User Control**:
   - Revoke access anytime
   - Clear local data
   - Logout clears session
   - No persistent tracking

### Compliance:
- GDPR compliant
- Privacy policy provided
- Terms of service
- User consent required
- Data transparency

---

## 🎨 User Interface Features

### Design Elements:

1. **Dark Mode**
   - Toggle switch
   - Persistent preference
   - Smooth transitions
   - Eye-friendly colors

2. **Animations**
   - Fade-in effects
   - Slide-in cards
   - Hover effects
   - Loading states

3. **Responsive Design**
   - Mobile friendly
   - Tablet optimized
   - Desktop enhanced
   - Flexible layouts

4. **Visual Feedback**
   - Loading spinners
   - Progress bars
   - Success indicators
   - Error messages

### Accessibility:
- Keyboard navigation
- Screen reader support
- High contrast mode
- Focus indicators
- ARIA labels

---

## ⚡ Performance Features

### Optimization:

1. **Batch Processing**
   - Fetch 5 emails at a time
   - Rate limit handling
   - Progress tracking
   - Error recovery

2. **Caching**
   - Local storage
   - Session storage
   - Memoized components
   - Optimized re-renders

3. **Lazy Loading**
   - On-demand fetching
   - Incremental loading
   - Skeleton screens
   - Smooth scrolling

### Error Handling:
- Network error recovery
- API timeout handling
- Rate limit management
- User-friendly messages
- Retry mechanisms

---

## 🚀 Advanced Features

### 1. Keyboard Shortcuts
- `R`: Refresh emails
- `Esc`: Close modals
- `Enter`: Submit forms

### 2. Quick Actions
- Star email (hover)
- Set reminder (hover)
- Quick view
- One-click actions

### 3. Email Details Modal
- Full email view
- All extracted data
- Action buttons
- Save/unsave toggle

### 4. Statistics Dashboard
- Total emails
- Category counts
- Priority distribution
- Activity timeline

---

## 📱 Mobile Features

### Mobile Optimizations:
- Touch-friendly buttons
- Swipe gestures
- Responsive grid
- Mobile menu
- Compact view

### Mobile-Specific:
- Bottom navigation
- Full-screen modals
- Touch feedback
- Optimized fonts
- Reduced animations

---

## 🔄 Sync & Refresh

### Auto Features:
- Manual refresh button
- Keyboard shortcut (R)
- Last sync timestamp
- Progress indicator
- Error handling

### Sync Details:
- Fetches latest 50 emails
- Updates categories
- Recalculates scores
- Refreshes insights
- Updates timeline

---

**Last Updated**: January 2025
**Version**: 1.0.0
**Author**: Dhilip S E
