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
    /apply (?:before|by) (.*?)(?:\.|$)/i,
    /registration closes (?:on )?(.*?)(?:\.|$)/i,
    /last date[:\s]+(.*?)(?:\.|$)/i,
    /(?:must|should) (?:be )?(?:completed|submitted|done) (?:before|by) (.*?)(?:\.|$)/i,
    /(?:payment|bill) due[:\s]+(.*?)(?:\.|$)/i,
  ];

  extractTasks(emails: ProcessedEmail[]): ExtractedTask[] {
    const tasks: ExtractedTask[] = [];

    emails.forEach(email => {
      const text = `${email.subject} ${email.plainText}`;
      
      // Extract from patterns
      this.taskPatterns.forEach(pattern => {
        const matches = text.matchAll(new RegExp(pattern.source, 'gi'));
        for (const match of matches) {
          const taskText = match[1]?.trim();
          if (taskText && taskText.length > 5 && taskText.length < 100) {
            tasks.push({
              task: taskText,
              deadline: this.extractDeadlineFromTask(taskText) || (email.extractedData.dueDates[0] ? new Date(email.extractedData.dueDates[0]).toLocaleDateString() : undefined),
              emailId: email.id,
              subject: email.subject.substring(0, 30)
            });
          }
        }
      });

      // Also add emails with due dates as tasks
      if (email.extractedData.dueDates.length > 0 && (email.category === 'Bills' || email.category === 'Jobs' || email.category.includes('Meetings'))) {
        tasks.push({
          task: email.subject.substring(0, 60),
          deadline: new Date(email.extractedData.dueDates[0]).toLocaleDateString(),
          emailId: email.id,
          subject: email.subject.substring(0, 30)
        });
      }
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
