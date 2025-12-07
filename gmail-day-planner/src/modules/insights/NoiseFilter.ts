import type { ProcessedEmail } from '../../types/email';

export class NoiseFilter {
  private readonly noiseKeywords = [
    'unsubscribe', 'newsletter', 'promotion', 'deal', 'offer', 'discount',
    'sale', 'marketing', 'advertisement', 'subscribe now', 'limited time',
    'buy now', 'shop now', 'free shipping', 'coupon', 'promo code'
  ];

  filterNoise(emails: ProcessedEmail[]): { clean: ProcessedEmail[]; noise: ProcessedEmail[] } {
    const clean: ProcessedEmail[] = [];
    const noise: ProcessedEmail[] = [];

    emails.forEach(email => {
      if (this.isNoise(email)) {
        noise.push(email);
      } else {
        clean.push(email);
      }
    });

    return { clean, noise };
  }

  private isNoise(email: ProcessedEmail): boolean {
    const text = `${email.subject} ${email.plainText}`.toLowerCase();
    return this.noiseKeywords.some(keyword => text.includes(keyword));
  }
}
