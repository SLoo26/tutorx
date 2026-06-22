import { Day, Region } from '../types';
import { gradeQuality } from '../util/grades';
import { regionRelation } from '../util/regions';

/**
 * TutorX matching engine.
 *
 * This is deliberately a transparent, weighted rule-based scorer rather than a
 * black box: every match ships with a breakdown so a parent can see exactly why
 * a tutor ranked where they did (same region, within budget, free at the right
 * time, strong grade...). The deck is then ordered by `score` descending, which
 * is the "priority order, not random" behaviour the product is built around.
 *
 * Weights (out of 100):
 *   subject + level fit ... 30   (also the hard eligibility gate)
 *   budget fit ........... 25
 *   location ............. 20
 *   availability ......... 15
 *   grade quality ......... 5
 *   experience ............ 5
 */

export interface RequestInput {
  subject: string;
  second_subject?: string | null;
  student_level: string;
  region: Region;
  budget_per_hour: number;
  preferred_day?: Day | null;
  preferred_time?: string | null; // 'HH:MM:SS'
}

export interface CandidateSubject {
  subject: string;
  level: string;
  grade?: string | null;
  is_verified: boolean;
}

export interface CandidateSlot {
  day_of_week: Day;
  start_time: string; // 'HH:MM:SS'
  end_time: string;
}

export interface TutorCandidate {
  tutor_id: number;
  region: Region | null;
  rate_min: number;
  rate_max: number;
  years_experience: number;
  is_verified: boolean;
  subjects: CandidateSubject[];
  availability: CandidateSlot[];
}

export interface ScoreLine {
  key: string;
  label: string;
  points: number;
  max: number;
  note: string;
}

export interface MatchResult {
  tutor_id: number;
  score: number;
  eligible: boolean;
  breakdown: ScoreLine[];
}

const WEIGHTS = { subject: 30, budget: 25, location: 20, availability: 15, grade: 5, experience: 5 };

/** Collapse a free-form level into a coarse teaching band. */
export function levelBand(level: string): string {
  const l = level.toLowerCase();
  if (l.includes('primary') || /\bp[1-6]\b/.test(l)) return 'primary';
  if (/\b(sec\s*[12]|secondary\s*[12])\b/.test(l)) return 'lower-sec';
  if (/\b(sec\s*[3-5]|secondary\s*[3-5])\b/.test(l)) return 'upper-sec';
  if (l.includes('jc') || l.includes('junior college') || /\bj[12]\b/.test(l) || l.includes('a level'))
    return 'jc';
  if (l.includes('poly') || l.includes('uni') || l.includes('ib')) return 'tertiary';
  return l.trim();
}

/** Loose subject equality: case-insensitive, and "math" matches "E-Math"/"A-Math". */
export function subjectMatches(want: string, have: string): boolean {
  const a = want.toLowerCase().trim();
  const b = have.toLowerCase().trim();
  if (a === b) return true;
  if (a.includes(b) || b.includes(a)) return true;
  const norm = (s: string) => s.replace(/[^a-z]/g, '');
  return norm(a).includes(norm(b)) || norm(b).includes(norm(a));
}

function bestSubjectMatch(req: RequestInput, tutor: TutorCandidate): CandidateSubject | null {
  const band = levelBand(req.student_level);
  const wanted = [req.subject, req.second_subject].filter(Boolean) as string[];
  let best: CandidateSubject | null = null;
  for (const s of tutor.subjects) {
    const sameBand = levelBand(s.level) === band;
    const subjHit = wanted.some((w) => subjectMatches(w, s.subject));
    if (!subjHit) continue;
    // Prefer verified + same-band matches.
    const rank = (cand: CandidateSubject) =>
      (cand.is_verified ? 2 : 0) + (levelBand(cand.level) === band ? 1 : 0);
    if (!best || rank(s) > rank(best)) best = s;
    if (sameBand && s.is_verified) return s; // perfect, stop early
  }
  return best;
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + (m || 0);
}

