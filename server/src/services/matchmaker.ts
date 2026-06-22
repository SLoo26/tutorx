import { execute, query } from '../db';
import { RequestInput, rankCandidates } from '../matching/engine';
import { loadCandidates } from './tutors';

const DECK_LIMIT = 30;

/**
 * (Re)generate the priority-ordered deck for a request: score every tutor,
 * keep the eligible ones, and upsert them into `matches`. Returns how many
 * matches were produced.
 */
export async function generateMatchesForRequest(requestId: number): Promise<number> {
  const [request] = await query<any>(`SELECT * FROM requests WHERE id = ?`, [requestId]);
  if (!request) return 0;

  const input: RequestInput = {
    subject: request.subject,
    second_subject: request.second_subject,
    student_level: request.student_level,
    region: request.region,
    budget_per_hour: request.budget_per_hour,
    preferred_day: request.preferred_day,
    preferred_time: request.preferred_time,
  };

  const candidates = await loadCandidates();
  const ranked = rankCandidates(input, candidates).slice(0, DECK_LIMIT);

  for (const result of ranked) {
    await execute(
      `INSERT INTO matches (request_id, tutor_id, score, score_breakdown)
       VALUES (:requestId, :tutorId, :score, :breakdown)
       ON DUPLICATE KEY UPDATE
         score = VALUES(score),
         score_breakdown = VALUES(score_breakdown)`,
      {
        requestId,
        tutorId: result.tutor_id,
        score: result.score,
        breakdown: JSON.stringify(result.breakdown),
      },
    );
  }
  return ranked.length;
}

/** Parse a JSON column that may come back as a string (MariaDB) or object (MySQL). */
export function parseBreakdown(value: unknown): unknown {
  if (!value) return [];
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  }
  return value;
}
