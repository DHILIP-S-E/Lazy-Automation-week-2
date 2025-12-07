import type { ProcessedEmail } from '../../types/email';
import type { Scorer as IScorer } from '../../types/modules';

const IMPORTANT_KEYWORDS = ['urgent', 'important', 'action required', 'reminder', 'final notice', 'deadline'];

export class Scorer implements IScorer {
  calculateScore(email: ProcessedEmail): number {
    let score = 0;

    // A. Bills (0-30 points)
    if (email.category === 'Bills') {
      if (this.isDueToday(email.extractedData.dueDates)) score += 15;
      else if (this.isDueTomorrow(email.extractedData.dueDates)) score += 10;
      else if (this.isDueSoon(email.extractedData.dueDates, 3)) score += 5;
      else score += 1;
    }

    // B. Jobs (0-20 points)
    if (email.category === 'Jobs') {
      if (this.isDueToday(email.extractedData.dueDates)) score += 12;
      else if (this.isDueSoon(email.extractedData.dueDates, 3)) score += 8;
      else score += 2;
    }

    // C. Meetings (0-20 points)
    if (email.category === 'Meetings' || email.category === 'Student Meetings' || email.category === 'Job Meetings' || email.category === 'Internship Meetings') {
      if (this.isMeetingIn3Hours(email.extractedData.times)) score += 10;
      else if (this.hasTimeToday(email.extractedData.times)) score += 6;
      else score += 2;
    }

    // D. Attachments (0-10 points)
    if (email.attachments && email.attachments.length > 0) {
      const text = `${email.subject} ${email.plainText}`.toLowerCase();
      if (IMPORTANT_KEYWORDS.some(kw => text.includes(kw))) score += 6;
      else score += 3;
      if (email.attachments.length > 1) score += 2;
    }

    // E. Important Keywords (0-15 points)
    const text = `${email.subject} ${email.plainText}`.toLowerCase();
    const keywordCount = IMPORTANT_KEYWORDS.filter(kw => text.includes(kw)).length;
    score += Math.min(keywordCount * 3, 15);

    return Math.min(score, 100);
  }

  private isDueToday(dates: Date[]): boolean {
    if (!dates || dates.length === 0) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dates.some(date => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    });
  }

  private isDueTomorrow(dates: Date[]): boolean {
    if (!dates || dates.length === 0) return false;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return dates.some(date => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === tomorrow.getTime();
    });
  }

  isDueSoon(dates: Date[], daysThreshold: number): boolean {
    if (!dates || dates.length === 0) return false;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const thresholdDate = new Date();
    thresholdDate.setDate(now.getDate() + daysThreshold);
    thresholdDate.setHours(23, 59, 59, 999);
    return dates.some(date => {
      const d = new Date(date);
      return d >= now && d <= thresholdDate;
    });
  }

  isToday(date: Date): boolean {
    const today = new Date();
    const d = new Date(date);
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  }

  hasTimeToday(times: string[]): boolean {
    return times && times.length > 0;
  }

  private isMeetingIn3Hours(times: string[]): boolean {
    if (!times || times.length === 0) return false;
    const now = new Date();
    const in3Hours = new Date(now.getTime() + 3 * 60 * 60 * 1000);
    
    return times.some(time => {
      const meetingTime = this.parseTime(time);
      if (!meetingTime) return false;
      return meetingTime >= now && meetingTime <= in3Hours;
    });
  }

  private parseTime(timeStr: string): Date | null {
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return null;
    
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

export function createScorer(): Scorer {
  return new Scorer();
}
