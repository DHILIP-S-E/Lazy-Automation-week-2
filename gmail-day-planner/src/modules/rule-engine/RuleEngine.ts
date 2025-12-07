import type { ParsedEmail, ProcessedEmail } from '../../types/email';
import type { RuleEngine as IRuleEngine } from '../../types/modules';
import { Classifier, createClassifier } from './Classifier';
import { Extractor, createExtractor } from './Extractor';
import { Scorer, createScorer } from './Scorer';

export class RuleEngine implements IRuleEngine {
  private classifier: Classifier;
  private extractor: Extractor;
  private scorer: Scorer;

  constructor(
    classifier?: Classifier,
    extractor?: Extractor,
    scorer?: Scorer
  ) {
    this.classifier = classifier || createClassifier();
    this.extractor = extractor || createExtractor();
    this.scorer = scorer || createScorer();
  }

  process(email: ParsedEmail): ProcessedEmail {
    // Step 1: Classify the email
    const category = this.classifier.classify(email);

    // Step 2: Extract data from email text
    const combinedText = `${email.subject} ${email.plainText} ${email.snippet}`;
    const extractedData = this.extractor.extractAll(combinedText);

    // Step 3: Create processed email (without score yet)
    const processedEmail: ProcessedEmail = {
      ...email,
      category,
      extractedData,
      importanceScore: 0,
    };

    // Step 4: Calculate importance score
    processedEmail.importanceScore = this.scorer.calculateScore(processedEmail);

    return processedEmail;
  }

  processBatch(emails: ParsedEmail[]): ProcessedEmail[] {
    return emails.map((email) => {
      try {
        return this.process(email);
      } catch {
        // On error, return email with default values
        return {
          ...email,
          category: 'Other' as const,
          extractedData: {
            amounts: [],
            dueDates: [],
            urls: [],
            times: [],
            otpCodes: [],
          },
          importanceScore: 3,
        };
      }
    });
  }
}

export function createRuleEngine(): RuleEngine {
  return new RuleEngine();
}
