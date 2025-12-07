import axios from 'axios';
import { CALENDAR_API_BASE } from '../../constants';
import type { ProcessedEmail } from '../../types/email';

export class CalendarService {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async addToCalendar(email: ProcessedEmail): Promise<void> {
    const event = this.createEventFromEmail(email);
    
    await axios.post(
      `${CALENDAR_API_BASE}/calendars/primary/events`,
      event,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
  }

  private createEventFromEmail(email: ProcessedEmail) {
    const meetingUrl = email.extractedData.urls.find(url => 
      url.includes('meet.google.com') || url.includes('zoom.us') || url.includes('teams.microsoft.com')
    );

    const startTime = this.parseDateTime(email);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

    return {
      summary: email.subject,
      description: `${email.plainText.substring(0, 500)}\n\n${meetingUrl ? `Join: ${meetingUrl}` : ''}`,
      start: { dateTime: startTime.toISOString(), timeZone: 'UTC' },
      end: { dateTime: endTime.toISOString(), timeZone: 'UTC' },
      conferenceData: meetingUrl ? { entryPoints: [{ uri: meetingUrl, entryPointType: 'video' }] } : undefined,
    };
  }

  private parseDateTime(email: ProcessedEmail): Date {
    if (email.extractedData.times.length > 0) {
      const timeStr = email.extractedData.times[0];
      const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (match) {
        let hour = parseInt(match[1]);
        const minute = parseInt(match[2]);
        const period = match[3].toUpperCase();
        if (period === 'PM' && hour !== 12) hour += 12;
        if (period === 'AM' && hour === 12) hour = 0;
        
        const date = new Date();
        date.setHours(hour, minute, 0, 0);
        return date;
      }
    }
    return email.date;
  }
}

export function createCalendarService(accessToken: string): CalendarService {
  return new CalendarService(accessToken);
}
