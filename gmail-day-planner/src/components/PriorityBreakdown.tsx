import React, { useMemo } from 'react';
import type { ProcessedEmail } from '../types/email';

interface PriorityBreakdownProps {
  emails: ProcessedEmail[];
}

export const PriorityBreakdown: React.FC<PriorityBreakdownProps> = ({ emails }) => {
  const getCategoryCount = (category: string) => emails.filter(e => e.category === category).length;

  const breakdown = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const in3Days = new Date(today);
    in3Days.setDate(in3Days.getDate() + 3);

    // Get actual category counts
    const billsCount = getCategoryCount('Bills');
    const jobsCount = getCategoryCount('Jobs') + getCategoryCount('Job Meetings') + getCategoryCount('Internship Meetings');
    const meetingsCount = getCategoryCount('Meetings') + getCategoryCount('Student Meetings');
    const attachmentsCount = getCategoryCount('Attachments');
    
    // Count urgent keywords
    const IMPORTANT_KEYWORDS = ['urgent', 'important', 'action required', 'reminder', 'final notice', 'deadline'];
    let keywordsCount = 0;
    emails.forEach(email => {
      const text = `${email.subject} ${email.plainText}`.toLowerCase();
      if (IMPORTANT_KEYWORDS.some(kw => text.includes(kw))) keywordsCount++;
    });

    // Calculate scores
    const billsScore = billsCount * 10;
    const jobsScore = jobsCount * 3;
    const meetingsScore = meetingsCount * 2;
    const attachmentsScore = attachmentsCount * 1;
    const keywordsScore = keywordsCount * 1;

    const totalScore = Math.min(billsScore + jobsScore + meetingsScore + attachmentsScore + keywordsScore, 100);

    // Get meeting details
    const meetingsDetails: string[] = [];
    emails.forEach(email => {
      if ((email.category === 'Meetings' || email.category === 'Student Meetings') && email.extractedData.times.length > 0 && meetingsDetails.length < 2) {
        meetingsDetails.push(`${email.extractedData.times[0]}: ${email.subject.substring(0, 30)}`);
      }
    });

    return {
      totalScore,
      billsScore,
      billsCount,
      jobsScore,
      jobsCount,
      meetingsScore,
      meetingsCount,
      attachmentsScore,
      attachmentsCount,
      keywordsScore,
      keywordsCount,
      meetingsDetails
    };
  }, [emails]);

  const getScoreColor = (score: number) => {
    if (score >= 70) return '#dc2626';
    if (score >= 40) return '#f59e0b';
    return '#10b981';
  };

  const getBarWidth = (score: number, max: number) => `${(score / max) * 100}%`;

  return (
    <div className="card card-md">
      <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
        📊 Priority Score Breakdown
      </h3>

      <div style={{ marginBottom: '2rem' }}>
        <div className="row between" style={{ marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.875rem', color: '#737373' }}>Total Priority Score</span>
          <span style={{ fontSize: '1.5rem', fontWeight: '700', color: getScoreColor(breakdown.totalScore) }}>
            {breakdown.totalScore}/100
          </span>
        </div>
        <div style={{ height: '12px', background: '#f5f5f5', borderRadius: '6px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${breakdown.totalScore}%`, background: getScoreColor(breakdown.totalScore), transition: 'width 0.3s' }} />
        </div>
      </div>

      <div className="stack stack-3">
        <div>
          <div className="row between" style={{ marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>💰 Bills ({breakdown.billsCount} emails)</span>
            <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>+{breakdown.billsScore}</span>
          </div>
          <div style={{ height: '8px', background: '#f5f5f5', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min((breakdown.billsScore / 100) * 100, 100)}%`, background: '#10b981' }} />
          </div>
        </div>

        <div>
          <div className="row between" style={{ marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>💼 Jobs ({breakdown.jobsCount} emails)</span>
            <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>+{breakdown.jobsScore}</span>
          </div>
          <div style={{ height: '8px', background: '#f5f5f5', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min((breakdown.jobsScore / 100) * 100, 100)}%`, background: '#3b82f6' }} />
          </div>
        </div>

        <div>
          <div className="row between" style={{ marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>📅 Meetings ({breakdown.meetingsCount} emails)</span>
            <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>+{breakdown.meetingsScore}</span>
          </div>
          <div style={{ height: '8px', background: '#f5f5f5', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min((breakdown.meetingsScore / 100) * 100, 100)}%`, background: '#f59e0b' }} />
          </div>
          {breakdown.meetingsDetails.length > 0 && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#737373' }}>
              {breakdown.meetingsDetails.map((detail, i) => (
                <div key={i}>• {detail}</div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="row between" style={{ marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>📎 Attachments ({breakdown.attachmentsCount} emails)</span>
            <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>+{breakdown.attachmentsScore}</span>
          </div>
          <div style={{ height: '8px', background: '#f5f5f5', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min((breakdown.attachmentsScore / 100) * 100, 100)}%`, background: '#8b5cf6' }} />
          </div>
        </div>

        <div>
          <div className="row between" style={{ marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>❗ Keywords ({breakdown.keywordsCount} emails)</span>
            <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>+{breakdown.keywordsScore}</span>
          </div>
          <div style={{ height: '8px', background: '#f5f5f5', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min((breakdown.keywordsScore / 100) * 100, 100)}%`, background: '#ef4444' }} />
          </div>
        </div>
      </div>
    </div>
  );
};
