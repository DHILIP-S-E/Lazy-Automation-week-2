import React, { useState, useMemo, useEffect } from 'react';
import type { ProcessedEmail, EmailSummary } from '../types/email';
import { EmailCard } from './EmailCard';
import { Icons } from './Icons';

interface DashboardProps {
  emails: ProcessedEmail[];
  summary: EmailSummary | null;
  isLoading: boolean;
  error: string | null;
  progress?: { fetched: number; total: number } | null;
  onRefresh: () => void;
  onViewSummary: () => void;
  onEmailSummary: () => void;
  onTodaySummary: () => void;
  onAddToCalendar: (email: ProcessedEmail) => void;
  onLogout: () => void;
}

type CategoryFilter = 'all' | 'Bills' | 'Student Meetings' | 'Job Meetings' | 'Internship Meetings' | 'Meetings' | 'Promotions' | 'OTP' | 'Jobs' | 'Attachments' | 'Other';
type SortOption = 'importance' | 'date' | 'sender';

const IMPORTANT_KEYWORDS = ['urgent', 'important', 'action required', 'reminder', 'final notice', 'deadline'];

export const Dashboard: React.FC<DashboardProps> = ({
  emails,
  summary,
  isLoading,
  error,
  progress,
  onRefresh,
  onViewSummary,
  onEmailSummary,
  onTodaySummary,
  onAddToCalendar,
  onLogout,
}) => {
  const [filter, setFilter] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('importance');
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    if (!isLoading && emails.length > 0) {
      setLastSync(new Date());
    }
  }, [isLoading, emails.length]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'r' && !e.ctrlKey && !e.metaKey) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT') {
          e.preventDefault();
          onRefresh();
        }
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onRefresh]);

  const priorityAnalysis = useMemo(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    let billsScore = 0, jobsScore = 0, meetingsScore = 0, attachmentsScore = 0, keywordsScore = 0;
    const urgentTasks: string[] = [];
    
    emails.forEach(email => {
      const text = `${email.subject} ${email.plainText}`.toLowerCase();
      
      if (email.category === 'Bills' && email.extractedData.dueDates.length > 0) {
        const dueDate = new Date(email.extractedData.dueDates[0]);
        if (dueDate.toDateString() === today.toDateString()) {
          billsScore += 15;
          urgentTasks.push(`Pay ${email.extractedData.amounts[0] || 'bill'} - Due TODAY`);
        } else if (dueDate.toDateString() === tomorrow.toDateString()) {
          billsScore += 10;
          urgentTasks.push(`Pay ${email.extractedData.amounts[0] || 'bill'} - Due tomorrow`);
        } else {
          const in3Days = new Date(today);
          in3Days.setDate(in3Days.getDate() + 3);
          if (dueDate <= in3Days) {
            billsScore += 5;
          }
        }
      }
      
      if (email.category === 'Jobs' || email.category === 'Job Meetings' || email.category === 'Internship Meetings') {
        if (email.extractedData.dueDates.length > 0) {
          const deadline = new Date(email.extractedData.dueDates[0]);
          const in3Days = new Date(today);
          in3Days.setDate(in3Days.getDate() + 3);
          if (deadline.toDateString() === today.toDateString()) {
            jobsScore += 12;
            urgentTasks.push(`${email.subject.substring(0, 40)} - Deadline TODAY`);
          } else if (deadline <= in3Days) {
            jobsScore += 8;
          } else {
            jobsScore += 2;
          }
        } else {
          jobsScore += 2;
        }
      }
      
      if (email.category === 'Meetings' || email.category === 'Student Meetings' || email.category === 'Job Meetings' || email.category === 'Internship Meetings') {
        if (email.extractedData.times.length > 0) {
          meetingsScore += 10;
          urgentTasks.push(`Meeting: ${email.subject.substring(0, 30)} at ${email.extractedData.times[0]}`);
        } else if (email.date.toDateString() === today.toDateString()) {
          meetingsScore += 6;
        } else {
          meetingsScore += 2;
        }
      }
      
      if (email.attachments.length > 0) {
        attachmentsScore += 3;
        if (IMPORTANT_KEYWORDS.some(kw => text.includes(kw))) attachmentsScore += 3;
        if (email.attachments.length > 1) attachmentsScore += 2;
      }
      
      const keywordCount = IMPORTANT_KEYWORDS.filter(kw => text.includes(kw)).length;
      keywordsScore += Math.min(keywordCount * 3, 15);
    });
    
    const totalScore = Math.min(billsScore + jobsScore + meetingsScore + attachmentsScore + keywordsScore, 100);
    
    let level: 'high' | 'medium' | 'low';
    let status: string;
    let statusIcon: string;
    
    if (totalScore >= 70) {
      level = 'high';
      status = 'High Priority Day';
      statusIcon = 'high';
    } else if (totalScore >= 40) {
      level = 'medium';
      status = 'Moderate Priority';
      statusIcon = 'medium';
    } else {
      level = 'low';
      status = 'Low Priority Day';
      statusIcon = 'low';
    }
    
    return {
      totalScore,
      breakdown: { billsScore, jobsScore, meetingsScore, attachmentsScore, keywordsScore },
      urgentTasks: urgentTasks.slice(0, 4),
      status,
      statusIcon,
      level
    };
  }, [emails]);

  const getCategoryCount = (category: string) => emails.filter(e => e.category === category).length;

  const filteredEmails = useMemo(() => {
    let result = filter === 'all' ? emails : emails.filter(e => e.category === filter);
    
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
    <div className="min-h-screen" style={{ background: '#fafafa' }}>
      <header style={{ background: 'white', borderBottom: '1px solid #e5e5e5' }}>
        <div className="container">
          <div className="row between" style={{ padding: '1rem 0' }}>
            <div className="row row-3">
              <img src="/logo.jpeg" alt="AutoMail Logo" style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: '6px' }} />
              <div>
                <h1 style={{ fontSize: '1.25rem', fontWeight: '600' }}>AutoMail</h1>
                <p className="stat-label">
                  {lastSync ? `Last sync: ${lastSync.toLocaleTimeString()}` : 'Day Planner'}
                </p>
              </div>
            </div>
            <div className="row row-2">
              <button onClick={onRefresh} disabled={isLoading} className="btn btn-ghost btn-sm" title="Press R to refresh">
                <Icons.RefreshCw /> Refresh
              </button>
              <button onClick={onLogout} className="btn btn-ghost btn-sm">Logout</button>
            </div>
          </div>
        </div>
      </header>

      <div className="container" style={{ paddingTop: '2rem' }}>
        {/* Loading State */}
        {isLoading && (
          <div className="card card-md mb-6 animate-fade-in">
            <div className="row row-4">
              <img src="/logo.jpeg" alt="Logo" style={{ width: 48, height: 48, objectFit: 'contain', borderRadius: '8px' }} />
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
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="alert alert-error mb-6 animate-fade-in">
            <span>⚠️</span>
            <div>
              <p className="font-medium">Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Main Content */}
        {!isLoading && emails.length > 0 && (
          <>
            {/* Priority Score Card */}
            <div className={`card card-md mb-6 priority-card priority-${priorityAnalysis.level} animate-fade-in`}>
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
                    <div className="breakdown-item"><Icons.DollarSign /> Bills: <span className="breakdown-value">+{priorityAnalysis.breakdown.billsScore}</span></div>
                    <div className="breakdown-item"><Icons.Briefcase /> Jobs: <span className="breakdown-value">+{priorityAnalysis.breakdown.jobsScore}</span></div>
                    <div className="breakdown-item"><Icons.Calendar /> Meetings: <span className="breakdown-value">+{priorityAnalysis.breakdown.meetingsScore}</span></div>
                    <div className="breakdown-item"><Icons.Paperclip /> Attachments: <span className="breakdown-value">+{priorityAnalysis.breakdown.attachmentsScore}</span></div>
                    <div className="breakdown-item"><Icons.Bell /> Keywords: <span className="breakdown-value">+{priorityAnalysis.breakdown.keywordsScore}</span></div>
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

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="card stat-card hover-lift animate-fade-in">
                <div className="stat-icon stat-icon-primary"><Icons.BarChart /></div>
                <div className="stat-value stat-value-neutral">{emails.length}</div>
                <div className="stat-label">Total Emails</div>
              </div>
              <div className="card stat-card hover-lift animate-fade-in">
                <div className="stat-icon stat-icon-success"><Icons.DollarSign /></div>
                <div className="stat-value stat-value-success">{getCategoryCount('Bills')}</div>
                <div className="stat-label">Bills</div>
              </div>
              <div className="card stat-card hover-lift animate-fade-in">
                <div className="stat-icon stat-icon-warning"><Icons.Calendar /></div>
                <div className="stat-value stat-value-warning">{getCategoryCount('Meetings')}</div>
                <div className="stat-label">General Meetings</div>
              </div>
              <div className="card stat-card hover-lift animate-fade-in">
                <div className="stat-icon stat-icon-info"><Icons.Briefcase /></div>
                <div className="stat-value stat-value-info">{getCategoryCount('Jobs')}</div>
                <div className="stat-label">Job Alerts</div>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="card stat-card hover-lift animate-fade-in">
                <div className="stat-icon stat-icon-warning"><Icons.Calendar /></div>
                <div className="stat-value stat-value-warning">{getCategoryCount('Student Meetings')}</div>
                <div className="stat-label">Classes</div>
              </div>
              <div className="card stat-card hover-lift animate-fade-in">
                <div className="stat-icon stat-icon-info"><Icons.Briefcase /></div>
                <div className="stat-value stat-value-info">{getCategoryCount('Job Meetings')}</div>
                <div className="stat-label">Job Interviews</div>
              </div>
              <div className="card stat-card hover-lift animate-fade-in">
                <div className="stat-icon stat-icon-info"><Icons.Briefcase /></div>
                <div className="stat-value stat-value-info">{getCategoryCount('Internship Meetings')}</div>
                <div className="stat-label">Internships</div>
              </div>
              <div className="card stat-card hover-lift animate-fade-in">
                <div className="stat-icon stat-icon-primary"><Icons.Star /></div>
                <div className="stat-value stat-value-primary">{getCategoryCount('Promotions')}</div>
                <div className="stat-label">Promotions</div>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="card stat-card hover-lift animate-fade-in">
                <div className="stat-icon stat-icon-info"><Icons.Lock /></div>
                <div className="stat-value stat-value-info">{getCategoryCount('OTP')}</div>
                <div className="stat-label">OTP Codes</div>
              </div>
              <div className="card stat-card hover-lift animate-fade-in">
                <div className="stat-icon stat-icon-warning"><Icons.Paperclip /></div>
                <div className="stat-value stat-value-warning">{getCategoryCount('Attachments')}</div>
                <div className="stat-label">Attachments</div>
              </div>
              <div className="card stat-card hover-lift animate-fade-in">
                <div className="stat-icon stat-icon-neutral"><Icons.Mail /></div>
                <div className="stat-value stat-value-neutral">{getCategoryCount('Other')}</div>
                <div className="stat-label">Other</div>
              </div>
              <div className="card stat-card hover-lift animate-fade-in">
                <div className="stat-icon stat-icon-primary"><Icons.Star /></div>
                <div className="stat-value stat-value-primary">{emails.filter(e => e.importanceScore >= 8).length}</div>
                <div className="stat-label">High Priority</div>
              </div>
            </div>

            {/* Email List Card */}
            <div className="card mb-6 animate-fade-in">
              <div className="p-4" style={{ borderBottom: '1px solid var(--neutral-200)' }}>
                <div className="row between mb-4">
                  <input
                    type="text"
                    placeholder="Search emails..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="card-sm"
                    style={{ maxWidth: '300px', border: '1px solid var(--neutral-200)', borderRadius: '0.5rem' }}
                  />
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
                      {filteredEmails.map(email => <EmailCard key={email.id} email={email} onAddToCalendar={onAddToCalendar} />)}
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6">
                    <div style={{ marginBottom: '1rem' }}><Icons.Search /></div>
                    <p className="stat-label">No emails found</p>
                  </div>
                )}
              </div>
            </div>

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
            <img src="/logo.jpeg" alt="Logo" style={{ width: 80, height: 80, objectFit: 'contain', margin: '0 auto 1.5rem', borderRadius: '12px' }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>Getting ready...</h2>
            <p className="stat-label">Preparing to fetch your emails</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
