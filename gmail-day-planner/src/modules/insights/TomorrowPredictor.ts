import type { ProcessedEmail } from '../../types/email';

export interface TomorrowEvent {
  type: 'meeting' | 'bill' | 'job' | 'task';
  title: string;
  time?: string;
  emailId: string;
}

export class TomorrowPredictor {
  predict(emails: ProcessedEmail[]): TomorrowEvent[] {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    const events: TomorrowEvent[] = [];

    emails.forEach(email => {
      if (email.category === 'Meetings') {
        events.push({
          type: 'meeting',
          title: email.subject.substring(0, 40),
          time: email.extractedData.times[0],
          emailId: email.id
        });
      }

      if (email.extractedData.dueDates.length > 0) {
        email.extractedData.dueDates.forEach(date => {
          const dueDate = new Date(date);
          dueDate.setHours(0, 0, 0, 0);
          
          if (dueDate.getTime() === tomorrow.getTime()) {
            const type = email.category === 'Bills' ? 'bill' : email.category === 'Jobs' ? 'job' : 'task';
            events.push({
              type,
              title: email.subject.substring(0, 40),
              emailId: email.id
            });
          }
        });
      }
    });

    return events.sort((a, b) => {
      if (a.time && !b.time) return -1;
      if (!a.time && b.time) return 1;
      return 0;
    });
  }
}
