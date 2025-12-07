import type { ProcessedEmail } from '../../types/email';

export interface ExtractedTask {
  task: string;
  deadline?: string;
  emailId: string;
  subject: string;
}

export class TaskExtractor {
  private readonly taskPatterns = [
    /please submit (?:.*?)(?:before|by) (.*?)(?:\.|$)/i,
    /action required[:\s]+(.*?)(?:\.|$)/i,
    /respond by (.*?)(?:\.|$)/i,
    /complete (?:this )?task[:\s]+(.*?)(?:\.|$)/i,
    /upload (?:your )?document[:\s]+(.*?)(?:\.|$)/i,
    /(?:your )?assignment is due (.*?)(?:\.|$)/i,
    /deadline[:\s]+(.*?)(?:\.|$)/i,
    /due date[:\s]+(.*?)(?:\.|$)/i,
    /submit (?:.*?)(?:before|by) (.*?)(?:\.|$)/i,
  ];

  extractTasks(emails: ProcessedEmail[]): ExtractedTask[] {
    const tasks: ExtractedTask[] = [];

    emails.forEach(email => {
      const text = `${email.subject} ${email.plainText}`;
      
      this.taskPatterns.forEach(pattern => {
        const matches = text.matchAll(new RegExp(pattern.source, 'gi'));
        for (const match of matches) {
          const taskText = match[1]?.trim();
          if (taskText && taskText.length > 5 && taskText.length < 100) {
            tasks.push({
              task: taskText,
              deadline: this.extractDeadlineFromTask(taskText),
              emailId: email.id,
              subject: email.subject.substring(0, 30)
            });
          }
        }
      });
    });

    return this.deduplicateTasks(tasks);
  }

  private extractDeadlineFromTask(text: string): string | undefined {
    const dateMatch = text.match(/\d{1,2}[/-]\d{1,2}[/-]\d{4}/);
    if (dateMatch) return dateMatch[0];

    const todayMatch = text.match(/\btoday\b/i);
    if (todayMatch) return 'today';

    const tomorrowMatch = text.match(/\btomorrow\b/i);
    if (tomorrowMatch) return 'tomorrow';

    return undefined;
  }

  private deduplicateTasks(tasks: ExtractedTask[]): ExtractedTask[] {
    const seen = new Set<string>();
    return tasks.filter(task => {
      const key = task.task.toLowerCase().substring(0, 30);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}
