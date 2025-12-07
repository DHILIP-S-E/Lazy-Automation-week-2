import React, { useMemo } from 'react';
import type { ProcessedEmail } from '../types/email';
import { MeetingTimeline, DeadlineCountdown, TaskExtractor } from '../modules/timeline';

interface TimelineViewProps {
  emails: ProcessedEmail[];
}

export const TimelineView: React.FC<TimelineViewProps> = ({ emails }) => {
  const timeline = useMemo(() => new MeetingTimeline(), []);
  const countdown = useMemo(() => new DeadlineCountdown(), []);
  const taskExtractor = useMemo(() => new TaskExtractor(), []);

  const meetingEvents = useMemo(() => timeline.extractMeetingEvents(emails), [emails, timeline]);
  const conflicts = useMemo(() => timeline.detectConflicts(meetingEvents), [meetingEvents, timeline]);
  const deadlines = useMemo(() => countdown.extractDeadlines(emails), [emails, countdown]);
  const tasks = useMemo(() => taskExtractor.extractTasks(emails), [emails, taskExtractor]);

  return (
    <div className="stack stack-6">
      {meetingEvents.length > 0 && (
        <div className="card card-md">
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
            🕒 Meeting Timeline
          </h3>
          <div className="stack stack-3">
            {meetingEvents.map((event, i) => (
              <div key={i} className="row row-3" style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '0.5rem' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2563eb', minWidth: '80px' }}>
                  {timeline.formatTime(event.time)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '500' }}>{event.title}</div>
                </div>
              </div>
            ))}
          </div>
          {conflicts.length > 0 && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: '#fef2f2', borderRadius: '0.5rem', border: '1px solid #fecaca' }}>
              <div style={{ fontWeight: '600', color: '#dc2626', marginBottom: '0.5rem' }}>
                ⚠️ Conflict Alert
              </div>
              {conflicts.map((conflict, i) => (
                <div key={i} style={{ fontSize: '0.875rem', color: '#991b1b', marginTop: '0.25rem' }}>
                  {timeline.formatTime(conflict.time)}: {conflict.meetings.length} meetings overlap
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {deadlines.length > 0 && (
        <div className="card card-md">
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
            ⏳ Deadline Countdown
          </h3>
          <div className="stack stack-2">
            {deadlines.slice(0, 10).map((item, i) => {
              const color = item.status === 'overdue' ? '#dc2626' : item.status === 'today' ? '#ea580c' : item.status === 'tomorrow' ? '#f59e0b' : '#737373';
              return (
                <div key={i} className="row between" style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '0.5rem', borderLeft: `3px solid ${color}` }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '500', fontSize: '0.875rem' }}>{item.title}</div>
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: '600', color }}>
                    {countdown.formatCountdown(item)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tasks.length > 0 && (
        <div className="card card-md">
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
            📝 Tasks & Action Items ({tasks.length})
          </h3>
          <div className="stack stack-2">
            {tasks.slice(0, 15).map((task, i) => (
              <div key={i} className="row row-2" style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '0.5rem', borderLeft: task.deadline ? '3px solid #3b82f6' : '3px solid #d1d5db' }}>
                <div style={{ fontSize: '1.25rem' }}>{task.deadline ? '⏰' : '•'}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: '500' }}>{task.task}</div>
                  <div style={{ fontSize: '0.75rem', color: '#737373', marginTop: '0.25rem' }}>
                    From: {task.subject}
                  </div>
                  {task.deadline && (
                    <div style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: '600', marginTop: '0.25rem' }}>
                      📅 Deadline: {task.deadline}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {meetingEvents.length === 0 && deadlines.length === 0 && tasks.length === 0 && (
        <div className="card card-md text-center" style={{ padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
          <p style={{ color: '#737373' }}>No timeline data found</p>
        </div>
      )}
    </div>
  );
};
