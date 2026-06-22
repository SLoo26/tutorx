/** Fixed greetings a user can open a chat with (no free text before confirmation). */
export const GREETINGS = ['Hi!', 'Hello 👋', 'Hi, thanks for the match!'];

/** The only questions a parent may ask before confirming a tutor. */
export const PRESET_QUESTIONS = [
  { key: 'start', text: 'When can you start?' },
  { key: 'rate', text: 'What is your rate for this subject?' },
  { key: 'combined', text: 'Can you teach both subjects (combined)?' },
  { key: 'mode', text: 'Do you teach in-person, online, or both?' },
] as const;

export const PRESET_QUESTION_KEYS = PRESET_QUESTIONS.map((q) => q.key);

/** Seed answers a new tutor gets; they can edit these in their profile. */
export const DEFAULT_PRESET_ANSWERS: Record<string, string> = {
  start: 'I can usually start within 1–2 weeks.',
  rate: 'My rate is within the range shown on my profile.',
  combined: 'Yes, I can cover both subjects in a combined session.',
  mode: 'I teach in-person and can also do online lessons.',
};
