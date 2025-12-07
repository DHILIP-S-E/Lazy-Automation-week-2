export interface Reminder {
  text: string;
  date?: Date;
  time?: string;
  urgency: 'today' | 'tomorrow' | 'upcoming' | 'past';
  source: string;
}

export class ReminderExtractor {
  private readonly datePatterns = [
    /\b(\d{1,2})[/-](\d{1,2})[/-](\d{4})\b/g,
    /\b(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{4})\b/gi,
    /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{1,2}),?\s+(\d{4})\b/gi,
  ];

  private readonly relativePatterns = [
    /\b(today|tonight)\b/gi,
    /\b(tomorrow)\b/gi,
    /\b(next\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday))\b/gi,
    /\bby\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi,
    /\bdue\s+(tomorrow|today)\b/gi,
  ];

  private readonly reminderPhrases = [
    /(?:pay|submit|attend|complete|finish|send|upload|apply|review|check)\s+([^.!?\n]{5,60})/gi,
    /(?:reminder|deadline|due date|action required)[:\s]+([^.!?\n]{5,60})/gi,
    /(?:don't forget|remember to)\s+([^.!?\n]{5,60})/gi,
  ];

  extractFromText(text: string, source: string = 'text'): Reminder[] {
    const reminders: Reminder[] = [];
    
    // Clean HTML tags and entities
    const cleanText = text
      .replace(/<[^>]*>/g, ' ')
      .replace(/&[a-z]+;/gi, ' ')
      .replace(/&#\d+;/g, ' ')
      .replace(/\s+/g, ' ');
    
    const lines = cleanText.split('\n');

    lines.forEach(line => {
      // Skip lines that are too short, too long, or look like junk
      const trimmed = line.trim();
      if (trimmed.length < 10 || trimmed.length > 200) return;
      if (/^[^a-zA-Z]*$/.test(trimmed)) return; // Skip lines with no letters
      if (/(href|src|http|www\.|mailto:|style=|class=)/i.test(trimmed)) return; // Skip HTML/URL junk
      if (/^(VISA|UPI|MasterCard|RuPay|Maestro|©|®|™)/i.test(trimmed)) return; // Skip payment/copyright text
      
      const dates = this.extractDates(line);
      const times = this.extractTimes(line);
      const phrases = this.extractPhrases(line);

      phrases.forEach(phrase => {
        if (this.isValidReminder(phrase)) {
          const date = dates[0];
          const time = times[0];
          const urgency = this.calculateUrgency(date, line);

          reminders.push({
            text: phrase,
            date,
            time,
            urgency,
            source
          });
        }
      });

      if (phrases.length === 0 && (dates.length > 0 || times.length > 0)) {
        const cleanLine = trimmed.substring(0, 80);
        if (this.isValidReminder(cleanLine)) {
          reminders.push({
            text: cleanLine,
            date: dates[0],
            time: times[0],
            urgency: this.calculateUrgency(dates[0], line),
            source
          });
        }
      }
    });

    return this.deduplicateReminders(reminders);
  }

  private isValidReminder(text: string): boolean {
    // Must have some meaningful words
    const words = text.split(/\s+/).filter(w => w.length > 2);
    if (words.length < 2) return false;
    
    // Skip if it's mostly symbols or numbers
    const alphaCount = (text.match(/[a-zA-Z]/g) || []).length;
    if (alphaCount < text.length * 0.4) return false;
    
    // Skip common junk patterns
    const junkPatterns = [
      /^(all applicable|personally identifiable|service-related|keep your searches)/i,
      /^(your profile|all refunds|to such rights)/i,
      /^(us via the email|you service-related)/i,
    ];
    
    return !junkPatterns.some(pattern => pattern.test(text));
  }

  private extractDates(text: string): Date[] {
    const dates: Date[] = [];

    this.datePatterns.forEach(pattern => {
      const matches = text.matchAll(new RegExp(pattern.source, pattern.flags));
      for (const match of matches) {
        const date = this.parseDate(match[0]);
        if (date) dates.push(date);
      }
    });

    this.relativePatterns.forEach(pattern => {
      const matches = text.matchAll(new RegExp(pattern.source, pattern.flags));
      for (const match of matches) {
        const date = this.parseRelativeDate(match[0]);
        if (date) dates.push(date);
      }
    });

    return dates;
  }

  private extractTimes(text: string): string[] {
    const timePattern = /\b(\d{1,2}):(\d{2})\s*(AM|PM)\b/gi;
    const matches = text.matchAll(timePattern);
    return Array.from(matches, m => m[0]);
  }

  private extractPhrases(text: string): string[] {
    const phrases: string[] = [];

    this.reminderPhrases.forEach(pattern => {
      const matches = text.matchAll(new RegExp(pattern.source, pattern.flags));
      for (const match of matches) {
        const phrase = match[1]?.trim();
        if (phrase && phrase.length > 10 && phrase.length < 150) {
          phrases.push(phrase);
        }
      }
    });

    if (phrases.length === 0 && (text.includes('due') || text.includes('deadline') || text.includes('submit'))) {
      const cleaned = text.replace(/^(re:|fwd:)/gi, '').trim();
      if (cleaned.length > 10 && cleaned.length < 150) {
        phrases.push(cleaned);
      }
    }

    return phrases;
  }

  private parseDate(dateStr: string): Date | null {
    const ddmmyyyy = dateStr.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
    if (ddmmyyyy) {
      const day = parseInt(ddmmyyyy[1]);
      const month = parseInt(ddmmyyyy[2]) - 1;
      const year = parseInt(ddmmyyyy[3]);
      return new Date(year, month, day);
    }

    const monthNames: Record<string, number> = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
    };

    const ddMonthYyyy = dateStr.match(/(\d{1,2})\s+([a-z]+)\s+(\d{4})/i);
    if (ddMonthYyyy) {
      const day = parseInt(ddMonthYyyy[1]);
      const month = monthNames[ddMonthYyyy[2].toLowerCase().substring(0, 3)];
      const year = parseInt(ddMonthYyyy[3]);
      if (month !== undefined) return new Date(year, month, day);
    }

    const monthDdYyyy = dateStr.match(/([a-z]+)\s+(\d{1,2}),?\s+(\d{4})/i);
    if (monthDdYyyy) {
      const month = monthNames[monthDdYyyy[1].toLowerCase().substring(0, 3)];
      const day = parseInt(monthDdYyyy[2]);
      const year = parseInt(monthDdYyyy[3]);
      if (month !== undefined) return new Date(year, month, day);
    }

    return null;
  }

  private parseRelativeDate(text: string): Date | null {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (/today|tonight/i.test(text)) return today;

    if (/tomorrow/i.test(text)) {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    }

    const dayMatch = text.match(/(?:next|by)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);
    if (dayMatch) {
      const targetDay = dayMatch[1].toLowerCase();
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const targetIndex = days.indexOf(targetDay);
      const currentDay = today.getDay();
      let daysToAdd = targetIndex - currentDay;
      if (daysToAdd <= 0) daysToAdd += 7;
      const result = new Date(today);
      result.setDate(result.getDate() + daysToAdd);
      return result;
    }

    return null;
  }

  private calculateUrgency(date: Date | undefined, text: string): Reminder['urgency'] {
    if (!date) {
      if (/today|urgent|asap/i.test(text)) return 'today';
      if (/tomorrow/i.test(text)) return 'tomorrow';
      return 'upcoming';
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);

    if (dateOnly < today) return 'past';
    if (dateOnly.getTime() === today.getTime()) return 'today';
    if (dateOnly.getTime() === tomorrow.getTime()) return 'tomorrow';
    return 'upcoming';
  }

  private deduplicateReminders(reminders: Reminder[]): Reminder[] {
    const seen = new Set<string>();
    return reminders.filter(reminder => {
      const key = reminder.text.toLowerCase().substring(0, 30);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}
