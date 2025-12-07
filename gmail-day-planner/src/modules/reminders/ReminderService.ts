import type { ProcessedEmail } from '../../types/email';

export interface Reminder {
  id: string;
  emailId: string;
  emailSubject: string;
  emailFrom: string;
  emailDetails: string;
  recipientEmail: string;
  scheduledTime: Date;
  sent: boolean;
}

export class ReminderService {
  private storageKey = 'automail_reminders';

  saveReminder(reminder: Reminder): void {
    const reminders = this.getReminders();
    reminders.push(reminder);
    localStorage.setItem(this.storageKey, JSON.stringify(reminders));
  }

  getReminders(): Reminder[] {
    const data = localStorage.getItem(this.storageKey);
    if (!data) return [];
    return JSON.parse(data).map((r: any) => ({
      ...r,
      scheduledTime: new Date(r.scheduledTime),
    }));
  }

  getPendingReminders(): Reminder[] {
    return this.getReminders().filter(r => !r.sent && new Date(r.scheduledTime) <= new Date());
  }

  markAsSent(reminderId: string): void {
    const reminders = this.getReminders();
    const updated = reminders.map(r => r.id === reminderId ? { ...r, sent: true } : r);
    localStorage.setItem(this.storageKey, JSON.stringify(updated));
  }

  deleteReminder(reminderId: string): void {
    const reminders = this.getReminders().filter(r => r.id !== reminderId);
    localStorage.setItem(this.storageKey, JSON.stringify(reminders));
  }
}

export function createReminderService(): ReminderService {
  return new ReminderService();
}
