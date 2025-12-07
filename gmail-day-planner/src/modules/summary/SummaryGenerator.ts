import type { ProcessedEmail, EmailSummary } from '../../types/email';
import type { SummaryGenerator as ISummaryGenerator } from '../../types/modules';
import { IMPORTANCE_SCORES } from '../../constants';

export class SummaryGenerator implements ISummaryGenerator {
  generate(emails: ProcessedEmail[]): EmailSummary {
    const bills: ProcessedEmail[] = [];
    const studentMeetings: ProcessedEmail[] = [];
    const jobMeetings: ProcessedEmail[] = [];
    const internshipMeetings: ProcessedEmail[] = [];
    const meetings: ProcessedEmail[] = [];
    const promotions: ProcessedEmail[] = [];
    const jobs: ProcessedEmail[] = [];
    const otp: ProcessedEmail[] = [];
    const attachments: ProcessedEmail[] = [];
    const important: ProcessedEmail[] = [];

    for (const email of emails) {
      switch (email.category) {
        case 'Bills': bills.push(email); break;
        case 'Student Meetings': studentMeetings.push(email); break;
        case 'Job Meetings': jobMeetings.push(email); break;
        case 'Internship Meetings': internshipMeetings.push(email); break;
        case 'Meetings': meetings.push(email); break;
        case 'Promotions': promotions.push(email); break;
        case 'Jobs': jobs.push(email); break;
        case 'OTP': otp.push(email); break;
        case 'Attachments': attachments.push(email); break;
      }
      if (email.importanceScore >= IMPORTANCE_SCORES.IMPORTANT_THRESHOLD) important.push(email);
    }

    const sort = (a: ProcessedEmail, b: ProcessedEmail) => b.importanceScore - a.importanceScore;
    [bills, studentMeetings, jobMeetings, internshipMeetings, meetings, promotions, jobs, otp, attachments, important].forEach(arr => arr.sort(sort));

    return { bills, studentMeetings, jobMeetings, internshipMeetings, meetings, promotions, jobs, otp, attachments, important, generatedAt: new Date() };
  }
}

export function createSummaryGenerator(): SummaryGenerator {
  return new SummaryGenerator();
}
