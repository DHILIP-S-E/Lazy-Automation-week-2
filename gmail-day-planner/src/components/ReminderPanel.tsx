import React, { useState, useMemo } from 'react';
import type { ProcessedEmail } from '../types/email';
import { ReminderExtractor, type Reminder } from '../modules/reminders';
import { Icons } from './Icons';

interface ReminderPanelProps {
  emails: ProcessedEmail[];
}

export const ReminderPanel: React.FC<ReminderPanelProps> = ({ emails }) => {
  const [pastedText, setPastedText] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);

  const extractor = useMemo(() => new ReminderExtractor(), []);

  const emailReminders = useMemo(() => {
    const reminders: Reminder[] = [];
    emails.forEach(email => {
      if (email.extractedData.dueDates.length > 0 || email.extractedData.times.length > 0) {
        const text = `${email.subject}\n${email.plainText.substring(0, 500)}`;
        const extracted = extractor.extractFromText(text, email.subject.substring(0, 40));
        reminders.push(...extracted);
      }
    });
    return reminders.slice(0, 50);
  }, [emails, extractor]);

  const textReminders = useMemo(() => {
    if (!pastedText.trim()) return [];
    return extractor.extractFromText(pastedText, 'Pasted Text');
  }, [pastedText, extractor]);

  const allReminders = useMemo(() => {
    return [...emailReminders, ...textReminders].sort((a, b) => {
      const urgencyOrder = { past: 0, today: 1, tomorrow: 2, upcoming: 3 };
      if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
        return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
      }
      if (a.date && b.date) return a.date.getTime() - b.date.getTime();
      if (a.date) return -1;
      if (b.date) return 1;
      return 0;
    });
  }, [emailReminders, textReminders]);

  const groupedReminders = useMemo(() => {
    return {
      today: allReminders.filter(r => r.urgency === 'today'),
      tomorrow: allReminders.filter(r => r.urgency === 'tomorrow'),
      upcoming: allReminders.filter(r => r.urgency === 'upcoming'),
      past: allReminders.filter(r => r.urgency === 'past')
    };
  }, [allReminders]);

  const formatDate = (date?: Date) => {
    if (!date) return '';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);
    
    if (dateOnly.getTime() === today.getTime()) return 'Today';
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (dateOnly.getTime() === tomorrow.getTime()) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getUrgencyColor = (urgency: Reminder['urgency']) => {
    switch (urgency) {
      case 'past': return '#737373';
      case 'today': return '#dc2626';
      case 'tomorrow': return '#f59e0b';
      case 'upcoming': return '#3b82f6';
    }
  };

  return (
    <div className="stack stack-6">
      <div className="card card-md">
        <div className="row between" style={{ marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Icons.Bell /> Auto Reminders & Deadlines
          </h3>
          <button 
            onClick={() => setShowTextInput(!showTextInput)} 
            className="btn btn-secondary btn-sm"
          >
            {showTextInput ? 'Hide' : '+ Add Text'}
          </button>
        </div>

        {showTextInput && (
          <div style={{ marginBottom: '1rem' }}>
            <textarea
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste text, notes, or deadlines here...&#10;&#10;Examples:&#10;• Pay electricity bill by 9 Dec&#10;• Submit project tomorrow&#10;• Attend interview at 4 PM today"
              style={{
                width: '100%',
                minHeight: '120px',
                padding: '0.75rem',
                border: '1px solid #e5e5e5',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
            <div style={{ fontSize: '0.75rem', color: '#737373', marginTop: '0.5rem' }}>
              Found {textReminders.length} reminder{textReminders.length !== 1 ? 's' : ''} in pasted text
            </div>
          </div>
        )}

        <div style={{ fontSize: '0.875rem', color: '#737373' }}>
          Total: {allReminders.length} reminders from {emails.length} emails
          {textReminders.length > 0 && ` + pasted text`}
        </div>
      </div>

      {groupedReminders.today.length > 0 && (
        <div className="card card-md animate-fade-in" style={{ borderLeft: '4px solid #dc2626', background: 'linear-gradient(135deg, #ffffff 0%, #fef2f2 100%)' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Icons.Flame /> Today
          </h4>
          <div className="stack stack-2">
            {groupedReminders.today.map((reminder, i) => (
              <div key={i} className="hover-lift" style={{ padding: '1rem', background: 'white', borderRadius: '0.5rem', border: '1px solid #fecaca', boxShadow: '0 1px 3px rgba(220, 38, 38, 0.1)' }}>
                <div style={{ fontWeight: '500', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                  {reminder.text}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#737373', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {reminder.time && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><Icons.Clock style={{ width: '0.875rem', height: '0.875rem' }} /> {reminder.time}</span>}
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><Icons.Mail style={{ width: '0.875rem', height: '0.875rem' }} /> {reminder.source}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {groupedReminders.tomorrow.length > 0 && (
        <div className="card card-md animate-fade-in" style={{ borderLeft: '4px solid #f59e0b', background: 'linear-gradient(135deg, #ffffff 0%, #fffbeb 100%)' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Icons.Clock /> Tomorrow
          </h4>
          <div className="stack stack-2">
            {groupedReminders.tomorrow.map((reminder, i) => (
              <div key={i} className="hover-lift" style={{ padding: '1rem', background: 'white', borderRadius: '0.5rem', border: '1px solid #fde68a', boxShadow: '0 1px 3px rgba(245, 158, 11, 0.1)' }}>
                <div style={{ fontWeight: '500', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                  {reminder.text}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#737373', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {reminder.time && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><Icons.Clock style={{ width: '0.875rem', height: '0.875rem' }} /> {reminder.time}</span>}
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><Icons.Mail style={{ width: '0.875rem', height: '0.875rem' }} /> {reminder.source}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {groupedReminders.upcoming.length > 0 && (
        <div className="card card-md animate-fade-in" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Icons.Calendar /> Upcoming
          </h4>
          <div className="stack stack-2">
            {groupedReminders.upcoming.slice(0, 10).map((reminder, i) => (
              <div key={i} className="row between hover-lift" style={{ padding: '1rem', background: 'white', borderRadius: '0.5rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '500', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                    {reminder.text}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#737373', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Icons.Mail style={{ width: '0.875rem', height: '0.875rem' }} /> {reminder.source}
                  </div>
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: '600', color: getUrgencyColor(reminder.urgency), whiteSpace: 'nowrap', marginLeft: '1rem' }}>
                  {formatDate(reminder.date)}
                  {reminder.time && <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>{reminder.time}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {allReminders.length === 0 && (
        <div className="card card-md text-center" style={{ padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}><Icons.Calendar style={{ width: '4rem', height: '4rem' }} /></div>
          <p style={{ color: '#737373' }}>No reminders or deadlines found</p>
          <p style={{ fontSize: '0.875rem', color: '#737373', marginTop: '0.5rem' }}>
            Try pasting text with dates or deadlines
          </p>
        </div>
      )}
    </div>
  );
};
