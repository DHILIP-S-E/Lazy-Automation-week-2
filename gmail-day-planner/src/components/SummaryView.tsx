import React, { useState, useMemo } from 'react';
import type { EmailSummary, ProcessedEmail } from '../types/email';
import { EmailCard } from './EmailCard';
import { TimelineView } from './TimelineView';
import { InsightsPanel } from './InsightsPanel';
import { ReminderPanel } from './ReminderPanel';
import { Icons } from './Icons';

interface SummaryViewProps {
  summary: EmailSummary;
  onBack: () => void;
}

type TabKey = 'important' | 'bills' | 'studentMeetings' | 'jobMeetings' | 'internshipMeetings' | 'meetings' | 'promotions' | 'jobs' | 'attachments' | 'insights' | 'timeline' | 'smart' | 'reminders';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'important', label: 'Important' },
  { key: 'bills', label: 'Bills' },
  { key: 'studentMeetings', label: 'Classes' },
  { key: 'jobMeetings', label: 'Job Interviews' },
  { key: 'internshipMeetings', label: 'Internships' },
  { key: 'meetings', label: 'Meetings' },
  { key: 'promotions', label: 'Promotions' },
  { key: 'jobs', label: 'Jobs' },
  { key: 'attachments', label: 'Attachments' },
  { key: 'reminders', label: 'Reminders' },
  { key: 'timeline', label: 'Timeline' },
  { key: 'smart', label: 'Smart' },
  { key: 'insights', label: 'Insights' },
];

