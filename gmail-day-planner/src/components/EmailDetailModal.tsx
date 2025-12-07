import React from 'react';
import type { ProcessedEmail } from '../types/email';
import { Icons } from './Icons';

interface EmailDetailModalProps {
  email: ProcessedEmail;
  onClose: () => void;
  onSave?: () => void;
  onRemove?: () => void;
  isSaved?: boolean;
}

export const EmailDetailModal: React.FC<EmailDetailModalProps> = ({ email, onClose, onSave, onRemove, isSaved }) => {
  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }} onClick={onClose}>
      <div className="card" style={{ maxWidth: '800px', width: '100%', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: '1.5rem', borderBottom: '2px solid #e5e5e5', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <div className="row between" style={{ marginBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white' }}>📧 Email Details</h2>
            <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ color: 'white' }}><Icons.X /></button>
          </div>
          <div className="row row-2">
            <span className="badge" style={{ background: 'white', color: '#667eea', fontWeight: '600' }}>{email.category}</span>
            <span className="badge" style={{ background: 'rgba(255,255,255,0.3)', color: 'white' }}>Priority: {email.importanceScore}</span>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '1.5rem' }}>
          <div className="stack stack-4">
            {/* Subject */}
            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '0.75rem', borderLeft: '4px solid #667eea' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#737373', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Subject</p>
              <p style={{ fontWeight: '600', fontSize: '1.25rem', color: '#1e293b', lineHeight: '1.4' }}>{email.subject}</p>
            </div>

            {/* Meta Info */}
            <div className="grid grid-cols-2 gap-3">
              <div style={{ padding: '1rem', background: '#f0f9ff', borderRadius: '0.75rem' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#0369a1', marginBottom: '0.5rem' }}>👤 FROM</p>
                <p style={{ fontSize: '0.875rem', color: '#0c4a6e', wordBreak: 'break-word' }}>{email.from}</p>
              </div>
              <div style={{ padding: '1rem', background: '#fef3c7', borderRadius: '0.75rem' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#92400e', marginBottom: '0.5rem' }}>📅 DATE</p>
                <p style={{ fontSize: '0.875rem', color: '#78350f' }}>{formatDate(email.date)}</p>
              </div>
            </div>

            {/* Extracted Data Grid */}
            {(email.extractedData.amounts.length > 0 || email.extractedData.dueDates.length > 0 || email.extractedData.times.length > 0 || email.extractedData.otpCodes.length > 0) && (
              <div style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', borderRadius: '0.75rem' }}>
                <p style={{ fontSize: '0.875rem', fontWeight: '700', color: '#78350f', marginBottom: '1rem' }}>🔍 EXTRACTED DATA</p>
                <div className="grid grid-cols-2 gap-3">
                  {email.extractedData.amounts.length > 0 && (
                    <div>
                      <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#92400e', marginBottom: '0.5rem' }}>💰 Amounts</p>
                      <div className="row row-2">
                        {email.extractedData.amounts.map((amt, i) => (
                          <span key={i} style={{ padding: '0.25rem 0.75rem', background: '#10b981', color: 'white', borderRadius: '0.375rem', fontSize: '0.875rem', fontWeight: '600' }}>{amt}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {email.extractedData.dueDates.length > 0 && (
                    <div>
                      <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#92400e', marginBottom: '0.5rem' }}>📅 Due Dates</p>
                      <div className="row row-2">
                        {email.extractedData.dueDates.map((date, i) => (
                          <span key={i} style={{ padding: '0.25rem 0.75rem', background: '#f59e0b', color: 'white', borderRadius: '0.375rem', fontSize: '0.875rem', fontWeight: '600' }}>{new Date(date).toLocaleDateString()}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {email.extractedData.times.length > 0 && (
                    <div>
                      <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#92400e', marginBottom: '0.5rem' }}>⏰ Times</p>
                      <div className="row row-2">
                        {email.extractedData.times.map((time, i) => (
                          <span key={i} style={{ padding: '0.25rem 0.75rem', background: '#3b82f6', color: 'white', borderRadius: '0.375rem', fontSize: '0.875rem', fontWeight: '600' }}>{time}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {email.extractedData.otpCodes.length > 0 && (
                    <div>
                      <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#92400e', marginBottom: '0.5rem' }}>🔐 OTP</p>
                      <div className="row row-2">
                        {email.extractedData.otpCodes.map((otp, i) => (
                          <span key={i} style={{ padding: '0.5rem 1rem', background: '#8b5cf6', color: 'white', borderRadius: '0.5rem', fontFamily: 'monospace', fontSize: '1.25rem', fontWeight: '700', letterSpacing: '0.1em' }}>{otp}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Links */}
            {email.extractedData.urls.length > 0 && (
              <div style={{ padding: '1rem', background: '#eff6ff', borderRadius: '0.75rem' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#1e40af', marginBottom: '0.75rem' }}>🔗 LINKS ({email.extractedData.urls.length})</p>
                <div className="stack stack-2">
                  {email.extractedData.urls.slice(0, 3).map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" style={{ padding: '0.75rem', background: 'white', borderRadius: '0.5rem', fontSize: '0.75rem', color: '#2563eb', wordBreak: 'break-all', textDecoration: 'none', border: '1px solid #bfdbfe' }}>
                      {url.substring(0, 70)}...
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Attachments */}
            {email.attachments.length > 0 && (
              <div style={{ padding: '1rem', background: '#fef2f2', borderRadius: '0.75rem' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#991b1b', marginBottom: '0.75rem' }}>📎 ATTACHMENTS ({email.attachments.length})</p>
                <div className="stack stack-2">
                  {email.attachments.map((att, i) => (
                    <div key={i} className="row row-2" style={{ padding: '0.75rem', background: 'white', borderRadius: '0.5rem', fontSize: '0.875rem', border: '1px solid #fecaca' }}>
                      <Icons.Paperclip />
                      <span style={{ fontWeight: '500' }}>{att.filename}</span>
                      <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#737373' }}>{(att.size / 1024).toFixed(1)} KB</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Email Preview */}
            <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#475569', marginBottom: '0.75rem' }}>📄 EMAIL PREVIEW</p>
              <div style={{ fontSize: '0.875rem', lineHeight: '1.8', color: '#334155', maxHeight: '250px', overflow: 'auto' }}>
                {email.plainText.substring(0, 800)}{email.plainText.length > 800 ? '...' : ''}
              </div>
            </div>

          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ padding: '1.5rem', borderTop: '2px solid #e5e5e5', background: '#fafafa' }}>
          <div className="row row-2">
            {isSaved ? (
              <button onClick={onRemove} className="btn btn-secondary" style={{ flex: 1 }}>
                <Icons.Trash /> Remove from Saved
              </button>
            ) : (
              <button onClick={onSave} className="btn btn-primary" style={{ flex: 1, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}>
                <Icons.Star /> Save as Important
              </button>
            )}
            <button onClick={onClose} className="btn btn-ghost">Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};
