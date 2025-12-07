import React, { useEffect } from 'react';
import { Icons } from './Icons';

interface ToastProps {
  message: string;
  type?: 'success' | 'error';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div style={{
      position: 'fixed',
      top: '2rem',
      right: '2rem',
      zIndex: 9999,
      padding: '1rem 1.5rem',
      background: type === 'success' ? '#10b981' : '#ef4444',
      color: 'white',
      borderRadius: '0.5rem',
      boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      animation: 'slideIn 0.3s ease-out'
    }}>
      {type === 'success' ? <Icons.CheckCircle /> : <Icons.AlertCircle />}
      <span style={{ fontWeight: '600' }}>{message}</span>
    </div>
  );
};