export const SummaryView: React.FC<SummaryViewProps> = ({ summary, onBack }) => {
  const [activeTab, setActiveTab] = useState<TabKey>('important');

  const getEmailsForTab = (tab: TabKey): ProcessedEmail[] => {
    switch (tab) {
      case 'bills': return summary.bills;
      case 'studentMeetings': return summary.studentMeetings;
      case 'jobMeetings': return summary.jobMeetings;
      case 'internshipMeetings': return summary.internshipMeetings;
      case 'meetings': return summary.meetings;
      case 'promotions': return summary.promotions;
      case 'jobs': return summary.jobs;
      case 'attachments': return summary.attachments;
      case 'important': return summary.important;
      default: return [];
    }
  };

  const insights = useMemo(() => {
    const allEmails = [...summary.bills, ...summary.studentMeetings, ...summary.jobMeetings, ...summary.internshipMeetings, ...summary.meetings, ...summary.promotions, ...summary.jobs, ...summary.attachments, ...summary.important, ...summary.otp];
    
    const hourlyActivity = new Array(24).fill(0);
    allEmails.forEach(email => {
      const hour = new Date(email.date).getHours();
      hourlyActivity[hour]++;
    });
    
    const senderFreq: Record<string, number> = {};
    allEmails.forEach(email => {
      const sender = email.from.split('<')[0].trim();
      senderFreq[sender] = (senderFreq[sender] || 0) + 1;
    });
    const topSenders = Object.entries(senderFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    const categoryCount = {
      Bills: summary.bills.length,
      Classes: summary.studentMeetings.length,
      'Job Interviews': summary.jobMeetings.length,
      Internships: summary.internshipMeetings.length,
      Meetings: summary.meetings.length,
      Promotions: summary.promotions.length,
      Jobs: summary.jobs.length,
      Attachments: summary.attachments.length,
      OTP: summary.otp.length,
    };
    
    return { hourlyActivity, topSenders, categoryCount };
  }, [summary]);

  const currentEmails = getEmailsForTab(activeTab);

  const getHeatmapColor = (count: number, max: number) => {
    if (count === 0) return '#f5f5f5';
    const intensity = count / max;
    if (intensity > 0.7) return '#ef4444';
    if (intensity > 0.4) return '#f59e0b';
    return '#10b981';
  };

  return (
    <div className="min-h-screen" style={{ background: '#fafafa' }}>
      <header style={{ background: 'white', borderBottom: '1px solid #e5e5e5' }}>
        <div className="container">
          <div className="row between" style={{ padding: '1rem 0' }}>
            <button onClick={onBack} className="btn btn-ghost btn-sm">
              <Icons.ArrowLeft /> Back
            </button>
            <span style={{ fontSize: '0.875rem', color: '#737373' }}>
              {summary.generatedAt.toLocaleString()}
            </span>
          </div>
        </div>
      </header>

      <div className="container" style={{ paddingTop: '2rem' }}>
        <div className="card overflow-hidden mb-6">
          <div className="tab-list">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`tab ${activeTab === tab.key ? 'tab-active' : ''}`}
              >
                <span>{tab.label}</span>
                {tab.key !== 'insights' && tab.key !== 'timeline' && tab.key !== 'smart' && tab.key !== 'reminders' && (
                  <span className="badge badge-neutral">
                    {getEmailsForTab(tab.key).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'reminders' ? (
              <ReminderPanel emails={[...summary.bills, ...summary.studentMeetings, ...summary.jobMeetings, ...summary.internshipMeetings, ...summary.meetings, ...summary.promotions, ...summary.jobs, ...summary.attachments, ...summary.important, ...summary.otp]} />
            ) : activeTab === 'timeline' ? (
              <TimelineView emails={[...summary.bills, ...summary.studentMeetings, ...summary.jobMeetings, ...summary.internshipMeetings, ...summary.meetings, ...summary.promotions, ...summary.jobs, ...summary.attachments, ...summary.important, ...summary.otp]} />
            ) : activeTab === 'smart' ? (
              <InsightsPanel emails={[...summary.bills, ...summary.studentMeetings, ...summary.jobMeetings, ...summary.internshipMeetings, ...summary.meetings, ...summary.promotions, ...summary.jobs, ...summary.attachments, ...summary.important, ...summary.otp]} />
            ) : activeTab === 'insights' ? (
              <div className="stack stack-6">
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }} className="row row-2"><Icons.BarChart /> Email Activity Heatmap</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '0.5rem' }}>
                    {insights.hourlyActivity.map((count, hour) => {
                      const maxCount = Math.max(...insights.hourlyActivity);
                      return (
                        <div key={hour} style={{ textAlign: 'center' }}>
                          <div
                            style={{
                              width: '100%',
                              height: '60px',
                              background: getHeatmapColor(count, maxCount),
                              borderRadius: '0.375rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: '600',
                              fontSize: '0.875rem',
                              color: count > 0 ? 'white' : '#737373'
                            }}
                          >
                            {count}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#737373', marginTop: '0.25rem' }}>
                            {hour}:00
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="row row-2" style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#737373' }}>
                    <span>Legend:</span>
                    <div style={{ width: '20px', height: '20px', background: '#10b981', borderRadius: '0.25rem' }}></div>
                    <span>Low</span>
                    <div style={{ width: '20px', height: '20px', background: '#f59e0b', borderRadius: '0.25rem' }}></div>
                    <span>Medium</span>
                    <div style={{ width: '20px', height: '20px', background: '#ef4444', borderRadius: '0.25rem' }}></div>
                    <span>High</span>
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }} className="row row-2"><Icons.Mail /> Top Senders</h3>
                  <div className="stack stack-2">
                    {insights.topSenders.map(([sender, count], i) => (
                      <div key={i} className="row between" style={{ padding: '0.75rem', background: '#f5f5f5', borderRadius: '0.5rem' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{sender}</span>
                        <span className="badge badge-primary">{count} emails</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }} className="row row-2"><Icons.BarChart /> Category Breakdown</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(insights.categoryCount).map(([category, count]) => (
                      <div key={category} className="card card-sm">
                        <div style={{ marginBottom: '0.5rem' }}>
                          {category === 'Bills' && <Icons.DollarSign />}
                          {category === 'Classes' && <Icons.Calendar />}
                          {category === 'Job Interviews' && <Icons.Briefcase />}
                          {category === 'Internships' && <Icons.Briefcase />}
                          {category === 'Meetings' && <Icons.Calendar />}
                          {category === 'Promotions' && <Icons.Star />}
                          {category === 'Jobs' && <Icons.Briefcase />}
                          {category === 'Attachments' && <Icons.Paperclip />}
                          {category === 'OTP' && <Icons.Lock />}
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{count}</div>
                        <div style={{ fontSize: '0.875rem', color: '#737373' }}>{category}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : currentEmails.length === 0 ? (
              <div className="text-center" style={{ padding: '4rem' }}>
                <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}><Icons.Mail /></div>
                <p style={{ color: '#737373' }}>No emails in this category</p>
              </div>
            ) : (
              <div className="stack stack-3">
                {currentEmails.map((email) => (
                  <EmailCard key={email.id} email={email} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryView;
