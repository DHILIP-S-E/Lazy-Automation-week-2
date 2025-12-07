import React from 'react';
import type { ProcessedEmail } from '../types/email';
import { Icons } from './Icons';

interface EmailCardProps {
  email: ProcessedEmail;
  onAddToCalendar?: (email: ProcessedEmail) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  Bills: '#10b981',
  'Student Meetings': '#f59e0b',
  'Job Meetings': '#3b82f6',
  'Internship Meetings': '#8b5cf6',
  Meetings: '#f59e0b',
  Promotions: '#ec4899',
  Jobs: '#3b82f6',
  OTP: '#8b5cf6',
  Attachments: '#f97316',
  Other: '#737373',
};

export const EmailCard: React.FC<EmailCardProps> = React.memo(({ email, onAddToCalendar }) => {
  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTime = (date: Date): string => {
    return new Date(date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  };

  const color = CATEGORY_COLORS[email.category] || CATEGORY_COLORS.Other;

  return (
    <div className="card card-sm" style={{ borderLeft: `3px solid ${color}`, position: 'relative' }}>
      <div className="row between mb-4" style={{ paddingRight: '3rem' }}>
        <div className="flex-1 min-w-0">
          <h3 style={{ fontSize: '1rem', fontWeight: '500', marginBottom: '0.25rem' }} className="truncate">{email.subject}</h3>
          <p style={{ fontSize: '0.875rem', color: '#737373' }} className="truncate">{email.from}</p>
        </div>
        <div className="flex-shrink-0" style={{ marginLeft: '1rem' }}>
          <span className="badge badge-neutral">{email.importanceScore}</span>
        </div>
      </div>

      <div className="stack stack-2">
        <div style={{ fontSize: '0.75rem', color: '#737373' }}>
          {formatDate(email.date)} • {formatTime(email.date)}
        </div>

        {email.extractedData.amounts.length > 0 && (
          <div className="row row-2" style={{ fontSize: '0.875rem' }}>
            <Icons.DollarSign />
            <span style={{ fontWeight: '500', color: '#10b981' }}>{email.extractedData.amounts[0]}</span>
          </div>
        )}

        {email.extractedData.dueDates.length > 0 && (
          <div className="row row-2" style={{ fontSize: '0.875rem' }}>
            <Icons.Calendar />
            <span style={{ fontWeight: '500', color: '#ef4444' }}>Due {formatDate(email.extractedData.dueDates[0])}</span>
          </div>
        )}

        {email.extractedData.times.length > 0 && (
          <div className="row between" style={{ fontSize: '0.875rem' }}>
            <div className="row row-2">
              <Icons.Clock />
              <span style={{ fontWeight: '500' }}>{email.extractedData.times[0]}</span>
            </div>
            {onAddToCalendar && (email.category === 'Meetings' || email.category === 'Student Meetings' || email.category === 'Job Meetings' || email.category === 'Internship Meetings') && (
              <button
                onClick={() => onAddToCalendar(email)}
                className="btn btn-sm"
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: '#2563eb', color: 'white' }}
              >
                <Icons.Calendar /> Add to Calendar
              </button>
            )}
          </div>
        )}

        {email.extractedData.urls.length > 0 && email.extractedData.urls[0].startsWith('http') && (
          <div className="row row-2" style={{ fontSize: '0.875rem' }}>
            <Icons.Mail />
            <a
              href={email.extractedData.urls[0]}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="btn btn-sm"
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: '#2563eb', color: 'white' }}
            >
              Open Link
            </a>
          </div>
        )}

        {email.extractedData.otpCodes.length > 0 && (
          <div className="row row-2" style={{ fontSize: '0.875rem' }}>
            <Icons.Lock />
            <span style={{ fontFamily: 'monospace', fontWeight: '700', fontSize: '1rem', color: '#8b5cf6' }}>
              {email.extractedData.otpCodes[0]}
            </span>
            <button
              onClick={() => copyToClipboard(email.extractedData.otpCodes[0])}
              className="btn btn-sm"
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
            >
              Copy
            </button>
          </div>
        )}

        {email.attachments.length > 0 && (
          <div className="stack stack-2" style={{ fontSize: '0.875rem' }}>
            <div className="row row-2">
              <Icons.Paperclip />
              <span style={{ fontWeight: '500' }}>{email.attachments.length} file{email.attachments.length > 1 ? 's' : ''}</span>
            </div>
            {email.attachments.slice(0, 3).map((att, i) => (
              <div key={i} style={{ paddingLeft: '1.5rem', fontSize: '0.8125rem', color: '#737373' }}>
                • {att.filename} ({Math.round(att.size / 1024)}KB)
              </div>
            ))}
            {email.attachments.length > 3 && (
              <div style={{ paddingLeft: '1.5rem', fontSize: '0.8125rem', color: '#737373' }}>+ {email.attachments.length - 3} more</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

EmailCard.displayName = 'EmailCard';

export default EmailCard;
