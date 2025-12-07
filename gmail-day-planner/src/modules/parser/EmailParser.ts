import type { GmailMessage, MessagePayload, MessagePart, ParsedEmail, Attachment } from '../../types/email';
import type { EmailParser as IEmailParser } from '../../types/modules';

export class EmailParser implements IEmailParser {
  parse(gmailMessage: GmailMessage): ParsedEmail {
    const headers = this.extractHeaders(gmailMessage.payload);
    const plainText = this.extractPlainText(gmailMessage.payload);
    const htmlText = this.extractHtmlText(gmailMessage.payload);
    const attachments = this.extractAttachments(gmailMessage.payload);

    // Use snippet as fallback if no body content
    const bodyText = plainText || this.stripHtmlTags(htmlText) || gmailMessage.snippet || '';

    return {
      id: gmailMessage.id,
      subject: headers.subject,
      from: headers.from,
      to: headers.to,
      date: this.parseDate(headers.date, gmailMessage.internalDate),
      snippet: gmailMessage.snippet,
      plainText: bodyText,
      htmlText: htmlText,
      attachments: attachments,
    };
  }

  private extractHeaders(payload: MessagePayload): { subject: string; from: string; to: string; date: string } {
    const headers = payload.headers || [];
    const getHeader = (name: string): string => {
      const header = headers.find((h) => h.name.toLowerCase() === name.toLowerCase());
      return header?.value || '';
    };

    return {
      subject: getHeader('Subject'),
      from: getHeader('From'),
      to: getHeader('To'),
      date: getHeader('Date'),
    };
  }

  extractPlainText(payload: MessagePayload): string {
    // Check direct body
    if (payload.body?.data) {
      const mimeType = this.getMimeType(payload);
      if (mimeType === 'text/plain') {
        return this.decodeBase64(payload.body.data);
      }
    }

    // Check parts recursively
    if (payload.parts) {
      return this.findTextInParts(payload.parts, 'text/plain');
    }

    return '';
  }


  extractHtmlText(payload: MessagePayload): string {
    // Check direct body
    if (payload.body?.data) {
      const mimeType = this.getMimeType(payload);
      if (mimeType === 'text/html') {
        return this.decodeBase64(payload.body.data);
      }
    }

    // Check parts recursively
    if (payload.parts) {
      return this.findTextInParts(payload.parts, 'text/html');
    }

    return '';
  }

  extractAttachments(payload: MessagePayload): Attachment[] {
    const attachments: Attachment[] = [];

    if (payload.parts) {
      this.findAttachmentsInParts(payload.parts, attachments);
    }

    return attachments;
  }

  private getMimeType(payload: MessagePayload | MessagePart): string {
    const headers = payload.headers || [];
    const contentType = headers.find((h) => h.name.toLowerCase() === 'content-type');
    if (contentType) {
      return contentType.value.split(';')[0].trim().toLowerCase();
    }
    return '';
  }

  private findTextInParts(parts: MessagePart[], mimeType: string): string {
    for (const part of parts) {
      if (part.mimeType === mimeType && part.body?.data) {
        return this.decodeBase64(part.body.data);
      }

      if (part.parts) {
        const found = this.findTextInParts(part.parts, mimeType);
        if (found) return found;
      }
    }
    return '';
  }

  private findAttachmentsInParts(parts: MessagePart[], attachments: Attachment[]): void {
    for (const part of parts) {
      if (part.filename && part.filename.length > 0) {
        attachments.push({
          filename: part.filename,
          mimeType: part.mimeType,
          size: part.body?.size || 0,
        });
      }

      if (part.parts) {
        this.findAttachmentsInParts(part.parts, attachments);
      }
    }
  }

  private decodeBase64(data: string): string {
    try {
      // Gmail uses URL-safe base64 encoding
      const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
      return decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
    } catch {
      return '';
    }
  }

  private stripHtmlTags(html: string): string {
    if (!html) return '';
    
    // Remove script and style tags with content
    let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    
    // Remove HTML tags
    text = text.replace(/<[^>]+>/g, ' ');
    
    // Decode HTML entities
    text = text.replace(/&nbsp;/g, ' ');
    text = text.replace(/&amp;/g, '&');
    text = text.replace(/&lt;/g, '<');
    text = text.replace(/&gt;/g, '>');
    text = text.replace(/&quot;/g, '"');
    
    // Normalize whitespace
    text = text.replace(/\s+/g, ' ').trim();
    
    return text;
  }

  private parseDate(dateString: string, internalDate: string): Date {
    if (dateString) {
      const parsed = new Date(dateString);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    }

    // Fallback to internalDate (milliseconds since epoch)
    if (internalDate) {
      const timestamp = parseInt(internalDate, 10);
      if (!isNaN(timestamp)) {
        return new Date(timestamp);
      }
    }

    // Return current date as last resort
    return new Date();
  }
}

export function createEmailParser(): EmailParser {
  return new EmailParser();
}
