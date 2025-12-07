import type { ParsedEmail, EmailCategory } from '../../types/email';
import type { Classifier as IClassifier } from '../../types/modules';
import { CATEGORY_KEYWORDS, REGEX_PATTERNS } from '../../constants';

export class Classifier implements IClassifier {
  classify(email: ParsedEmail): EmailCategory {
    const subject = email.subject.toLowerCase();
    const body = email.plainText.toLowerCase().substring(0, 500);
    const from = email.from.toLowerCase();
    const text = subject + ' ' + body;

    if (this.isOTP(text, from)) return 'OTP';

    const scores: Record<string, number> = {
      Bills: 0, 'Student Meetings': 0, 'Internship Meetings': 0, 'Job Meetings': 0,
      Jobs: 0, Meetings: 0, Promotions: 0, Attachments: 0
    };

    Object.entries(CATEGORY_KEYWORDS).forEach(([category, keywords]) => {
      keywords.forEach(keyword => {
        const kw = keyword.toLowerCase();
        if (subject.includes(kw)) scores[category] = (scores[category] || 0) + 5;
        if (body.includes(kw)) scores[category] = (scores[category] || 0) + 2;
        if (from.includes(kw)) scores[category] = (scores[category] || 0) + 3;
      });
    });

    if (from.includes('billing') || from.includes('invoice') || from.includes('payment')) scores.Bills += 8;
    if (from.includes('noreply') && (body.includes('unsubscribe') || body.includes('promotional'))) scores.Promotions += 10;
    if (from.includes('marketing') || from.includes('promo') || from.includes('newsletter')) scores.Promotions += 8;
    if (from.includes('.edu') || from.includes('university') || from.includes('college')) scores['Student Meetings'] += 8;
    if (from.includes('recruit') || from.includes('careers') || from.includes('jobs')) scores.Jobs += 8;
    if (from.includes('deals') || from.includes('offers') || from.includes('shop')) scores.Promotions += 10;

    if (subject.includes('intern')) scores['Internship Meetings'] += 10;
    if (subject.includes('interview')) scores['Job Meetings'] += 10;
    if (subject.includes('invoice') || subject.includes('receipt') || subject.includes('payment')) scores.Bills += 8;
    if (subject.includes('meet') || subject.includes('zoom') || subject.includes('teams')) scores.Meetings += 8;
    if (subject.includes('discount') || subject.includes('sale') || subject.includes('%off') || subject.includes('deal')) scores.Promotions += 8;
    if (body.includes('unsubscribe') || body.includes('opt-out') || body.includes('manage preferences')) scores.Promotions += 6;
    if (subject.includes('shared') || subject.includes('invited you')) scores.Attachments += 10;

    let maxScore = 0;
    let bestCategory: EmailCategory = 'Other';
    
    Object.entries(scores).forEach(([category, score]) => {
      if (score > maxScore) {
        maxScore = score;
        bestCategory = category as EmailCategory;
      }
    });

    if (maxScore >= 5) return bestCategory;
    if (email.attachments && email.attachments.length > 0) return 'Attachments';
    return 'Other';
  }



  private isOTP(text: string, from: string): boolean {
    const excludeKeywords = ['summary', 'daily', 'weekly', 'report', 'digest', 'newsletter', 'update'];
    if (excludeKeywords.some(kw => text.includes(kw))) {
      return false;
    }

    const strongOtpKeywords = ['verification code', 'otp', 'one-time password', 'one time password', 
                               'security code', 'authentication code', 'login code', 'access code',
                               'verify your', 'confirm your account', 'verification pin'];
    
    if (strongOtpKeywords.some(kw => text.includes(kw))) {
      return true;
    }

    if (text.includes('your code is') || text.includes('code:') || text.includes('otp:') || 
        text.includes('pin:') || text.includes('verification:')) {
      return true;
    }

    if ((from.includes('noreply') || from.includes('no-reply')) && 
        (text.includes('code') || text.includes('verify')) && 
        REGEX_PATTERNS.otp.test(text)) {
      return true;
    }

    return false;
  }
}

export function createClassifier(): Classifier {
  return new Classifier();
}
