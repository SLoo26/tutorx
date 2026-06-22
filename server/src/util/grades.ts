// O-level style grades from best to worst.
const ORDER = ['A1', 'A2', 'B3', 'B4', 'C5', 'C6', 'D7', 'E8', 'F9'];

/** Lower = better. Unknown grades sort last. */
export function gradeRank(grade?: string | null): number {
  if (!grade) return ORDER.length;
  const g = grade.toUpperCase().trim();
  const i = ORDER.indexOf(g);
  if (i >= 0) return i;
  const map: Record<string, number> = {
    DISTINCTION: 0, A: 0, MERIT: 2, B: 2, PASS: 4, C: 4,
  };
  return map[g] ?? ORDER.length;
}

/** 0..1 quality (A1 -> ~1, F9 -> ~0). */
export function gradeQuality(grade?: string | null): number {
  return Math.max(0, 1 - gradeRank(grade) / ORDER.length);
}
