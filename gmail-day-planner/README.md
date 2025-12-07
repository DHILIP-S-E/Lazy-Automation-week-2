# AutoMail Day Planner 📧

A smart Gmail email organizer and day planner that helps you manage your inbox efficiently with AI-powered categorization, priority scoring, and intelligent insights.

## 🌟 Features

### 1. **Smart Email Categorization**
- Automatically categorizes emails into:
  - 💰 Bills (payment reminders, invoices)
  - 📚 Student Meetings (class schedules, academic meetings)
  - 💼 Job Meetings (interviews, job-related meetings)
  - 🎯 Internship Meetings (internship interviews and updates)
  - 📅 General Meetings (all other meetings)
  - ⭐ Promotions (marketing, offers)
  - 💼 Jobs (job alerts, career opportunities)
  - 🔐 OTP (one-time passwords, verification codes)
  - 📎 Attachments (emails with files)
  - 📧 Other (uncategorized emails)

### 2. **Priority Score System**
- Real-time priority calculation (0-100 scale)
- Dynamic scoring based on:
  - Bills with due dates
  - Job/career opportunities
  - Meetings with times
  - Attachments
  - Urgent keywords
- Visual priority indicators (High/Medium/Low)
- Detailed score breakdown

### 3. **Smart Insights Panel**
- **Stress Level Indicator**: Analyzes email urgency and workload
- **Meeting Timeline**: Shows today's meetings with conflict detection
- **Duplicate Detection**: Identifies and groups duplicate emails
- **Saved Emails**: Quick access to starred/important emails

### 4. **Email Analysis & Extraction**
- Automatically extracts:
  - 💵 Payment amounts
  - 📅 Due dates
  - ⏰ Meeting times
  - 🔗 URLs and links
  - 🔐 OTP codes
  - 📎 Attachments
- Smart date/time parsing
- Currency detection

### 5. **Reminder System**
- Schedule email reminders
- Send to yourself or others
- Custom date/time selection
- Browser notifications
- Automatic reminder delivery

### 6. **Calendar Integration**
- Add meetings to Google Calendar
- One-click event creation
- Auto-populated event details
- Time zone support

### 7. **Email Summary**
- Generate daily email summaries
- Email summary to yourself
- Send summary to others
- Categorized overview
- Priority highlights

### 8. **Advanced Filtering & Search**
- Filter by category
- Search by subject/sender
- Sort by importance/date/sender
- View density options (comfortable/compact)
- Recent search history

### 9. **Today's Summary Modal**
- Quick overview of today's emails
- Urgent tasks highlighted
- Meeting schedule
- Bill reminders
- OTP codes

### 10. **Privacy & Security**
- 🔒 100% client-side processing
- No server-side data storage
- OAuth 2.0 authentication
- Automatic session cleanup
- Console log sanitization
- XSS protection
- Input validation
- Secure token handling

### 11. **User Experience**
- 🌓 Dark mode support
- 📱 Responsive design
- ⚡ Fast performance
- 🎨 Modern UI with animations
- 💾 Local storage for saved emails
- 🔄 Auto-refresh capability
- ⌨️ Keyboard shortcuts (R to refresh)

### 12. **Notifications**
- Toast notifications for actions
- Success/error feedback
- Browser notification support
- Non-intrusive alerts

## 🚀 Technology Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Custom CSS with Tailwind-inspired design system
- **Authentication**: Google OAuth 2.0
- **API**: Gmail API
- **Build Tool**: Vite
- **Deployment**: GitHub Pages

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/dhilip-s-e/Lazy-Automation-week-2.git

# Navigate to project
cd week2/gmail-day-planner

# Install dependencies
npm install

# Create .env file
echo "VITE_GOOGLE_CLIENT_ID=your_client_id_here" > .env

# Run development server
npm run dev

# Build for production
npm run build
```

## 🔑 Setup Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Gmail API
4. Create OAuth 2.0 credentials
5. Add authorized JavaScript origins:
   - `http://localhost:5173` (development)
   - `https://dhilip-s-e.github.io` (production)
6. Add authorized redirect URIs
7. Copy Client ID to `.env` file

## 📁 Project Structure

```
gmail-day-planner/
├── src/
│   ├── components/          # React components
│   │   ├── Dashboard.tsx    # Main dashboard
│   │   ├── EmailCard.tsx    # Email display card
│   │   ├── LoginScreen.tsx  # OAuth login
│   │   ├── SummaryView.tsx  # Email summary
│   │   ├── InsightsPanel.tsx # Smart insights
│   │   ├── RemindMeModal.tsx # Reminder scheduler
│   │   └── ...
│   ├── modules/             # Core functionality
│   │   ├── auth/           # Authentication
│   │   ├── fetcher/        # Gmail API calls
│   │   ├── parser/         # Email parsing
│   │   ├── rule-engine/    # Categorization logic
│   │   ├── insights/       # Smart analysis
│   │   ├── privacy/        # Security features
│   │   └── ...
│   ├── utils/              # Utility functions
│   │   └── security.ts     # Security utilities
│   ├── types/              # TypeScript types
│   └── App.tsx             # Main app component
├── public/
│   ├── logo.jpeg           # App logo
│   ├── privacy.html        # Privacy policy
│   └── terms.html          # Terms of service
└── package.json
```

## 🎯 Key Algorithms

### Priority Score Calculation
```typescript
Priority Score = (Bills × importance) + 
                 (Jobs × importance) + 
                 (Meetings × importance) + 
                 (Attachments × importance) + 
                 (Keywords × importance)

Normalized to 0-100 scale
```

### Email Categorization
- Rule-based classification
- Keyword matching
- Pattern recognition
- Sender analysis
- Content parsing

### Stress Level Analysis
- Email volume
- Urgency indicators
- Deadline proximity
- Unread count
- Response requirements

## 🔒 Security Features

- Input validation on all user inputs
- HTML sanitization to prevent XSS
- Secure URL validation
- Access token format verification
- Async clipboard with fallback
- No sensitive data in console logs
- Privacy Guard for data protection
- Secure external link handling

## 📊 Performance

- Batch email fetching (5 at a time)
- Rate limit handling
- Optimized re-renders with React.memo
- Lazy loading
- Efficient state management
- Local caching

## 🌐 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Opera

## 📝 License

MIT License - feel free to use for personal or commercial projects

## 👨‍💻 Author

**Dhilip S E**
- GitHub: [@dhilip-s-e](https://github.com/dhilip-s-e)
- Project: [AutoMail Day Planner](https://dhilip-s-e.github.io/Lazy-Automation-week-2/)

## 🤝 Contributing

Contributions welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues or questions, please open an issue on GitHub.

---

Made with ❤️ for better email management
