import React from 'react';
import { Icons } from './Icons';
import type { ProcessedEmail } from '../types/email';

interface TodaySummaryModalProps {
  emails: ProcessedEmail[];
  onClose: () => void;
}

export const TodaySummaryModal: React.FC<TodaySummaryModalProps> = ({ emails, onClose }) => {
  const today = new Date();
  const todayEmails = emails.filter(e => e.date.toDateString() === today.toDateString());
  
  const categories = [
    { name: 'Bills', icon: '💰', count: todayEmails.filter(e => e.category === 'Bills').length },
    { name: 'Classes', icon: '🏫', count: todayEmails.filter(e => e.category === 'Student Meetings').length },
    { name: 'Job Interviews', icon: '💼', count: todayEmails.filter(e => e.category === 'Job Meetings').length },
    { name: 'Internships', icon: '🎓', count: todayEmails.filter(e => e.category === 'Internship Meetings').length },
    { name: 'Meetings', icon: '📅', count: todayEmails.filter(e => e.category === 'Meetings').length },
    { name: 'Jobs', icon: '💼', count: todayEmails.filter(e => e.category === 'Jobs').length },
    { name: 'OTPs', icon: '🔒', count: todayEmails.filter(e => e.category === 'OTP').length },
    { name: 'Promotions', icon: '⭐', count: todayEmails.filter(e => e.category === 'Promotions').length },
  ];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }} onClick={onClose}>
      <div className="card animate-fade-in" style={{
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto'
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--neutral-200)' }}>
          <div className="row between">
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.25rem' }}>
                📊 Today's Summary
              </h2>
              <p className="stat-label">{today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <button onClick={onClose} className="btn btn-ghost btn-sm">
              <Icons.X />
            </button>
          </div>
        </div>

        <div style={{ padding: '1.5rem' }}>
          <div style={{
            padding: '1.5rem',
            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
            borderRadius: '0.75rem',
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', fontWeight: '900', color: '#2563eb', marginBottom: '0.5rem' }}>
              {todayEmails.length}
            </div>
            <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1e40af' }}>
              Total Emails Today
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {categories.map(cat => (
              <div key={cat.name} className="card hover-lift" style={{ padding: '1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{cat.icon}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--neutral-800)', marginBottom: '0.25rem' }}>
                  {cat.count}
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--neutral-600)' }}>{cat.name}</p>
              </div>
            ))}
          </div>

          {todayEmails.length === 0 && (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <div className="empty-state-icon">📭</div>
              <h3 className="empty-state-title">No emails today</h3>
              <p className="empty-state-description">You haven't received any emails today yet.</p>
            </div>
          )}
        </div>

        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--neutral-200)', textAlign: 'right' }}>
          <button onClick={onClose} className="btn btn-primary btn-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
