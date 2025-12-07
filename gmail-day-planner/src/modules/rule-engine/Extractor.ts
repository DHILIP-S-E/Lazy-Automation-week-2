import type { ExtractedData } from '../../types/email';
import type { Extractor as IExtractor } from '../../types/modules';
import { REGEX_PATTERNS } from '../../constants';

export class Extractor implements IExtractor {
  // Memoized regex patterns for performance
  private readonly amountRegex = new RegExp(REGEX_PATTERNS.amount.source, 'g');
  private readonly dueDateRegex = new RegExp(REGEX_PATTERNS.dueDate.source, 'g');
  private readonly urlRegex = new RegExp(REGEX_PATTERNS.url.source, 'g');
  private readonly timeRegex = new RegExp(REGEX_PATTERNS.time.source, 'gi');
  private readonly otpRegex = new RegExp(REGEX_PATTERNS.otp.source, 'g');

  extractAmount(text: string): string[] {
    if (!text) return [];
    const matches = text.match(this.amountRegex);
    return matches || [];
  }

  extractDueDate(text: string): Date[] {
    if (!text) return [];
    const matches = text.match(this.dueDateRegex);
    if (!matches) return [];

    return matches
      .map((dateStr) => this.parseDate(dateStr))
      .filter((date): date is Date => date !== null);
  }

  extractUrls(text: string): string[] {
    if (!text) return [];
    const matches = text.match(this.urlRegex);
    return matches || [];
  }

  extractTime(text: string): string[] {
    if (!text) return [];
    const matches = text.match(this.timeRegex);
    return matches || [];
  }

  extractOtp(text: string): string[] {
    if (!text) return [];
    const matches = text.match(this.otpRegex);
    return matches || [];
  }

  extractAll(text: string): ExtractedData {
    return {
      amounts: this.extractAmount(text),
      dueDates: this.extractDueDate(text),
      urls: this.extractUrls(text),
      times: this.extractTime(text),
      otpCodes: this.extractOtp(text),
    };
  }


  private parseDate(dateStr: string): Date | null {
    try {
      // Handle DD/MM/YYYY or DD-MM-YYYY formats
      const parts = dateStr.split(/[/-]/);
      if (parts.length !== 3) return null;

      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // JS months are 0-indexed
      const year = parseInt(parts[2], 10);

      if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
      if (day < 1 || day > 31) return null;
      if (month < 0 || month > 11) return null;
      if (year < 1900 || year > 2100) return null;

      const date = new Date(year, month, day);
      
      // Validate the date is real (e.g., not Feb 30)
      if (date.getDate() !== day || date.getMonth() !== month || date.getFullYear() !== year) {
        return null;
      }

      return date;
    } catch {
      return null;
    }
  }
}

export function createExtractor(): Extractor {
  return new Extractor();
}
