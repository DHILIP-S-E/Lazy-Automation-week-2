import type { ProcessedEmail } from '../../types/email';

export interface StressAnalysis {
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  score: number;
  urgentTasks: number;
  meetingsToday: number;
  deadlinesToday: number;
  financialMails: number;
  message: string;
}

export class StressIndicator {
  analyze(emails: ProcessedEmail[]): StressAnalysis {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let urgentTasks = 0;
    let meetingsToday = 0;
    let deadlinesToday = 0;
    let financialMails = 0;

    emails.forEach(email => {
      if (email.importanceScore >= 8) urgentTasks++;
      
      if (email.category === 'Meetings' && email.extractedData.times.length > 0) {
        meetingsToday++;
      }

      if (email.extractedData.dueDates.length > 0) {
        email.extractedData.dueDates.forEach(date => {
          const dueDate = new Date(date);
          dueDate.setHours(0, 0, 0, 0);
          if (dueDate.getTime() === today.getTime()) deadlinesToday++;
        });
      }

      if (email.category === 'Bills') financialMails++;
    });

    // Calculate score with reasonable weights (max 100)
    const rawScore = (urgentTasks * 10) + (meetingsToday * 8) + (deadlinesToday * 15) + (financialMails * 3);
    const score = Math.min(rawScore, 100);

    let level: StressAnalysis['level'];
    let message: string;

    if (score >= 70) {
      level = 'CRITICAL';
      message = `You have ${urgentTasks} urgent tasks, ${meetingsToday} meetings, and ${deadlinesToday} deadlines today.`;
    } else if (score >= 45) {
      level = 'HIGH';
      message = `You have ${urgentTasks} urgent tasks and ${meetingsToday} meetings today.`;
    } else if (score >= 20) {
      level = 'MEDIUM';
      message = `Moderate workload with ${urgentTasks} important items.`;
    } else {
      level = 'LOW';
      message = 'Your inbox is under control today.';
    }

    return { level, score, urgentTasks, meetingsToday, deadlinesToday, financialMails, message };
  }
}
