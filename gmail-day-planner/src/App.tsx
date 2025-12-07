import React, { useState, useCallback, useEffect } from 'react';
import type { ProcessedEmail } from './types/email';
import { AuthProvider, useAuth } from './modules/auth/AuthContext';
import { AppProvider, useAppState } from './modules/state/AppContext';
import { LoginScreen } from './components/LoginScreen';
import { Dashboard } from './components/Dashboard';
import { SummaryView } from './components/SummaryView';
import { TodaySummaryModal } from './components/TodaySummaryModal';
import { createEmailFetcher } from './modules/fetcher';
import { createEmailParser } from './modules/parser';
import { createRuleEngine } from './modules/rule-engine';
import { createSummaryGenerator } from './modules/summary';
import { createEmailSender } from './modules/sender';
import { createCalendarService } from './modules/calendar';
import { privacyGuard } from './modules/privacy';
import { createReminderService } from './modules/reminders/ReminderService';

type View = 'login' | 'dashboard' | 'summary';

const AppContent: React.FC = () => {
  const { isAuthenticated, getAccessToken, userEmail, logout: authLogout } = useAuth();
  const { emails, summary, isLoading, error, setEmails, setSummary, setLoading, setError, reset } = useAppState();
  const [view, setView] = useState<View>('login');
  const [progress, setProgress] = useState<{ fetched: number; total: number } | null>(null);
  const [hasAutoFetched, setHasAutoFetched] = useState(false);
  const [showTodaySummary, setShowTodaySummary] = useState(false);
  const reminderService = createReminderService();
  
  const accessToken = getAccessToken();
  const authenticated = isAuthenticated();

  useEffect(() => {
    privacyGuard.enableConsoleProtection();
    return () => privacyGuard.disableConsoleProtection();
  }, []);

  useEffect(() => {
    if (!authenticated || !accessToken) return;

    const checkReminders = async () => {
      const pending = reminderService.getPendingReminders();
      for (const reminder of pending) {
        try {
          const sender = createEmailSender(accessToken);
          await sender.scheduleReminder(reminder.recipientEmail, reminder.emailSubject, reminder.emailFrom, reminder.emailDetails, reminder.scheduledTime);
          reminderService.markAsSent(reminder.id);
        } catch (err) {
          console.error('Failed to send reminder:', err);
        }
      }
    };

    checkReminders();
    const interval = setInterval(checkReminders, 60000);
    return () => clearInterval(interval);
  }, [authenticated, accessToken]);

  useEffect(() => {
    if (authenticated) {
      setView('dashboard');
    } else {
      setView('login');
      setHasAutoFetched(false);
    }
  }, [authenticated]);

  const fetchEmails = useCallback(async () => {
    if (!accessToken) return;

    setLoading(true);
    setError(null);
    setProgress(null);

    try {
      const fetcher = createEmailFetcher(accessToken);
      const parser = createEmailParser();
      const ruleEngine = createRuleEngine();
      const summaryGenerator = createSummaryGenerator();

      const messageIds = await fetcher.fetchMessageIds(50);
      setProgress({ fetched: 0, total: messageIds.length });
      
      const messages = await fetcher.fetchBatch(messageIds, (fetched, total) => {
        setProgress({ fetched, total });
      });
      
      const parsedEmails = messages.map((msg) => parser.parse(msg));
      
      const filteredEmails = parsedEmails.filter(email => {
        const subject = email.subject.toLowerCase();
        const from = email.from.toLowerCase();
        return !subject.includes('automail summary') && 
               !subject.includes('daily summary') && 
               !subject.includes('reminder from automail') &&
               !from.includes('me');
      });
      
      const processedEmails = ruleEngine.processBatch(filteredEmails);
      const emailSummary = summaryGenerator.generate(processedEmails);

      setEmails(processedEmails);
      setSummary(emailSummary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch emails');
    } finally {
      setLoading(false);
      setProgress(null);
    }
  }, [accessToken, setEmails, setSummary, setLoading, setError]);

  useEffect(() => {
    if (authenticated && !hasAutoFetched) {
      setHasAutoFetched(true);
      fetchEmails();
    }
  }, [authenticated, hasAutoFetched, fetchEmails]);

  const handleRefresh = useCallback(() => {
    fetchEmails();
  }, [fetchEmails]);

  const handleEmailSummary = useCallback(async () => {
    if (!accessToken || !userEmail || !summary) return;

    setLoading(true);
    setError(null);

    try {
      const sender = createEmailSender(accessToken);
      await sender.sendSummary(summary, userEmail);
      alert('Summary sent to your email!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send email');
    } finally {
      setLoading(false);
    }
  }, [accessToken, userEmail, summary, setLoading, setError]);

  const handleSendToOther = useCallback(async () => {
    if (!accessToken || !userEmail || !summary) return;

    const recipientEmail = prompt('Enter recipient email address:');
    if (!recipientEmail || !recipientEmail.includes('@')) {
      if (recipientEmail !== null) alert('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const sender = createEmailSender(accessToken);
      await sender.sendSummary(summary, userEmail, recipientEmail);
      alert(`Summary sent to ${recipientEmail}!`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send email');
    } finally {
      setLoading(false);
    }
  }, [accessToken, userEmail, summary, setLoading, setError]);

  const handleTodaySummary = useCallback(() => {
    setShowTodaySummary(true);
  }, []);

  const handleScheduleReminder = useCallback(async (email: ProcessedEmail, recipientEmail: string, scheduledTime: Date) => {
    if (!accessToken) return;

    setLoading(true);
    setError(null);

    try {
      const sender = createEmailSender(accessToken);
      const details = email.plainText || email.snippet || 'No content available';
      await sender.scheduleReminder(recipientEmail, email.subject, email.from, details, scheduledTime);
      alert(`Reminder scheduled for ${scheduledTime.toLocaleString()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to schedule reminder');
    } finally {
      setLoading(false);
    }
  }, [accessToken, setLoading, setError]);

  const handleAddToCalendar = useCallback(async (email: ProcessedEmail) => {
    if (!accessToken) return;

    setLoading(true);
    setError(null);

    try {
      const calendarService = createCalendarService(accessToken);
      await calendarService.addToCalendar(email);
      alert('Event added to calendar!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add to calendar');
    } finally {
      setLoading(false);
    }
  }, [accessToken, setLoading, setError]);

  const handleLogout = useCallback(() => {
    authLogout();
    reset();
    setView('login');
  }, [authLogout, reset]);

  const handleViewSummary = useCallback(() => {
    if (summary) setView('summary');
  }, [summary]);

  const handleBackToDashboard = useCallback(() => {
    setView('dashboard');
  }, []);

  if (view === 'login' || !authenticated) {
    return <LoginScreen onLoginSuccess={() => setView('dashboard')} />;
  }

  if (view === 'summary' && summary) {
    return <SummaryView summary={summary} onBack={handleBackToDashboard} />;
  }

  return (
    <>
      <Dashboard
        emails={emails}
        summary={summary}
        isLoading={isLoading}
        error={error}
        progress={progress}
        userEmail={userEmail || ''}
        onRefresh={handleRefresh}
        onViewSummary={handleViewSummary}
        onEmailSummary={handleEmailSummary}
        onSendToOther={handleSendToOther}
        onTodaySummary={handleTodaySummary}
        onScheduleReminder={handleScheduleReminder}
        onAddToCalendar={handleAddToCalendar}
        onLogout={handleLogout}
      />
      {showTodaySummary && (
        <TodaySummaryModal
          emails={emails}
          onClose={() => setShowTodaySummary(false)}
        />
      )}
    </>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
};

export default App;
