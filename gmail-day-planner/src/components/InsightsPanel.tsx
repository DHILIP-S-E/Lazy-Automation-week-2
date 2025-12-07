import React, { useMemo, useState } from 'react';
import type { ProcessedEmail } from '../types/email';
import { OTPCenter, NoiseFilter, StressIndicator, TomorrowPredictor, DuplicateDetector } from '../modules/insights';
import { PriorityBreakdown } from './PriorityBreakdown';

interface InsightsPanelProps {
  emails: ProcessedEmail[];
}

export const InsightsPanel: React.FC<InsightsPanelProps> = ({ emails }) => {
  const [showNoise, setShowNoise] = useState(false);
  const [focusMode, setFocusMode] = useState(false);

  const otpCenter = useMemo(() => new OTPCenter(), []);
  const noiseFilter = useMemo(() => new NoiseFilter(), []);
  const stressIndicator = useMemo(() => new StressIndicator(), []);
  const tomorrowPredictor = useMemo(() => new TomorrowPredictor(), []);
  const duplicateDetector = useMemo(() => new DuplicateDetector(), []);

  const otps = useMemo(() => otpCenter.extractOTPs(emails), [emails, otpCenter]);
  const { noise } = useMemo(() => noiseFilter.filterNoise(emails), [emails, noiseFilter]);
  const stress = useMemo(() => stressIndicator.analyze(emails), [emails, stressIndicator]);
  const tomorrow = useMemo(() => tomorrowPredictor.predict(emails), [emails, tomorrowPredictor]);
  const { duplicates } = useMemo(() => duplicateDetector.detectDuplicates(emails), [emails, duplicateDetector]);

  const stressColor = stress.level === 'CRITICAL' ? '#dc2626' : stress.level === 'HIGH' ? '#ea580c' : stress.level === 'MEDIUM' ? '#f59e0b' : '#10b981';

  return (
    <div className="stack stack-6">
      <PriorityBreakdown emails={emails} />
      <div className="card card-md" style={{ border: `2px solid ${stressColor}` }}>
        <div className="row between">
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              🧠 Inbox Stress Level: {stress.level}
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#737373' }}>{stress.message}</p>
          </div>
          <div style={{ fontSize: '3rem', fontWeight: '700', color: stressColor }}>
            {stress.score}
          </div>
        </div>
      </div>

      {otps.length > 0 && (
        <div className="card card-md">
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
            🔢 OTP Center
          </h3>
          <div className="stack stack-2">
            {otps.slice(0, 8).map((otp, i) => (
              <div key={i} className="row between" style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '0.5rem' }}>
                <span style={{ fontWeight: '500' }}>{otp.service}</span>
                <span style={{ fontSize: '1.25rem', fontWeight: '700', color: '#2563eb', fontFamily: 'monospace' }}>
                  {otp.code}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tomorrow.length > 0 && (
        <div className="card card-md">
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
            📅 Tomorrow's Preview
          </h3>
          <div className="stack stack-2">
            {tomorrow.slice(0, 6).map((event, i) => (
              <div key={i} className="row row-2" style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '0.5rem' }}>
                <span style={{ fontSize: '1.25rem' }}>
                  {event.type === 'meeting' ? '📅' : event.type === 'bill' ? '💰' : event.type === 'job' ? '💼' : '📝'}
                </span>
                <div style={{ flex: 1 }}>
                  {event.time && <span style={{ fontWeight: '600', marginRight: '0.5rem' }}>{event.time}</span>}
                  <span style={{ fontSize: '0.875rem' }}>{event.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card card-md">
        <div className="row between" style={{ marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>
            🗑 Noise Filter
          </h3>
          <button onClick={() => setShowNoise(!showNoise)} className="btn btn-ghost btn-sm">
            {showNoise ? 'Hide' : 'Show'}
          </button>
        </div>
        <p style={{ fontSize: '0.875rem', color: '#737373' }}>
          Ignored noise emails: <span style={{ fontWeight: '600' }}>{noise.length}</span>
        </p>
        {showNoise && noise.length > 0 && (
          <div className="stack stack-2" style={{ marginTop: '1rem' }}>
            {noise.slice(0, 5).map((email, i) => (
              <div key={i} style={{ fontSize: '0.875rem', padding: '0.5rem', background: '#f5f5f5', borderRadius: '0.375rem' }}>
                {email.subject.substring(0, 60)}
              </div>
            ))}
          </div>
        )}
      </div>

      {duplicates.length > 0 && (
        <div className="card card-md">
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            📋 Duplicate Emails Found: {duplicates.length}
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#737373' }}>Hidden to reduce clutter</p>
        </div>
      )}

      <div className="card card-md">
        <button 
          onClick={() => setFocusMode(!focusMode)} 
          className={`btn ${focusMode ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          style={{ width: '100%' }}
        >
          🎯 {focusMode ? 'Exit Focus Mode' : 'Enable Focus Mode'}
        </button>
        {focusMode && (
          <p style={{ fontSize: '0.875rem', color: '#737373', marginTop: '0.5rem' }}>
            Showing only: Bills, Deadlines, Meetings, Tasks
          </p>
        )}
      </div>
    </div>
  );
};
