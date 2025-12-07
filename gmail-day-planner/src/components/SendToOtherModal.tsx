import React, { useState } from 'react';
import { Icons } from './Icons';

interface SendToOtherModalProps {
  onClose: () => void;
  onSend: (email: string) => void;
}

export const SendToOtherModal: React.FC<SendToOtherModalProps> = ({ onClose, onSend }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSend = () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    onSend(email);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Icons.Send style={{ width: '1.5rem', height: '1.5rem' }} /> Send Summary to Other
          </h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm"><Icons.X /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ padding: '1rem', background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', borderRadius: '0.75rem', border: '1px solid #bfdbfe' }}>
            <p style={{ fontSize: '0.875rem', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Icons.AlertCircle style={{ width: '1rem', height: '1rem' }} />
              Enter the recipient's email address to send your email summary
            </p>
          </div>

          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem', display: 'block' }}>
              Recipient Email Address
            </label>
            <input
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              autoFocus
              style={{ 
                width: '100%', 
                border: error ? '2px solid #dc2626' : '1px solid #d1d5db', 
                borderRadius: '0.5rem', 
                padding: '0.875rem', 
                fontSize: '0.9375rem', 
                outline: 'none',
                transition: 'border 0.2s'
              }}
            />
            {error && (
              <p style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Icons.AlertCircle style={{ width: '0.875rem', height: '0.875rem' }} />
                {error}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
            <button onClick={onClose} className="btn btn-secondary btn-md">Cancel</button>
            <button onClick={handleSend} className="btn btn-primary btn-md" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Icons.Send style={{ width: '1rem', height: '1rem' }} /> Send Summary
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
