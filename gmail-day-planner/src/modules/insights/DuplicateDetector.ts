import type { ProcessedEmail } from '../../types/email';

export class DuplicateDetector {
  detectDuplicates(emails: ProcessedEmail[]): { unique: ProcessedEmail[]; duplicates: ProcessedEmail[] } {
    const seen = new Map<string, ProcessedEmail>();
    const duplicates: ProcessedEmail[] = [];

    emails.forEach(email => {
      const key = this.generateKey(email);
      if (seen.has(key)) {
        duplicates.push(email);
      } else {
        seen.set(key, email);
      }
    });

    return { unique: Array.from(seen.values()), duplicates };
  }

  private generateKey(email: ProcessedEmail): string {
    const subject = email.subject.toLowerCase().replace(/re:|fwd:/gi, '').trim();
    const from = email.from.toLowerCase();
    return `${from}:${subject.substring(0, 50)}`;
  }
}