export function scoreCandidate(req: RequestInput, tutor: TutorCandidate): MatchResult {
  const breakdown: ScoreLine[] = [];
  const matched = bestSubjectMatch(req, tutor);

  // --- Eligibility gate: must be a verified tutor with a matching VERIFIED subject ---
  const eligible = Boolean(tutor.is_verified && matched && matched.is_verified);

  // Subject + level fit
  let subjectPts = 0;
  let subjectNote = 'No matching subject';
  if (matched) {
    const sameBand = levelBand(matched.level) === levelBand(req.student_level);
    subjectPts = WEIGHTS.subject * (sameBand ? 1 : 0.6) * (matched.is_verified ? 1 : 0.5);
    subjectNote = `${matched.subject} (${matched.level})${
      matched.is_verified ? ' ✓ verified' : ' — not yet verified'
    }`;
  }
  breakdown.push({ key: 'subject', label: 'Subject & level', points: round(subjectPts), max: WEIGHTS.subject, note: subjectNote });

  // Budget fit
  let budgetPts = 0;
  let budgetNote: string;
  const B = req.budget_per_hour;
  if (tutor.rate_min <= 0) {
    budgetPts = WEIGHTS.budget * 0.6;
    budgetNote = 'Rate not set';
  } else if (B >= tutor.rate_max) {
    budgetPts = WEIGHTS.budget;
    budgetNote = `Within budget ($${tutor.rate_min}-${tutor.rate_max}/h)`;
  } else if (B >= tutor.rate_min) {
    budgetPts = WEIGHTS.budget * 0.85;
    budgetNote = `Negotiable around budget ($${tutor.rate_min}-${tutor.rate_max}/h)`;
  } else {
    const over = tutor.rate_min - B;
    budgetPts = Math.max(0, WEIGHTS.budget - over * 1.5);
    budgetNote = `$${over}/h over budget (asks $${tutor.rate_min}+/h)`;
  }
  breakdown.push({ key: 'budget', label: 'Budget', points: round(budgetPts), max: WEIGHTS.budget, note: budgetNote });

  // Location
  const rel = regionRelation(req.region, tutor.region);
  const locPts = rel === 'same' ? WEIGHTS.location : rel === 'adjacent' ? WEIGHTS.location * 0.5 : WEIGHTS.location * 0.15;
  breakdown.push({
    key: 'location',
    label: 'Location',
    points: round(locPts),
    max: WEIGHTS.location,
    note: rel === 'same' ? 'Same region' : rel === 'adjacent' ? 'Neighbouring region' : 'Different region',
  });

  // Availability
  let availPts = WEIGHTS.availability * 0.6;
  let availNote = 'No specific time requested';
  if (req.preferred_day) {
    const slotsThatDay = tutor.availability.filter((s) => s.day_of_week === req.preferred_day);
    if (slotsThatDay.length === 0) {
      availPts = WEIGHTS.availability * 0.15;
      availNote = `Not free on ${req.preferred_day.toUpperCase()}`;
    } else if (req.preferred_time) {
      const t = timeToMinutes(req.preferred_time);
      const covers = slotsThatDay.some(
        (s) => timeToMinutes(s.start_time) <= t && t < timeToMinutes(s.end_time),
      );
      availPts = covers ? WEIGHTS.availability : WEIGHTS.availability * 0.5;
      availNote = covers
        ? `Free ${req.preferred_day.toUpperCase()} at ${req.preferred_time.slice(0, 5)}`
        : `Free on ${req.preferred_day.toUpperCase()}, different time`;
    } else {
      availPts = WEIGHTS.availability * 0.85;
      availNote = `Free on ${req.preferred_day.toUpperCase()}`;
    }
  }
  breakdown.push({ key: 'availability', label: 'Availability', points: round(availPts), max: WEIGHTS.availability, note: availNote });

  // Grade quality (of the matched subject)
  const gradePts = WEIGHTS.grade * gradeQuality(matched?.grade);
  breakdown.push({
    key: 'grade',
    label: 'Grade strength',
    points: round(gradePts),
    max: WEIGHTS.grade,
    note: matched?.grade ? `Scored ${matched.grade}` : 'Grade not stated',
  });

  // Experience (capped at 10 years)
  const expPts = WEIGHTS.experience * Math.min(1, tutor.years_experience / 10);
  breakdown.push({
    key: 'experience',
    label: 'Experience',
    points: round(expPts),
    max: WEIGHTS.experience,
    note: `${tutor.years_experience} yr${tutor.years_experience === 1 ? '' : 's'}`,
  });

  const score = round(breakdown.reduce((sum, line) => sum + line.points, 0));
  return { tutor_id: tutor.tutor_id, score, eligible, breakdown };
}

/** Score + sort all candidates, keeping only eligible ones, highest priority first. */
export function rankCandidates(req: RequestInput, candidates: TutorCandidate[]): MatchResult[] {
  return candidates
    .map((c) => scoreCandidate(req, c))
    .filter((r) => r.eligible)
    .sort((a, b) => b.score - a.score);
}

function round(n: number): number {
  return Math.round(n);
}
