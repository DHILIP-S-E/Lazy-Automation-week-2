export const SecurityUtils = {
  validateEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email) && email.length <= 254;
  },

  sanitizeHTML(html: string): string {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  },

  escapeHTML(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;',
    };
    return text.replace(/[&<>"'/]/g, (char) => map[char]);
  },

  validateAccessToken(token: string | null): boolean {
    if (!token) return false;
    return token.length > 20 && /^[A-Za-z0-9._-]+$/.test(token);
  }
};
