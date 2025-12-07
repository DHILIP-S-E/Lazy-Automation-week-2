import type { ProcessedEmail } from '../../types/email';

export interface OTPEntry {
  service: string;
  code: string;
  timestamp: Date;
  emailId: string;
}

export class OTPCenter {
  extractOTPs(emails: ProcessedEmail[]): OTPEntry[] {
    const otps: OTPEntry[] = [];
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    emails.forEach(email => {
      if (email.category === 'OTP' && email.extractedData.otpCodes.length > 0) {
        if (email.date >= oneHourAgo) {
          const service = this.extractServiceName(email.from, email.subject);
          email.extractedData.otpCodes.forEach(code => {
            if (code.length >= 4 && code.length <= 8 && /^\d+$/.test(code)) {
              otps.push({
                service,
                code,
                timestamp: email.date,
                emailId: email.id
              });
            }
          });
        }
      }
    });

    return otps.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  private extractServiceName(from: string, _subject: string): string {
    const fromMatch = from.match(/^([^<@]+)/);
    if (fromMatch) {
      const name = fromMatch[1].trim();
      if (name.length > 0 && name.length < 30) return name;
    }

    const domainMatch = from.match(/@([^.>]+)/);
    if (domainMatch) {
      return domainMatch[1].charAt(0).toUpperCase() + domainMatch[1].slice(1);
    }

    return 'Unknown';
  }
}
