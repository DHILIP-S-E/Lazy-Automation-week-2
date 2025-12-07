import type { ProcessedEmail } from '../../types/email';

export interface DeadlineItem {
  title: string;
  dueDate: Date;
  daysRemaining: number;
  status: 'overdue' | 'today' | 'tomorrow' | 'upcoming';
  emailId: string;
}

export class DeadlineCountdown {
  extractDeadlines(emails: ProcessedEmail[]): DeadlineItem[] {
    const deadlines: DeadlineItem[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    emails.forEach(email => {
      if (email.extractedData.dueDates.length > 0) {
        email.extractedData.dueDates.forEach(dueDate => {
          const deadline = new Date(dueDate);
          deadline.setHours(0, 0, 0, 0);
          
          const diffTime = deadline.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          let status: DeadlineItem['status'];
          if (diffDays < 0) status = 'overdue';
          else if (diffDays === 0) status = 'today';
          else if (diffDays === 1) status = 'tomorrow';
          else status = 'upcoming';

          deadlines.push({
            title: email.subject.substring(0, 40),
            dueDate: deadline,
            daysRemaining: diffDays,
            status,
            emailId: email.id
          });
        });
      }
    });

    return deadlines.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  }

  formatCountdown(item: DeadlineItem): string {
    if (item.status === 'overdue') {
      return `Overdue by ${Math.abs(item.daysRemaining)} day${Math.abs(item.daysRemaining) !== 1 ? 's' : ''}`;
    }
    if (item.status === 'today') return 'Due today';
    if (item.status === 'tomorrow') return 'Due in 1 day';
    return `Due in ${item.daysRemaining} days`;
  }
}
