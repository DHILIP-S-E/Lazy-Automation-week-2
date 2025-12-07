import type { ParsedEmail, EmailCategory } from '../../types/email';
import type { Classifier as IClassifier } from '../../types/modules';
import { CATEGORY_KEYWORDS, REGEX_PATTERNS } from '../../constants';

export class Classifier implements IClassifier {
  classify(email: ParsedEmail): EmailCategory {
    const subject = email.subject.toLowerCase();
    const body = email.plainText.toLowerCase();
    const from = email.from.toLowerCase();

    if (this.isOTP(subject + ' ' + body)) return 'OTP';

    const scores: Record<string, number> = {
      Bills: 0, 'Student Meetings': 0, 'Internship Meetings': 0, 'Job Meetings': 0,
      Jobs: 0, Meetings: 0, Promotions: 0,
    };

    // Subject line has 3x weight
    Object.entries(CATEGORY_KEYWORDS).forEach(([category, keywords]) => {
      keywords.forEach(keyword => {
        const kw = keyword.toLowerCase();
        if (subject.includes(kw)) scores[category] = (scores[category] || 0) + 3;
        if (body.includes(kw)) scores[category] = (scores[category] || 0) + 1;
      });
    });

    // Sender domain analysis
    if (from.includes('billing') || from.includes('invoice') || from.includes('payment')) scores.Bills += 5;
    if (from.includes('noreply') || from.includes('marketing') || from.includes('promo')) scores.Promotions += 3;
    if (from.includes('edu') || from.includes('university') || from.includes('college')) scores['Student Meetings'] += 4;
    if (from.includes('recruit') || from.includes('careers') || from.includes('jobs')) scores.Jobs += 4;

    // Context boosting with exclusions
    if (subject.includes('shared') || subject.includes('invited you') || subject.includes('has shared') || from.includes('drive-shares-noreply')) {
      scores.Attachments += 8;
      scores.Promotions -= 10;
    }
    if (subject.includes('hiring') || subject.includes('job opening')) {
      scores.Jobs += 5;
      scores.Promotions -= 3;
    }
    if (subject.includes('intern')) {
      scores['Internship Meetings'] += 6;
      scores.Jobs -= 2;
    }
    if (subject.includes('interview')) {
      scores['Job Meetings'] += 6;
      scores.Jobs -= 1;
    }
    if (subject.includes('class') || subject.includes('course') || subject.includes('program')) {
      scores['Student Meetings'] += 5;
      scores.Promotions -= 3;
    }
    if (subject.includes('invoice') || subject.includes('bill') || subject.includes('payment due')) {
      scores.Bills += 6;
      scores.Promotions -= 4;
    }
    if (subject.includes('meet') || subject.includes('zoom') || subject.includes('join')) {
      scores.Meetings += 4;
    }
    if (subject.includes('discount') || subject.includes('sale') || subject.includes('%') || subject.includes('free')) {
      scores.Promotions += 4;
    }

    // Negative scoring for mismatches
    if (subject.includes('hiring') && scores.Bills > 0) scores.Bills -= 5;
    if (subject.includes('offer') && !subject.includes('job offer') && !subject.includes('shared')) scores.Promotions += 3;
    if (email.attachments.length > 0 && (subject.includes('shared') || subject.includes('document'))) {
      scores.Attachments += 5;
      scores.Promotions -= 5;
    }

    let maxScore = -999;
    let bestCategory: EmailCategory = 'Other';
    
    Object.entries(scores).forEach(([category, score]) => {
      if (score > maxScore) {
        maxScore = score;
        bestCategory = category as EmailCategory;
      }
    });

    if (maxScore > 0) return bestCategory;
    if (email.attachments && email.attachments.length > 0) return 'Attachments';
    return 'Other';
  }

  private getCombinedText(email: ParsedEmail): string {
    return `${email.subject} ${email.plainText} ${email.snippet}`;
  }

  private matchesKeywords(text: string, keywords: readonly string[]): boolean {
    return keywords.some((keyword) => text.includes(keyword.toLowerCase()));
  }

  private isOTP(text: string): boolean {
    // Check for "your code is" pattern
    if (text.includes('your code is')) {
      return true;
    }

    // Check for other OTP keywords
    if (CATEGORY_KEYWORDS.OTP.some((kw) => text.includes(kw.toLowerCase()))) {
      return true;
    }

    // Check for 6-digit code pattern
    const otpMatch = text.match(REGEX_PATTERNS.otp);
    return otpMatch !== null && otpMatch.length > 0;
  }
}

export function createClassifier(): Classifier {
  return new Classifier();
}
