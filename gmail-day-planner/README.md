# AutoMail Day Planner

A fully client-side, privacy-preserving, local-only web application that automates the daily task of reading and organizing email.

## Features

- **Local-First Architecture**: All processing happens in your browser
- **Zero Backend**: No servers, no databases, no cloud storage
- **Privacy Guaranteed**: Email data never leaves your device
- **Read-Only Access**: Only reads your Gmail, never modifies or deletes
- **Smart Categorization**: Automatically categorizes emails (Bills, Jobs, Meetings, OTP, etc.)
- **Data Extraction**: Extracts amounts, dates, times, URLs, and OTP codes
- **Daily Summary**: Generates a consolidated view of your important emails

## Setup

### Prerequisites

- Node.js 18+ and npm
- Google Cloud Project with OAuth 2.0 credentials

### Getting OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Gmail API
4. Go to "Credentials" → "Create Credentials" → "OAuth client ID"
5. Choose "Web application"
6. Add authorized JavaScript origins: `http://localhost:5173`
7. Add authorized redirect URIs: `http://localhost:5173`
8. Copy the Client ID

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
4. Add your Google OAuth Client ID to `.env`:
   ```
   VITE_GOOGLE_CLIENT_ID=your_actual_client_id_here
   ```

### Development

Run the development server:
```bash
npm run dev
```

Run tests:
```bash
npm test
```

Run tests with UI:
```bash
npm run test:ui
```

### Build

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Architecture

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Authentication**: Google OAuth 2.0 (read-only)
- **Testing**: Vitest + fast-check (property-based testing)
- **State Management**: React Context API (memory-only)

## Privacy & Security

- All email processing occurs in browser memory
- No data is persisted to localStorage, sessionStorage, or any storage
- OAuth tokens stored in memory only (cleared on tab close)
- Only requests gmail.readonly scope
- No backend servers or databases
- No third-party analytics or tracking

## License

MIT
