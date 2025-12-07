import type { ProcessedEmail } from '../../types/email';

export interface MeetingEvent {
  time: string;
  title: string;
  emailId: string;
  rawTime: string;
}

export interface TimelineConflict {
  time: string;
  meetings: string[];
}

export class MeetingTimeline {
  extractMeetingEvents(emails: ProcessedEmail[]): MeetingEvent[] {
    const events: MeetingEvent[] = [];
    const meetingCategories = ['Meetings', 'Student Meetings', 'Job Meetings', 'Internship Meetings'];
    const seenMeetings = new Map<string, Set<string>>();

    emails.forEach(email => {
      if (meetingCategories.includes(email.category) && email.extractedData.times.length > 0) {
        email.extractedData.times.forEach(time => {
          const normalizedTime = this.normalizeTime(time);
          const titleKey = email.subject.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 30);
          
          if (!seenMeetings.has(normalizedTime)) {
            seenMeetings.set(normalizedTime, new Set());
          }
          
          if (!seenMeetings.get(normalizedTime)!.has(titleKey)) {
            seenMeetings.get(normalizedTime)!.add(titleKey);
            events.push({
              time: normalizedTime,
              title: email.subject.substring(0, 50),
              emailId: email.id,
              rawTime: time
            });
          }
        });
      }
    });

    return events.sort((a, b) => this.compareTime(a.time, b.time));
  }

  detectConflicts(events: MeetingEvent[]): TimelineConflict[] {
    const timeMap = new Map<string, string[]>();
    
    events.forEach(event => {
      const normalized = event.time;
      if (!timeMap.has(normalized)) {
        timeMap.set(normalized, []);
      }
      timeMap.get(normalized)!.push(event.title);
    });

    const conflicts: TimelineConflict[] = [];
    timeMap.forEach((meetings, time) => {
      if (meetings.length > 1) {
        conflicts.push({ time, meetings });
      }
    });

    return conflicts;
  }

  private normalizeTime(time: string): string {
    const match = time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return time;

    let hour = parseInt(match[1]);
    const minute = match[2];
    const period = match[3].toUpperCase();

    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;

    return `${hour.toString().padStart(2, '0')}:${minute}`;
  }

  private compareTime(a: string, b: string): number {
    const [aHour, aMin] = a.split(':').map(Number);
    const [bHour, bMin] = b.split(':').map(Number);
    return (aHour * 60 + aMin) - (bHour * 60 + bMin);
  }

  formatTime(time: string): string {
    const [hour, minute] = time.split(':').map(Number);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${period}`;
  }
}
