import React, { useMemo } from 'react';
import type { ProcessedEmail } from '../types/email';

interface PriorityBreakdownProps {
  emails: ProcessedEmail[];
}

export const PriorityBreakdown: React.FC<PriorityBreakdownProps> = ({ emails }) => {
  const breakdown = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const in3Days = new Date(today);
    in3Days.setDate(in3Days.getDate() + 3);

    let billsScore = 0;
    let jobsScore = 0;
    let meetingsScore = 0;
    let attachmentsScore = 0;
    let keywordsScore = 0;

    const billsDetails: string[] = [];
    const jobsDetails: string[] = [];
    const meetingsDetails: string[] = [];

    const IMPORTANT_KEYWORDS = ['urgent', 'important', 'action required', 'reminder', 'final notice', 'deadline'];

    emails.forEach(email => {
      const text = `${email.subject} ${email.plainText}`.toLowerCase();

      // Bills scoring
      if (email.category === 'Bills') {
        if (email.extractedData.dueDates.length > 0) {
          const dueDate = new Date(email.extractedData.dueDates[0]);
          dueDate.setHours(0, 0, 0, 0);
          
          if (dueDate.getTime() === today.getTime()) {
            billsScore += 15;
            billsDetails.push(`Due TODAY: ${email.subject.substring(0, 30)}`);
          } else if (dueDate.getTime() === tomorrow.getTime()) {
            billsScore += 10;
            billsDetails.push(`Due TOMORROW: ${email.subject.substring(0, 30)}`);
          } else if (dueDate <= in3Days) {
            billsScore += 5;
          } else {
            billsScore += 1;
          }
        } else {
          billsScore += 1;
        }
      }

      // Jobs scoring
      if (email.category === 'Jobs') {
        if (email.extractedData.dueDates.length > 0) {
          const deadline = new Date(email.extractedData.dueDates[0]);
          deadline.setHours(0, 0, 0, 0);
          
          if (deadline.getTime() === today.getTime()) {
            jobsScore += 12;
            jobsDetails.push(`Deadline TODAY: ${email.subject.substring(0, 30)}`);
          } else if (deadline <= in3Days) {
            jobsScore += 8;
          } else {
            jobsScore += 2;
          }
        } else {
          jobsScore += 2;
        }
      }

      // Meetings scoring
      if (email.category === 'Meetings') {
        if (email.extractedData.times.length > 0) {
          meetingsScore += 10;
          meetingsDetails.push(`${email.extractedData.times[0]}: ${email.subject.substring(0, 30)}`);
        } else {
          meetingsScore += 2;
        }
      }

      // Attachments scoring
      if (email.attachments.length > 0) {
        if (IMPORTANT_KEYWORDS.some(kw => text.includes(kw))) {
          attachmentsScore += 6;
        } else {
          attachmentsScore += 3;
        }
        if (email.attachments.length > 1) {
          attachmentsScore += 2;
        }
      }

      // Keywords scoring
      const keywordCount = IMPORTANT_KEYWORDS.filter(kw => text.includes(kw)).length;
      keywordsScore += Math.min(keywordCount * 3, 15);
    });

    const totalScore = Math.min(billsScore + jobsScore + meetingsScore + attachmentsScore + keywordsScore, 100);

    return {
      totalScore,
      billsScore: Math.min(billsScore, 30),
      jobsScore: Math.min(jobsScore, 20),
      meetingsScore: Math.min(meetingsScore, 20),
      attachmentsScore: Math.min(attachmentsScore, 10),
      keywordsScore: Math.min(keywordsScore, 15),
      billsDetails,
      jobsDetails,
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
            <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>💰 Bills</span>
            <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>{breakdown.billsScore}/30</span>
          </div>
          <div style={{ height: '8px', background: '#f5f5f5', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: getBarWidth(breakdown.billsScore, 30), background: '#10b981' }} />
          </div>
          {breakdown.billsDetails.length > 0 && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#737373' }}>
              {breakdown.billsDetails.slice(0, 2).map((detail, i) => (
                <div key={i}>• {detail}</div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="row between" style={{ marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>💼 Jobs</span>
            <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>{breakdown.jobsScore}/20</span>
          </div>
          <div style={{ height: '8px', background: '#f5f5f5', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: getBarWidth(breakdown.jobsScore, 20), background: '#3b82f6' }} />
          </div>
          {breakdown.jobsDetails.length > 0 && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#737373' }}>
              {breakdown.jobsDetails.slice(0, 2).map((detail, i) => (
                <div key={i}>• {detail}</div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="row between" style={{ marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>📅 Meetings</span>
            <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>{breakdown.meetingsScore}/20</span>
          </div>
          <div style={{ height: '8px', background: '#f5f5f5', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: getBarWidth(breakdown.meetingsScore, 20), background: '#f59e0b' }} />
          </div>
          {breakdown.meetingsDetails.length > 0 && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#737373' }}>
              {breakdown.meetingsDetails.slice(0, 2).map((detail, i) => (
                <div key={i}>• {detail}</div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="row between" style={{ marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>📎 Attachments</span>
            <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>{breakdown.attachmentsScore}/10</span>
          </div>
          <div style={{ height: '8px', background: '#f5f5f5', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: getBarWidth(breakdown.attachmentsScore, 10), background: '#8b5cf6' }} />
          </div>
        </div>

        <div>
          <div className="row between" style={{ marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>❗ Keywords</span>
            <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>{breakdown.keywordsScore}/15</span>
          </div>
          <div style={{ height: '8px', background: '#f5f5f5', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: getBarWidth(breakdown.keywordsScore, 15), background: '#ef4444' }} />
          </div>
        </div>
      </div>
    </div>
  );
};
