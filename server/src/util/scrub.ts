/**
 * Redact anything that looks like an off-platform contact handle or address.
 * Used on every chat message sent before a job is confirmed, so the two
 * sides cannot swap details and cut the platform out.
 */
const PATTERNS: { re: RegExp; label: string }[] = [
  { re: /(\+?65[\s-]?)?[689]\d{3}[\s-]?\d{4}/g, label: '[number hidden]' }, // SG mobile
  { re: /\b[\w.+-]+@[\w-]+\.[\w.-]+\b/g, label: '[email hidden]' },
  {
    re: /\b(t\.me|telegram|tele|whatsapp|wa\.me|wechat|signal|instagram|insta|ig|snapchat)\b[:\s@]*\S*/gi,
    label: '[contact hidden]',
  },
  { re: /@[A-Za-z0-9_]{3,}/g, label: '[handle hidden]' },
  { re: /\bpay\s?now\b/gi, label: '[payment hidden]' },
  { re: /\b(blk|block)\s*\d+/gi, label: '[address hidden]' },
  { re: /\bS?\(?\d{6}\)?\b/g, label: '[postal hidden]' }, // 6-digit postal / S123456
];

export function scrubContact(text: string): { clean: string; redacted: boolean } {
  let redacted = false;
  let clean = text;
  for (const { re, label } of PATTERNS) {
    re.lastIndex = 0;
    if (re.test(clean)) {
      redacted = true;
      re.lastIndex = 0;
      clean = clean.replace(re, label);
    }
  }
  return { clean, redacted };
}
