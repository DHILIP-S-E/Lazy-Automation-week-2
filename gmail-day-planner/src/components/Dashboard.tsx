import React, { useState, useMemo, useEffect } from 'react';
import type { ProcessedEmail, EmailSummary } from '../types/email';
import { EmailCard } from './EmailCard';
import { Icons } from './Icons';
import { StressIndicator, DuplicateDetector } from '../modules/insights';
import { MeetingTimeline } from '../modules/timeline';
import { EmailDetailModal } from './EmailDetailModal';
import { RemindMeModal } from './RemindMeModal';
import { InsightsPanel } from './InsightsPanel';
import { ReminderPanel } from './ReminderPanel';
import { TimelineView } from './TimelineView';
import { localStorage_ } from '../modules/storage/LocalStorage';

interface DashboardProps {
  emails: ProcessedEmail[];
  summary: EmailSummary | null;
  isLoading: boolean;
  error: string | null;
  progress?: { fetched: number; total: number } | null;
  userEmail: string;
  onRefresh: () => void;
  onViewSummary: () => void;
  onEmailSummary: () => void;
  onSendToOther: () => void;
  onTodaySummary: () => void;
  onScheduleReminder: (email: ProcessedEmail, recipientEmail: string, scheduledTime: Date) => void;
  onAddToCalendar: (email: ProcessedEmail) => void;
  onLogout: () => void;
}

type ViewFilter = 'all' | 'Bills' | 'Student Meetings' | 'Job Meetings' | 'Internship Meetings' | 'Meetings' | 'Promotions' | 'OTP' | 'Jobs' | 'Attachments' | 'Other' | 'stress' | 'meetings-today' | 'duplicates' | 'saved';
type SortOption = 'importance' | 'date' | 'sender';

const IMPORTANT_KEYWORDS = ['urgent', 'important', 'action required', 'reminder', 'final notice', 'deadline'];

