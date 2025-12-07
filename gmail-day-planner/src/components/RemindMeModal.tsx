import React, { useState } from 'react';
import type { ProcessedEmail } from '../types/email';
import { Icons } from './Icons';

interface RemindMeModalProps {
  email: ProcessedEmail;
  userEmail: string;
  onClose: () => void;
  onSchedule: (recipientEmail: string, scheduledTime: Date) => void;
}

export const RemindMeModal: React.FC<RemindMeModalProps> = ({ email, userEmail, onClose, onSchedule }) => {
  const [recipientEmail] = useState(userEmail);
  const [useOtherEmail, setUseOtherEmail] = useState(false);
  const [otherEmail, setOtherEmail] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  


  const handleSchedule = () => {
    const finalEmail = useOtherEmail ? otherEmail : recipientEmail;
    
    if (!finalEmail.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }
    
    if (!date || !time) {
      alert('Please select date and time');
      return;
    }

    const [day, month, year] = date.split('/');
    if (!day || !month || !year) {
      alert('Please enter date in DD/MM/YYYY format');
      return;
    }

    const scheduledTime = new Date(`${year}-${month}-${day}T${time}`);
    const now = new Date();
    
    if (isNaN(scheduledTime.getTime()) || scheduledTime <= now) {
      alert('Please select a valid future date and time');
      return;
    }

    onSchedule(finalEmail, scheduledTime);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Icons.Clock style={{ width: '1.5rem', height: '1.5rem' }} /> Schedule Reminder
          </h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm"><Icons.X /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ padding: '1rem', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', borderRadius: '0.75rem', border: '1px solid #bae6fd' }}>
            <p style={{ fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#0369a1' }}>Email Subject</p>
            <p style={{ fontSize: '0.9375rem', color: '#0c4a6e', fontWeight: '500' }}>{email.subject}</p>
          </div>

          <div>
            <p style={{ fontWeight: '600', marginBottom: '0.75rem', fontSize: '0.9375rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Icons.Mail style={{ width: '1.125rem', height: '1.125rem' }} /> Send reminder to
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '0.75rem', background: !useOtherEmail ? '#eff6ff' : 'transparent', borderRadius: '0.5rem', border: '1px solid', borderColor: !useOtherEmail ? '#3b82f6' : '#e5e7eb', transition: 'all 0.2s' }}>
                <input
                  type="radio"
                  checked={!useOtherEmail}
                  onChange={() => setUseOtherEmail(false)}
                  style={{ width: '1.125rem', height: '1.125rem', accentColor: '#3b82f6' }}
                />
                <span style={{ fontWeight: '500' }}>My email ({userEmail})</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '0.75rem', background: useOtherEmail ? '#eff6ff' : 'transparent', borderRadius: '0.5rem', border: '1px solid', borderColor: useOtherEmail ? '#3b82f6' : '#e5e7eb', transition: 'all 0.2s' }}>
                <input
                  type="radio"
                  checked={useOtherEmail}
                  onChange={() => setUseOtherEmail(true)}
                  style={{ width: '1.125rem', height: '1.125rem', accentColor: '#3b82f6' }}
                />
                <span style={{ fontWeight: '500' }}>Another email</span>
              </label>
              {useOtherEmail && (
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={otherEmail}
                  onChange={(e) => setOtherEmail(e.target.value)}
                  style={{ width: '100%', border: '2px solid #3b82f6', borderRadius: '0.5rem', padding: '0.875rem', fontSize: '0.9375rem', outline: 'none' }}
                />
              )}
            </div>
          </div>

          <div>
            <p style={{ fontWeight: '600', marginBottom: '0.75rem', fontSize: '0.9375rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Icons.Calendar style={{ width: '1.125rem', height: '1.125rem' }} /> Schedule for
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.25rem', display: 'block' }}>Date (DD/MM/YYYY)</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="DD/MM/YYYY"
                    value={date}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9/]/g, '');
                      if (val.length <= 10) setDate(val);
                    }}
                    onBlur={(e) => {
                      const val = e.target.value;
                      if (val.length === 8 && !val.includes('/')) {
                        setDate(`${val.slice(0,2)}/${val.slice(2,4)}/${val.slice(4,8)}`);
                      }
                    }}
                    style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '0.5rem', padding: '0.875rem', paddingRight: '3rem', fontSize: '0.9375rem', outline: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const today = new Date();
                      setDate(`${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`);
                    }}
                    style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: '#3b82f6', padding: '0.5rem' }}
                    title="Set today's date"
                  >
                    <Icons.Calendar style={{ width: '1.25rem', height: '1.25rem' }} />
                  </button>
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.25rem', display: 'block' }}>Time</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '0.5rem', padding: '0.875rem', fontSize: '0.9375rem', outline: 'none' }}
                />
              </div>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>⚠️ Only future dates are allowed</p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
            <button onClick={onClose} className="btn btn-secondary btn-md">Cancel</button>
            <button onClick={handleSchedule} className="btn btn-primary btn-md" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Icons.Clock style={{ width: '1rem', height: '1rem' }} /> Schedule Reminder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
