import sanitizeHtml from 'sanitize-html';

// Sanitize user-provided HTML email bodies. Removes script/style, javascript:
// URLs and event-handler attributes. Never executes user HTML on the server.
export function sanitizeEmailHtml(dirty: string): string {
  return sanitizeHtml(dirty, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      'h1', 'h2', 'h3', 'h4', 'img', 'pre', 'hr', 'table', 'thead', 'tbody',
      'tr', 'td', 'th', 'div', 'span', 'center',
    ]),
    allowedAttributes: {
      a: ['href', 'title', 'target', 'rel'],
      img: ['src', 'alt', 'width', 'height'],
      table: ['cellpadding', 'cellspacing', 'border', 'width'],
      td: ['colspan', 'rowspan', 'align', 'valign'],
      th: ['colspan', 'rowspan', 'align', 'valign'],
      '*': ['style', 'align', 'class'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowProtocolRelative: false,
    enforceHtmlBoundary: false,
  });
}

export function htmlToText(html: string): string {
  // Deterministic plain-text fallback: strip tags, decode common entities,
  // collapse whitespace. Good enough as fallback; explicit text template wins.
  let s = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h1|h2|h3|h4|li|tr|table)>/gi, '\n')
    .replace(/<[^>]*>/g, '');
  s = s
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ');
  return s.split('\n').map((l) => l.trimEnd()).join('\n').replace(/\n{3,}/g, '\n\n').trim();
}
