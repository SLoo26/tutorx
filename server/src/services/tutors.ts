import { query } from '../db';
import { Day, Region } from '../types';
import { CandidateSlot, CandidateSubject, TutorCandidate } from '../matching/engine';

/** Show "Nurul B." not the full name until a job is confirmed. */
export function maskName(full: string): string {
  const parts = full.trim().split(/\s+/);
  const first = parts[0] ?? '';
  const lastInitial = parts.length > 1 ? `${parts[parts.length - 1][0].toUpperCase()}.` : '';
  return `${first} ${lastInitial}`.trim();
}

export interface TutorCard {
  tutor_id: number;
  display_name: string;
  initials: string;
  region: Region | null;
  headline: string | null;
  bio: string | null;
  highest_education: string;
  institution: string | null;
  years_experience: number;
  rate_min: number;
  rate_max: number;
  teaching_style: string | null;
  is_verified: boolean;
  subjects: CandidateSubject[];
  availability: CandidateSlot[];
  rating: { average: number; count: number };
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('');
}

/** Load every tutor as a scoring candidate for the matching engine. */
export async function loadCandidates(): Promise<TutorCandidate[]> {
  const profiles = await query<any>(
    `SELECT u.id AS tutor_id, u.region, p.rate_min, p.rate_max,
            p.years_experience, p.is_verified
     FROM users u
     JOIN tutor_profiles p ON p.user_id = u.id
     WHERE u.role = 'tutor'`,
  );
  if (profiles.length === 0) return [];
  const ids = profiles.map((p) => p.tutor_id);
  const { subjectsByTutor, slotsByTutor } = await loadSubjectsAndSlots(ids);

  return profiles.map((p) => ({
    tutor_id: p.tutor_id,
    region: p.region,
    rate_min: p.rate_min,
    rate_max: p.rate_max,
    years_experience: p.years_experience,
    is_verified: Boolean(p.is_verified),
    subjects: subjectsByTutor.get(p.tutor_id) ?? [],
    availability: slotsByTutor.get(p.tutor_id) ?? [],
  }));
}

/** Build masked, display-ready cards for a set of tutor ids. */
export async function buildTutorCards(ids: number[]): Promise<Map<number, TutorCard>> {
  const cards = new Map<number, TutorCard>();
  if (ids.length === 0) return cards;
  const placeholders = ids.map(() => '?').join(',');

  const rows = await query<any>(
    `SELECT u.id AS tutor_id, u.name, u.region, p.headline, p.bio, p.highest_education,
            p.institution, p.years_experience, p.rate_min, p.rate_max,
            p.teaching_style, p.is_verified
     FROM users u
     JOIN tutor_profiles p ON p.user_id = u.id
     WHERE u.id IN (${placeholders})`,
    ids,
  );
  const { subjectsByTutor, slotsByTutor } = await loadSubjectsAndSlots(ids);
  const ratings = await query<any>(
    `SELECT tutor_id, AVG(rating) AS average, COUNT(*) AS count
     FROM reviews WHERE tutor_id IN (${placeholders}) GROUP BY tutor_id`,
    ids,
  );
  const ratingByTutor = new Map<number, { average: number; count: number }>();
  for (const r of ratings) ratingByTutor.set(r.tutor_id, { average: Number(r.average), count: Number(r.count) });

  for (const row of rows) {
    cards.set(row.tutor_id, {
      tutor_id: row.tutor_id,
      display_name: maskName(row.name),
      initials: initialsOf(row.name),
      region: row.region,
      headline: row.headline,
      bio: row.bio,
      highest_education: row.highest_education,
      institution: row.institution,
      years_experience: row.years_experience,
      rate_min: row.rate_min,
      rate_max: row.rate_max,
      teaching_style: row.teaching_style,
      is_verified: Boolean(row.is_verified),
      subjects: subjectsByTutor.get(row.tutor_id) ?? [],
      availability: slotsByTutor.get(row.tutor_id) ?? [],
      rating: ratingByTutor.get(row.tutor_id) ?? { average: 0, count: 0 },
    });
  }
  return cards;
}

async function loadSubjectsAndSlots(ids: number[]) {
  const placeholders = ids.map(() => '?').join(',');
  const subjects = await query<any>(
    `SELECT tutor_id, subject, level, grade, is_verified
     FROM tutor_subjects WHERE tutor_id IN (${placeholders})`,
    ids,
  );
  const slots = await query<any>(
    `SELECT tutor_id, day_of_week, start_time, end_time
     FROM tutor_availability WHERE tutor_id IN (${placeholders})`,
    ids,
  );
  const subjectsByTutor = new Map<number, CandidateSubject[]>();
  for (const s of subjects) {
    const list = subjectsByTutor.get(s.tutor_id) ?? [];
    list.push({ subject: s.subject, level: s.level, grade: s.grade, is_verified: Boolean(s.is_verified) });
    subjectsByTutor.set(s.tutor_id, list);
  }
  const slotsByTutor = new Map<number, CandidateSlot[]>();
  for (const s of slots) {
    const list = slotsByTutor.get(s.tutor_id) ?? [];
    list.push({ day_of_week: s.day_of_week as Day, start_time: s.start_time, end_time: s.end_time });
    slotsByTutor.set(s.tutor_id, list);
  }
  return { subjectsByTutor, slotsByTutor };
}