export const Dashboard: React.FC<DashboardProps> = ({
  emails,
  summary,
  isLoading,
  error,
  progress,
  userEmail,
  onRefresh,
  onViewSummary,
  onEmailSummary,
  onSendToOther,
  onTodaySummary,
  onScheduleReminder,
  onAddToCalendar,
  onLogout,
}) => {
  const [filter, setFilter] = useState<ViewFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('importance');
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<ProcessedEmail | null>(null);
  const [reminderEmail, setReminderEmail] = useState<ProcessedEmail | null>(null);
  const [savedEmails, setSavedEmails] = useState<ProcessedEmail[]>([]);
  const [activeTab, setActiveTab] = useState<'emails' | 'insights' | 'reminders' | 'timeline'>('emails');
  const [darkMode, setDarkMode] = useState(false);
  const [viewDensity, setViewDensity] = useState<'comfortable' | 'compact'>('comfortable');
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const emailListRef = React.useRef<HTMLDivElement>(null);

  const scrollToEmails = () => {
    setTimeout(() => {
      emailListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  useEffect(() => {
    setSavedEmails(localStorage_.getImportantEmails());
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    const savedDensity = localStorage.getItem('viewDensity') as 'comfortable' | 'compact' || 'comfortable';
    const savedSearches = JSON.parse(sessionStorage.getItem('recentSearches') || '[]');
    setDarkMode(savedDarkMode);
    setViewDensity(savedDensity);
    setRecentSearches(savedSearches);
    if (savedDarkMode) document.body.classList.add('dark-mode');
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
    document.body.classList.toggle('dark-mode');
  };

  const toggleViewDensity = () => {
    const newDensity = viewDensity === 'comfortable' ? 'compact' : 'comfortable';
    setViewDensity(newDensity);
    localStorage.setItem('viewDensity', newDensity);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query && !recentSearches.includes(query)) {
      const updated = [query, ...recentSearches].slice(0, 5);
      setRecentSearches(updated);
      sessionStorage.setItem('recentSearches', JSON.stringify(updated));
    }
  };

  useEffect(() => {
    if (!isLoading && emails.length > 0) {
      setLastSync(new Date());
    }
  }, [isLoading, emails.length]);

  const stressIndicator = useMemo(() => new StressIndicator(), []);
  const duplicateDetector = useMemo(() => new DuplicateDetector(), []);
  const meetingTimeline = useMemo(() => new MeetingTimeline(), []);

  const stressAnalysis = useMemo(() => stressIndicator.analyze(emails), [emails, stressIndicator]);
  const duplicates = useMemo(() => duplicateDetector.detectDuplicates(emails), [emails, duplicateDetector]);
  const meetingEvents = useMemo(() => meetingTimeline.extractMeetingEvents(emails), [emails, meetingTimeline]);
  const meetingConflicts = useMemo(() => meetingTimeline.detectConflicts(meetingEvents), [meetingEvents, meetingTimeline]);

  const getCategoryCount = (category: string) => emails.filter(e => e.category === category).length;

  const upcomingMeetings = useMemo(() => {
    const now = new Date();
    const seenUpcoming = new Map<string, boolean>();
    
    return meetingEvents
      .map(event => {
        const timeMatch = event.time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
        if (!timeMatch) return null;
        
        const [, hoursStr, minutesStr, period] = timeMatch;
        let hours = parseInt(hoursStr, 10);
        const minutes = parseInt(minutesStr, 10);
        const isPM = period.toUpperCase() === 'PM';
        
        if (isPM && hours !== 12) hours += 12;
        if (!isPM && hours === 12) hours = 0;
        
        const meetingTime = new Date(now);
        meetingTime.setHours(hours, minutes, 0, 0);
        
        if (meetingTime < now) {
          meetingTime.setDate(meetingTime.getDate() + 1);
        }
        
        const diff = meetingTime.getTime() - now.getTime();
        const minutesUntil = Math.floor(diff / 60000);
        const hoursUntil = Math.floor(minutesUntil / 60);
        
        return { ...event, minutesUntil, hoursUntil, meetingTime };
      })
      .filter((e): e is NonNullable<typeof e> => {
        if (!e || e.minutesUntil <= 0 || e.minutesUntil >= 1440) return false;
        
        const titleKey = e.title.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 15);
        
        for (const [key] of seenUpcoming) {
          if (key.includes(titleKey) || titleKey.includes(key)) {
            return false;
          }
        }
        
        seenUpcoming.set(titleKey, true);
        return true;
      })
      .sort((a, b) => {
        const aUrgent = a.minutesUntil <= 60;
        const bUrgent = b.minutesUntil <= 60;
        if (aUrgent && !bUrgent) return -1;
        if (!aUrgent && bUrgent) return 1;
        return a.minutesUntil - b.minutesUntil;
      });
  }, [meetingEvents]);

  const handleSaveEmail = (email: ProcessedEmail) => {
    localStorage_.saveImportantEmail(email);
    setSavedEmails(localStorage_.getImportantEmails());
  };

  const handleRemoveEmail = (emailId: string) => {
    localStorage_.removeImportantEmail(emailId);
    setSavedEmails(localStorage_.getImportantEmails());
  };

  const handleClearAllData = () => {
    if (confirm('Are you sure you want to delete all saved emails?')) {
      localStorage_.clearAllData();
      setSavedEmails([]);
    }
  };

  const priorityAnalysis = useMemo(() => {
    const today = new Date();
    const urgentTasks: string[] = [];
    const seenEmails = new Set<string>();
    
    let billsScore = 0;
    let jobsScore = 0;
    let meetingsScore = 0;
    let attachmentsScore = 0;
    let keywordsScore = 0;
    
    emails.forEach(email => {
      const titleKey = email.subject.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 25);
      if (seenEmails.has(titleKey)) return;
      seenEmails.add(titleKey);
      
      if (email.category === 'Bills') billsScore += email.importanceScore;
      else if (email.category === 'Jobs' || email.category === 'Job Meetings' || email.category === 'Internship Meetings') jobsScore += email.importanceScore;
      else if (email.category === 'Meetings' || email.category === 'Student Meetings') meetingsScore += email.importanceScore;
      else if (email.attachments.length > 0) attachmentsScore += email.importanceScore;
      else if (IMPORTANT_KEYWORDS.some(kw => `${email.subject} ${email.plainText}`.toLowerCase().includes(kw))) keywordsScore += email.importanceScore;
    });
    
    const seenMeetings = new Set<string>();
    emails.forEach(email => {
      if (urgentTasks.length >= 4) return;
      
      if (email.category === 'Bills' && email.extractedData.dueDates.length > 0) {
        const dueDate = new Date(email.extractedData.dueDates[0]);
        if (dueDate.toDateString() === today.toDateString()) {
          urgentTasks.push(`Pay ${email.extractedData.amounts[0] || 'bill'} - Due TODAY`);
        }
      }
      
      if ((email.category === 'Meetings' || email.category === 'Student Meetings' || email.category === 'Job Meetings' || email.category === 'Internship Meetings') && email.extractedData.times.length > 0) {
        const titleKey = email.subject.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 25);
        if (!seenMeetings.has(titleKey)) {
          seenMeetings.add(titleKey);
          urgentTasks.push(`Meeting: ${email.subject.substring(0, 30)} at ${email.extractedData.times[0]}`);
        }
      }
    });
    
    const totalScore = Math.min(Math.round((billsScore + jobsScore + meetingsScore + attachmentsScore + keywordsScore) * 10 / emails.length), 100);
    
    let level: 'high' | 'medium' | 'low';
    let status: string;
    
    if (totalScore >= 60) {
      level = 'high';
      status = 'High Priority Day';
    } else if (totalScore >= 30) {
      level = 'medium';
      status = 'Moderate Priority';
    } else {
      level = 'low';
      status = 'Low Priority Day';
    }
    
    return {
      totalScore,
      breakdown: { billsScore: Math.round(billsScore), jobsScore: Math.round(jobsScore), meetingsScore: Math.round(meetingsScore), attachmentsScore: Math.round(attachmentsScore), keywordsScore: Math.round(keywordsScore) },
      urgentTasks: urgentTasks.slice(0, 4),
      status,
      level
    };
  }, [emails]);

  const filteredEmails = useMemo(() => {
    let result: ProcessedEmail[];
    
    if (filter === 'stress') {
      result = emails.filter(e => e.importanceScore >= 8);
    } else if (filter === 'meetings-today') {
      result = emails.filter(e => 
        e.category === 'Meetings' || 
        e.category === 'Student Meetings' || 
        e.category === 'Job Meetings' || 
        e.category === 'Internship Meetings'
      );
    } else if (filter === 'duplicates') {
      result = duplicates.duplicates;
    } else if (filter === 'saved') {
      result = savedEmails;
    } else if (filter === 'all') {
      result = emails;
    } else {
      result = emails.filter(e => e.category === filter);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(e => 
        e.subject.toLowerCase().includes(query) || 
        e.from.toLowerCase().includes(query)
      );
    }
    
    result = [...result].sort((a, b) => {
      if (sortBy === 'importance') return b.importanceScore - a.importanceScore;
      if (sortBy === 'date') return b.date.getTime() - a.date.getTime();
      if (sortBy === 'sender') return a.from.localeCompare(b.from);
      return 0;
    });
    
    return result;
  }, [emails, filter, searchQuery, sortBy]);

  return (
    <div className="min-h-screen" style={{ background: darkMode ? '#0f172a' : '#fafafa' }}>
      <header className="sticky-header" style={{ background: 'white', borderBottom: '1px solid #e5e5e5' }}>
        <div className="container">
          <div className="row between" style={{ padding: '1rem 0' }}>
            <div className="row row-3">
              <img src="logo.jpeg" alt="AutoMail Logo" style={{ width: 100, height: 60, objectFit: 'cover', borderRadius: '10px' }} />
              <div>
                <h1 style={{ fontSize: '1.25rem', fontWeight: '600' }}>AutoMail</h1>
                <p className="stat-label">
                  {lastSync ? `Last sync: ${lastSync.toLocaleTimeString()}` : 'Day Planner'}
                </p>
              </div>
            </div>
            <div className="row row-2">
              <button 
                onClick={toggleViewDensity} 
                className="btn btn-ghost btn-sm tooltip" 
                data-tooltip={viewDensity === 'comfortable' ? 'Switch to Compact' : 'Switch to Comfortable'}
              >
                {viewDensity === 'comfortable' ? <Icons.List /> : <Icons.Menu />}
              </button>
              <button 
                onClick={toggleDarkMode} 
                className="theme-toggle tooltip" 
                data-tooltip={darkMode ? 'Light Mode' : 'Dark Mode'}
              >
                {darkMode ? <Icons.Sun /> : <Icons.Moon />}
              </button>
              <button 
                onClick={handleClearAllData} 
                className="btn btn-ghost btn-sm tooltip" 
                disabled={savedEmails.length === 0} 
                data-tooltip="Clear all saved data"
              >
                <Icons.Trash />
              </button>
              <button 
                onClick={onRefresh} 
                disabled={isLoading} 
                className="btn btn-ghost btn-sm tooltip" 
                data-tooltip="Press R to refresh"
              >
                <Icons.RefreshCw /> Refresh
              </button>
              <button onClick={onLogout} className="btn btn-primary btn-sm">Logout</button>
            </div>
          </div>
        </div>
      </header>

      <div className="container" style={{ paddingTop: '2rem' }}>
        {/* Loading State */}
        {isLoading && (
          <div className="card card-md mb-6 animate-fade-in">
            <div className="row row-4">
              <img src="logo.jpeg" alt="Logo" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: '12px' }} />
              <div className="flex-1">
                <p className="font-medium mb-4">Loading your emails...</p>
                {progress && (
                  <div>
                    <div className="row between mb-4">
                      <span className="stat-label">{progress.fetched} of {progress.total}</span>
                      <span className="font-medium">{Math.round((progress.fetched / progress.total) * 100)}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${(progress.fetched / progress.total) * 100}%` }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="stack stack-3 mt-4">
              <div className="skeleton skeleton-card"></div>
              <div className="skeleton skeleton-card"></div>
              <div className="skeleton skeleton-card"></div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="alert alert-error mb-6 animate-fade-in">
            <Icons.AlertTriangle />
            <div>
              <p className="font-medium">Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {!isLoading && emails.length > 0 && (
          <>
            <div 
              className={`card card-md priority-card priority-${priorityAnalysis.level} animate-fade-in hover-lift`} 
              style={{ marginBottom: '2rem', cursor: 'pointer' }}
              onClick={() => { setFilter('stress'); scrollToEmails(); }}
            >
              <div className="row between mb-4">
                <div>
                  <p className="stat-label mb-4">Today's Priority Score</p>
                  <div className="row row-2 items-end">
                    <span className={`priority-score priority-score-${priorityAnalysis.level}`}>
                      {priorityAnalysis.totalScore}
                    </span>
                    <span className="stat-label" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>/100</span>
                  </div>
                  <div className={`priority-status priority-status-${priorityAnalysis.level} mt-4`}>
                    {priorityAnalysis.level === 'high' ? <Icons.TrendingUp /> : priorityAnalysis.level === 'medium' ? <Icons.AlertCircle /> : <Icons.CheckCircle />} {priorityAnalysis.status}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p className="font-medium text-sm mb-4">Score Breakdown</p>
                  <div className="stack stack-2">
                    <div className="breakdown-item" title="Bills with due dates">
                      <Icons.DollarSign /> Bills: <span className="breakdown-value">+{priorityAnalysis.breakdown.billsScore}</span>
                    </div>
                    <div className="breakdown-item" title="Job alerts, interviews, and internships with deadlines">
                      <Icons.Briefcase /> Jobs/Career: <span className="breakdown-value">+{priorityAnalysis.breakdown.jobsScore}</span>
                    </div>
                    <div className="breakdown-item" title="All meetings with times (classes, interviews, general)">
                      <Icons.Calendar /> Meetings: <span className="breakdown-value">+{priorityAnalysis.breakdown.meetingsScore}</span>
                    </div>
                    <div className="breakdown-item" title="Emails with attachments">
                      <Icons.Paperclip /> Attachments: <span className="breakdown-value">+{priorityAnalysis.breakdown.attachmentsScore}</span>
                    </div>
                    <div className="breakdown-item" title="Urgent keywords found">
                      <Icons.Bell /> Urgency: <span className="breakdown-value">+{priorityAnalysis.breakdown.keywordsScore}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {priorityAnalysis.urgentTasks.length > 0 && (
                <div style={{ borderTop: '1px solid var(--neutral-200)', paddingTop: '1rem' }}>
                  <p className="font-medium text-sm mb-4 row row-2"><Icons.TrendingUp /> Urgent Tasks Today</p>
                  <div className="stack stack-2">
                    {priorityAnalysis.urgentTasks.map((task, i) => (
                      <div key={i} className={`urgent-task urgent-task-${priorityAnalysis.level}`}>
                        • {task}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {upcomingMeetings.length > 0 && (
              <div className="animate-fade-in" style={{ marginBottom: '2rem', padding: '1.5rem', background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)', borderRadius: '0.75rem', boxShadow: '0 8px 20px rgba(220, 38, 38, 0.25)' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'white', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Icons.Clock /> Urgent: Upcoming Meetings
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.9)' }}>{upcomingMeetings.length} meeting{upcomingMeetings.length > 1 ? 's' : ''} starting soon</p>
                </div>
                <div className="stack stack-2" style={{ marginTop: '1rem' }}>
                  {upcomingMeetings.map((meeting, i) => {
                    const isVeryUrgent = meeting.minutesUntil <= 60;
                    const timeDisplay = meeting.minutesUntil < 60 
                      ? `${meeting.minutesUntil}m` 
                      : `${meeting.hoursUntil}h ${meeting.minutesUntil % 60}m`;
                    
                    return (
                      <div key={`${meeting.emailId}-${i}`} className="row between" style={{ 
                        padding: '1rem', 
                        background: isVeryUrgent ? 'rgba(254, 226, 226, 0.95)' : 'rgba(255,255,255,0.95)', 
                        borderRadius: '0.75rem',
                        borderLeft: isVeryUrgent ? '4px solid #dc2626' : 'none'
                      }}>
                        <div>
                          <span style={{ fontWeight: '700', color: '#dc2626', fontSize: '1rem' }}>{meeting.time}</span>
                          <span style={{ marginLeft: '0.75rem', fontSize: '0.875rem', color: '#1f2937' }}>{meeting.title.substring(0, 50)}</span>
                        </div>
                        <span style={{ 
                          padding: '0.5rem 1rem', 
                          background: isVeryUrgent ? '#dc2626' : '#f59e0b', 
                          color: 'white', 
                          borderRadius: '0.5rem', 
                          fontSize: '0.875rem', 
                          fontWeight: '600' 
                        }}>
                          {isVeryUrgent && <Icons.Flame style={{ width: '1rem', height: '1rem' }} />}in {timeDisplay}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Icons.BarChart /> Smart Insights</h2>
            <div className="grid grid-cols-4 gap-4" style={{ marginBottom: '2rem' }}>
              <div 
                className="card hover-lift hover-actions animate-fade-in" 
                style={{ 
                  padding: '1.5rem',
                  background: stressAnalysis.level === 'CRITICAL' ? 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)' : 
                              stressAnalysis.level === 'HIGH' ? 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)' : 
                              'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                  border: `2px solid ${stressAnalysis.level === 'CRITICAL' ? '#dc2626' : stressAnalysis.level === 'HIGH' ? '#ea580c' : '#f59e0b'}`,
                  cursor: 'pointer'
                }}
                onClick={() => { setFilter('stress'); scrollToEmails(); }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}><Icons.Brain /></div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: stressAnalysis.level === 'CRITICAL' ? '#dc2626' : '#ea580c', marginBottom: '0.25rem' }}>
                  {stressAnalysis.score}
                </div>
                <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937' }}>Stress Level</p>
                <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>{stressAnalysis.level}</p>
              </div>

              <div 
                className="card hover-lift hover-actions animate-fade-in" 
                style={{ 
                  padding: '1.5rem',
                  background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                  border: '2px solid #3b82f6',
                  cursor: 'pointer'
                }}
                onClick={() => { setFilter('meetings-today'); scrollToEmails(); }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}><Icons.Calendar /></div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#3b82f6', marginBottom: '0.25rem' }}>
                  {meetingEvents.length}
                </div>
                <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937' }}>Today's Meetings</p>
                {meetingConflicts.length > 0 && (
                  <p style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Icons.AlertTriangle style={{ width: '0.875rem', height: '0.875rem' }} /> {meetingConflicts.length} Conflict{meetingConflicts.length > 1 ? 's' : ''}</p>
                )}
              </div>

              <div 
                className="card hover-lift hover-actions animate-fade-in" 
                style={{ 
                  padding: '1.5rem',
                  background: duplicates.duplicates.length > 0 ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' : 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                  border: `2px solid ${duplicates.duplicates.length > 0 ? '#f59e0b' : '#10b981'}`,
                  cursor: 'pointer'
                }}
                onClick={() => { setFilter('duplicates'); scrollToEmails(); }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}><Icons.Copy /></div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: duplicates.duplicates.length > 0 ? '#f59e0b' : '#10b981', marginBottom: '0.25rem' }}>
                  {duplicates.duplicates.length}
                </div>
                <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937' }}>Duplicates</p>
                <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>{duplicates.duplicates.length > 0 ? 'Click to view' : 'All clean'}</p>
              </div>

              <div 
                className="card hover-lift hover-actions animate-fade-in" 
                style={{ 
                  padding: '1.5rem',
                  background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
                  border: '2px solid #a855f7',
                  cursor: 'pointer'
                }}
                onClick={() => { setFilter('saved'); scrollToEmails(); }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}><Icons.Star /></div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#a855f7', marginBottom: '0.25rem' }}>
                  {savedEmails.length}
                </div>
                <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937' }}>Saved Emails</p>
                <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Important items</p>
              </div>
            </div>

            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Icons.Mail /> Email Categories</h2>
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="card stat-card hover-lift animate-fade-in" onClick={() => { setFilter('all'); scrollToEmails(); }} style={{ cursor: 'pointer' }}>
                <div className="stat-icon stat-icon-primary"><Icons.BarChart /></div>
                <div className="stat-value stat-value-neutral">{emails.length}</div>
                <div className="stat-label">Total Emails</div>
              </div>
              <div className="card stat-card hover-lift animate-fade-in" onClick={() => { setFilter('Bills'); scrollToEmails(); }} style={{ cursor: 'pointer' }}>
                <div className="stat-icon stat-icon-success"><Icons.DollarSign /></div>
                <div className="stat-value stat-value-success">{getCategoryCount('Bills')}</div>
                <div className="stat-label">Bills</div>
              </div>
              <div className="card stat-card hover-lift animate-fade-in" onClick={() => { setFilter('Meetings'); scrollToEmails(); }} style={{ cursor: 'pointer' }}>
                <div className="stat-icon stat-icon-warning"><Icons.Calendar /></div>
                <div className="stat-value stat-value-warning">{getCategoryCount('Meetings')}</div>
                <div className="stat-label">General Meetings</div>
              </div>
              <div className="card stat-card hover-lift animate-fade-in" onClick={() => { setFilter('Jobs'); scrollToEmails(); }} style={{ cursor: 'pointer' }}>
                <div className="stat-icon stat-icon-info"><Icons.Briefcase /></div>
                <div className="stat-value stat-value-info">{getCategoryCount('Jobs')}</div>
                <div className="stat-label">Job Alerts</div>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="card stat-card hover-lift animate-fade-in" onClick={() => { setFilter('Student Meetings'); scrollToEmails(); }} style={{ cursor: 'pointer' }}>
                <div className="stat-icon stat-icon-warning"><Icons.Calendar /></div>
                <div className="stat-value stat-value-warning">{getCategoryCount('Student Meetings')}</div>
                <div className="stat-label">Classes</div>
              </div>
              <div className="card stat-card hover-lift animate-fade-in" onClick={() => { setFilter('Job Meetings'); scrollToEmails(); }} style={{ cursor: 'pointer' }}>
                <div className="stat-icon stat-icon-info"><Icons.Briefcase /></div>
                <div className="stat-value stat-value-info">{getCategoryCount('Job Meetings')}</div>
                <div className="stat-label">Job Interviews</div>
              </div>
              <div className="card stat-card hover-lift animate-fade-in" onClick={() => { setFilter('Internship Meetings'); scrollToEmails(); }} style={{ cursor: 'pointer' }}>
                <div className="stat-icon stat-icon-info"><Icons.Briefcase /></div>
                <div className="stat-value stat-value-info">{getCategoryCount('Internship Meetings')}</div>
                <div className="stat-label">Internships</div>
              </div>
              <div className="card stat-card hover-lift animate-fade-in" onClick={() => { setFilter('Promotions'); scrollToEmails(); }} style={{ cursor: 'pointer' }}>
                <div className="stat-icon stat-icon-primary"><Icons.Star /></div>
                <div className="stat-value stat-value-primary">{getCategoryCount('Promotions')}</div>
                <div className="stat-label">Promotions</div>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="card stat-card hover-lift animate-fade-in" onClick={() => { setFilter('OTP'); scrollToEmails(); }} style={{ cursor: 'pointer' }}>
                <div className="stat-icon stat-icon-info"><Icons.Lock /></div>
                <div className="stat-value stat-value-info">{getCategoryCount('OTP')}</div>
                <div className="stat-label">OTP Codes</div>
              </div>
              <div className="card stat-card hover-lift animate-fade-in" onClick={() => { setFilter('Attachments'); scrollToEmails(); }} style={{ cursor: 'pointer' }}>
                <div className="stat-icon stat-icon-warning"><Icons.Paperclip /></div>
                <div className="stat-value stat-value-warning">{getCategoryCount('Attachments')}</div>
                <div className="stat-label">Attachments</div>
              </div>
              <div className="card stat-card hover-lift animate-fade-in" onClick={() => { setFilter('Other'); scrollToEmails(); }} style={{ cursor: 'pointer' }}>
                <div className="stat-icon stat-icon-neutral"><Icons.Mail /></div>
                <div className="stat-value stat-value-neutral">{getCategoryCount('Other')}</div>
                <div className="stat-label">Other</div>
              </div>
              <div className="card stat-card hover-lift animate-fade-in" style={{ cursor: 'pointer' }}>
                <div className="stat-icon stat-icon-primary"><Icons.Star /></div>
                <div className="stat-value stat-value-primary">{emails.filter(e => e.importanceScore >= 8).length}</div>
                <div className="stat-label">High Priority</div>
              </div>
            </div>

            {filter !== 'all' && (
              <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: '#f0f9ff', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #bfdbfe' }}>
                <span style={{ fontWeight: '600', color: '#1e40af' }}>
                  Viewing: {filter === 'stress' ? <><Icons.AlertCircle style={{ width: '1rem', height: '1rem' }} /> High Priority</> : 
                           filter === 'meetings-today' ? <><Icons.Calendar style={{ width: '1rem', height: '1rem' }} /> Meetings</> : 
                           filter === 'duplicates' ? <><Icons.Copy style={{ width: '1rem', height: '1rem' }} /> Duplicates</> : 
                           filter === 'saved' ? <><Icons.Star style={{ width: '1rem', height: '1rem' }} /> Saved</> : 
                           filter === 'Bills' ? <><Icons.DollarSign style={{ width: '1rem', height: '1rem' }} /> Bills</> : 
                           filter === 'Jobs' ? <><Icons.Briefcase style={{ width: '1rem', height: '1rem' }} /> Jobs</> : 
                           filter === 'Student Meetings' ? <><Icons.Calendar style={{ width: '1rem', height: '1rem' }} /> Classes</> : 
                           filter === 'Job Meetings' ? <><Icons.Briefcase style={{ width: '1rem', height: '1rem' }} /> Interviews</> : 
                           filter === 'Internship Meetings' ? <><Icons.Briefcase style={{ width: '1rem', height: '1rem' }} /> Internships</> : 
                           filter === 'Promotions' ? <><Icons.Star style={{ width: '1rem', height: '1rem' }} /> Promotions</> : 
                           filter === 'OTP' ? <><Icons.Lock style={{ width: '1rem', height: '1rem' }} /> OTP</> : 
                           filter === 'Attachments' ? <><Icons.Paperclip style={{ width: '1rem', height: '1rem' }} /> Attachments</> : 
                           filter === 'Meetings' ? <><Icons.Calendar style={{ width: '1rem', height: '1rem' }} /> Meetings</> : 'Other'}
                </span>
                <button onClick={() => setFilter('all')} className="btn btn-sm btn-ghost" style={{ color: '#1e40af' }}>
                  <Icons.X /> Clear
                </button>
              </div>
            )}

            {/* Tab Navigation */}
            <div className="card mb-6 animate-fade-in">
              <div className="row row-2" style={{ padding: '1rem', borderBottom: '1px solid var(--neutral-200)' }}>
                <button 
                  onClick={() => setActiveTab('emails')} 
                  className={`btn btn-sm ${activeTab === 'emails' ? 'btn-primary' : 'btn-ghost'}`}
                >
                  <Icons.Mail /> Emails
                </button>
                <button 
                  onClick={() => setActiveTab('insights')} 
                  className={`btn btn-sm ${activeTab === 'insights' ? 'btn-primary' : 'btn-ghost'}`}
                >
                  <Icons.TrendingUp /> Insights
                </button>
                <button 
                  onClick={() => setActiveTab('reminders')} 
                  className={`btn btn-sm ${activeTab === 'reminders' ? 'btn-primary' : 'btn-ghost'}`}
                >
                  <Icons.Bell /> Reminders
                </button>
                <button 
                  onClick={() => setActiveTab('timeline')} 
                  className={`btn btn-sm ${activeTab === 'timeline' ? 'btn-primary' : 'btn-ghost'}`}
                >
                  <Icons.Clock /> Timeline
                </button>
              </div>
            </div>

            {/* Email List Card */}
            {activeTab === 'emails' && (
            <div ref={emailListRef} className="card mb-6 animate-fade-in">
              <div className="p-4" style={{ borderBottom: '1px solid var(--neutral-200)' }}>
                <div className="row between mb-4">
                  <div style={{ position: 'relative', maxWidth: '300px', flex: 1 }}>
                    <input
                      type="text"
                      placeholder="Search emails..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      onFocus={() => setShowSearchSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 200)}
                      className="card-sm"
                      style={{ width: '100%', border: '1px solid var(--neutral-200)', borderRadius: '0.5rem' }}
                    />
                    {showSearchSuggestions && recentSearches.length > 0 && (
                      <div className="search-suggestions">
                        <div style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', fontWeight: '600', color: 'var(--neutral-500)' }}>Recent Searches</div>
                        {recentSearches.map((search, i) => (
                          <div 
                            key={i} 
                            className="search-suggestion-item"
                            onClick={() => { setSearchQuery(search); setShowSearchSuggestions(false); }}
                          >
                            <Icons.Search style={{ width: '1rem', height: '1rem' }} />
                            {search}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="row row-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.5rem' }}
                    >
                      <option value="importance">Sort: Importance</option>
                      <option value="date">Sort: Date</option>
                      <option value="sender">Sort: Sender</option>
                    </select>
                    <button onClick={onTodaySummary} className="btn btn-secondary btn-sm">
                      <Icons.Calendar /> Today's Summary
                    </button>
                    <button onClick={onEmailSummary} disabled={!summary} className="btn btn-secondary btn-sm">
                      <Icons.Mail /> Email Me
                    </button>
                    <button onClick={onSendToOther} disabled={!summary} className="btn btn-secondary btn-sm">
                      <Icons.Send /> Send to Other
                    </button>
                    <button onClick={onViewSummary} className="btn btn-primary btn-sm">
                      View All
                    </button>
                  </div>
                </div>
                <div className="row row-2" style={{ overflowX: 'auto' }}>
                  {(['all', 'Bills', 'Student Meetings', 'Job Meetings', 'Internship Meetings', 'Meetings', 'Promotions', 'Jobs', 'OTP', 'Attachments', 'Other'] as const).map(cat => (
                    <button 
                      key={cat}
                      onClick={() => setFilter(cat)} 
                      className={`btn btn-sm ${filter === cat ? 'btn-primary' : 'btn-ghost'}`}
                    >
                      {cat === 'all' ? 'All' : 
                       cat === 'Bills' ? <><Icons.DollarSign /> Bills</> : 
                       cat === 'Student Meetings' ? <><Icons.Calendar /> Classes</> :
                       cat === 'Job Meetings' ? <><Icons.Briefcase /> Job Interviews</> :
                       cat === 'Internship Meetings' ? <><Icons.Briefcase /> Internships</> :
                       cat === 'Meetings' ? <><Icons.Calendar /> Meetings</> : 
                       cat === 'Promotions' ? <><Icons.Star /> Promotions</> :
                       cat === 'Jobs' ? <><Icons.Briefcase /> Jobs</> : 
                       cat === 'OTP' ? <><Icons.Lock /> OTP</> : 
                       cat === 'Attachments' ? <><Icons.Paperclip /> Files</> :
                       'Other'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6">
                {filteredEmails.length > 0 ? (
                  <>
                    <p className="stat-label mb-4">Showing {filteredEmails.length} email{filteredEmails.length !== 1 ? 's' : ''}</p>
                    <div className="stack stack-3">
                      {filteredEmails.map((email, index) => (
                        <div 
                          key={email.id} 
                          className={`hover-actions animate-slide-in ${viewDensity === 'compact' ? 'email-card-compact' : ''}`}
                          onClick={() => setSelectedEmail(email)} 
                          style={{ cursor: 'pointer', animationDelay: `${index * 0.05}s` }}
                        >
                          <div className="quick-actions">
                            <button 
                              className="quick-action-btn tooltip" 
                              data-tooltip="Save for later"
                              onClick={(e) => { e.stopPropagation(); handleSaveEmail(email); }}
                            >
                              <Icons.Star style={{ width: '1rem', height: '1rem' }} />
                            </button>
                            <button 
                              className="quick-action-btn tooltip" 
                              data-tooltip="Remind me"
                              onClick={(e) => { e.stopPropagation(); setReminderEmail(email); }}
                            >
                              <Icons.Clock style={{ width: '1rem', height: '1rem' }} />
                            </button>
                          </div>
                          <EmailCard email={email} onAddToCalendar={onAddToCalendar} />
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      {filter === 'all' ? <Icons.Inbox style={{ width: '4rem', height: '4rem' }} /> : filter === 'saved' ? <Icons.Star style={{ width: '4rem', height: '4rem' }} /> : <Icons.Search style={{ width: '4rem', height: '4rem' }} />}
                    </div>
                    <h3 className="empty-state-title">
                      {filter === 'all' ? 'No emails yet' : filter === 'saved' ? 'No saved emails' : 'No emails found'}
                    </h3>
                    <p className="empty-state-description">
                      {filter === 'all' 
                        ? 'Click refresh to fetch your latest emails' 
                        : filter === 'saved' 
                        ? 'Star emails to save them for quick access later'
                        : 'Try adjusting your search or filter criteria'}
                    </p>
                  </div>
                )}
              </div>
            </div>
            )}

            {/* Insights Panel */}
            {activeTab === 'insights' && (
              <div className="animate-fade-in">
                <InsightsPanel emails={emails} />
              </div>
            )}

            {/* Reminders Panel */}
            {activeTab === 'reminders' && (
              <div className="animate-fade-in">
                <ReminderPanel emails={emails} />
              </div>
            )}

            {/* Timeline View */}
            {activeTab === 'timeline' && (
              <div className="animate-fade-in">
                <TimelineView emails={emails} />
              </div>
            )}

            {/* Privacy Notice */}
            <div className="alert alert-success animate-fade-in">
              <Icons.Lock />
              <div>
                <p className="font-medium text-sm">100% Private</p>
                <p className="text-sm mt-1 opacity-80">All data stays in your browser. Press R to refresh.</p>
              </div>
            </div>
          </>
        )}

        {/* Empty State */}
        {!isLoading && emails.length === 0 && !error && lastSync && (
          <div className="card card-lg text-center animate-fade-in" style={{ padding: '4rem' }}>
            <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}><Icons.Mail /></div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>No emails found</h2>
            <p className="stat-label">Try refreshing to fetch your latest emails</p>
          </div>
        )}
        
        {/* Initial Loading State (before first fetch) */}
        {!isLoading && emails.length === 0 && !error && !lastSync && (
          <div className="card card-lg text-center animate-fade-in" style={{ padding: '4rem' }}>
            <img src="logo.jpeg" alt="Logo" style={{ width: 200, height: 200, objectFit: 'cover', margin: '0 auto 1.5rem', borderRadius: '20px' }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>Getting ready...</h2>
            <p className="stat-label">Preparing to fetch your emails</p>
          </div>
        )}
      </div>

      {selectedEmail && (
        <EmailDetailModal
          email={selectedEmail}
          onClose={() => setSelectedEmail(null)}
          onSave={() => {
            handleSaveEmail(selectedEmail);
            setSelectedEmail(null);
          }}
          onRemove={() => {
            handleRemoveEmail(selectedEmail.id);
            setSelectedEmail(null);
          }}
          isSaved={localStorage_.isEmailSaved(selectedEmail.id)}
        />
      )}

      {reminderEmail && (
        <RemindMeModal
          email={reminderEmail}
          userEmail={userEmail}
          onClose={() => setReminderEmail(null)}
          onSchedule={(recipientEmail, scheduledTime) => {
            onScheduleReminder(reminderEmail, recipientEmail, scheduledTime);
            setReminderEmail(null);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
