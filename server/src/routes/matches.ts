import { Router } from 'express';
import { z } from 'zod';
import { config } from '../config';
import { execute, query } from '../db';
import { asyncHandler, HttpError } from '../middleware/error';
import { requireAuth } from '../middleware/auth';
import { parseBreakdown } from '../services/matchmaker';
import { buildTutorCards } from '../services/tutors';
import { scrubContact } from '../util/scrub';
import { GREETINGS, PRESET_QUESTION_KEYS } from '../constants';

const router = Router();
router.use(requireAuth);

interface MatchRow {
  id: number;
  request_id: number;
  tutor_id: number;
  parent_id: number;
  parent_decision: string;
  tutor_decision: string;
  status: string;
  score: number;
  score_breakdown: unknown;
  subject: string;
  budget_per_hour: number;
  lessons_per_week: number;
  hours_per_lesson: number;
}

/** Load a match joined to its request, plus who the participants are. */
async function loadMatch(matchId: number): Promise<MatchRow | null> {
  const [row] = await query<MatchRow>(
    `SELECT m.id, m.request_id, m.tutor_id, m.parent_decision, m.tutor_decision, m.status,
            m.score, m.score_breakdown,
            r.parent_id, r.subject, r.budget_per_hour, r.lessons_per_week, r.hours_per_lesson
     FROM matches m JOIN requests r ON r.id = m.request_id
     WHERE m.id = ?`,
    [matchId],
  );
  return row ?? null;
}

function roleInMatch(match: MatchRow, userId: number): 'parent' | 'tutor' | null {
  if (match.parent_id === userId) return 'parent';
  if (match.tutor_id === userId) return 'tutor';
  return null;
}

const swipeSchema = z.object({ decision: z.enum(['like', 'pass']) });

router.post(
  '/:id/swipe',
  asyncHandler(async (req, res) => {
    const match = await loadMatch(Number(req.params.id));
    if (!match) throw new HttpError(404, 'Match not found');
    const side = roleInMatch(match, req.user!.id);
    if (!side) throw new HttpError(403, 'Not your match');
    const { decision } = swipeSchema.parse(req.body);

    const parentDecision = side === 'parent' ? decision : match.parent_decision;
    const tutorDecision = side === 'tutor' ? decision : match.tutor_decision;

    let status = match.status;
    if (parentDecision === 'pass' || tutorDecision === 'pass') status = 'rejected';
    else if (parentDecision === 'like' && tutorDecision === 'like') status = 'chatting';

    await execute(
      `UPDATE matches SET parent_decision = :pd, tutor_decision = :td, status = :status WHERE id = :id`,
      { pd: parentDecision, td: tutorDecision, status, id: match.id },
    );
    res.json({ ok: true, status, chat_enabled: status === 'chatting' });
  }),
);

/** Parent presses "Want this tutor": create the job and reveal contacts. */
router.post(
  '/:id/confirm',
  asyncHandler(async (req, res) => {
    const match = await loadMatch(Number(req.params.id));
    if (!match) throw new HttpError(404, 'Match not found');
    if (roleInMatch(match, req.user!.id) !== 'parent') throw new HttpError(403, 'Only the parent can confirm');

    const [existing] = await query<any>('SELECT id FROM jobs WHERE match_id = ?', [match.id]);
    if (existing) throw new HttpError(409, 'This match is already confirmed');

    const [tutor] = await query<any>(
      'SELECT rate_min, rate_max FROM tutor_profiles WHERE user_id = ?',
      [match.tutor_id],
    );
    const rateMin = tutor?.rate_min || 0;
    const rateMax = tutor?.rate_max || match.budget_per_hour;
    let agreed = match.budget_per_hour;
    if (rateMin && agreed < rateMin) agreed = rateMin;
    if (rateMax && agreed > rateMax) agreed = rateMax;

    const firstMonthValue = Math.round(agreed * match.hours_per_lesson * match.lessons_per_week * 4);
    const platformFee = Math.round(firstMonthValue * config.platformFeeRate);
    const tutorPayout = firstMonthValue - platformFee;

    const result = await execute(
      `INSERT INTO jobs
         (match_id, request_id, parent_id, tutor_id, subject, hourly_rate,
          lessons_per_week, hours_per_lesson, first_month_value, platform_fee, tutor_payout)
       VALUES (:matchId, :requestId, :parentId, :tutorId, :subject, :rate,
          :lpw, :hpl, :value, :fee, :payout)`,
      {
        matchId: match.id,
        requestId: match.request_id,
        parentId: match.parent_id,
        tutorId: match.tutor_id,
        subject: match.subject,
        rate: agreed,
        lpw: match.lessons_per_week,
        hpl: match.hours_per_lesson,
        value: firstMonthValue,
        fee: platformFee,
        payout: tutorPayout,
      },
    );
    await execute(`UPDATE matches SET status = 'confirmed', parent_decision = 'like' WHERE id = ?`, [match.id]);
    await execute(`UPDATE requests SET status = 'matched' WHERE id = ?`, [match.request_id]);
    await execute(`INSERT INTO audit_log (actor_id, action, detail) VALUES (?, 'job_confirmed', ?)`, [
      req.user!.id,
      `match ${match.id} -> job ${result.insertId}`,
    ]);

    const contacts = await loadContacts(match.parent_id, match.tutor_id);
    res.status(201).json({
      job: { id: result.insertId, first_month_value: firstMonthValue, platform_fee: platformFee, tutor_payout: tutorPayout, hourly_rate: agreed },
      contacts,
    });
  }),
);

/** Match detail incl. tutor card; contacts revealed only once a job exists. */
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const match = await loadMatch(Number(req.params.id));
    if (!match) throw new HttpError(404, 'Match not found');
    const side = roleInMatch(match, req.user!.id);
    if (!side) throw new HttpError(403, 'Not your match');

    const cards = await buildTutorCards([match.tutor_id]);
    const [job] = await query<any>('SELECT * FROM jobs WHERE match_id = ?', [match.id]);
    const contacts = job ? await loadContacts(match.parent_id, match.tutor_id) : null;

    res.json({
      match: {
        match_id: match.id,
        request_id: match.request_id,
        status: match.status,
        score: match.score,
        score_breakdown: parseBreakdown(match.score_breakdown),
        parent_decision: match.parent_decision,
        tutor_decision: match.tutor_decision,
        chat_enabled:
          match.parent_decision === 'like' || match.status === 'chatting' || match.status === 'confirmed',
        your_side: side,
      },
      tutor: cards.get(match.tutor_id) ?? null,
      job: job ?? null,
      contacts,
    });
  }),
);

// ---- Chat ----
router.get(
  '/:id/messages',
  asyncHandler(async (req, res) => {
    const match = await loadMatch(Number(req.params.id));
    if (!match) throw new HttpError(404, 'Match not found');
    if (!roleInMatch(match, req.user!.id)) throw new HttpError(403, 'Not your match');
    const messages = await query('SELECT * FROM messages WHERE match_id = ? ORDER BY created_at ASC', [match.id]);
    res.json({ messages });
  }),
);

const messageSchema = z.object({
  message_type: z.enum(['greeting', 'preset_question', 'preset_answer', 'free']),
  body: z.string().min(1).max(500),
  question_key: z.string().max(40).optional(),
});

router.post(
  '/:id/messages',
  asyncHandler(async (req, res) => {
    const match = await loadMatch(Number(req.params.id));
    if (!match) throw new HttpError(404, 'Match not found');
    const side = roleInMatch(match, req.user!.id);
    if (!side) throw new HttpError(403, 'Not your match');

    const data = messageSchema.parse(req.body);
    const [job] = await query<any>('SELECT id FROM jobs WHERE match_id = ?', [match.id]);
    const confirmed = Boolean(job);

    const chatOpen =
      match.parent_decision === 'like' || match.status === 'chatting' || match.status === 'confirmed';
    if (!chatOpen) {
      throw new HttpError(403, 'Chat unlocks once the parent shows interest');
    }
    if (!confirmed && data.message_type === 'free') {
      throw new HttpError(403, 'Free chat unlocks after you confirm the tutor');
    }
    if (data.message_type === 'greeting' && !GREETINGS.includes(data.body)) {
      throw new HttpError(400, 'Pick one of the preset greetings');
    }
    if (data.message_type === 'preset_question' && !PRESET_QUESTION_KEYS.includes(data.question_key as any)) {
      throw new HttpError(400, 'Unknown preset question');
    }
    if (data.message_type === 'preset_answer' && side !== 'tutor') {
      throw new HttpError(403, 'Only the tutor can send a preset answer');
    }

    // Before confirmation, scrub any contact details as a safety net.
    let body = data.body;
    let redacted = false;
    if (!confirmed) {
      const scrubbed = scrubContact(body);
      body = scrubbed.clean;
      redacted = scrubbed.redacted;
    }

    const result = await execute(
      `INSERT INTO messages (match_id, sender_id, sender_role, message_type, body)
       VALUES (?, ?, ?, ?, ?)`,
      [match.id, req.user!.id, side, data.message_type, body],
    );
    res.status(201).json({ id: result.insertId, body, redacted, sender_role: side, message_type: data.message_type });
  }),
);

async function loadContacts(parentId: number, tutorId: number) {
  const rows = await query<any>(
    'SELECT id, role, name, email, phone, postal_code, region FROM users WHERE id IN (?, ?)',
    [parentId, tutorId],
  );
  const parent = rows.find((r) => r.id === parentId) ?? null;
  const tutor = rows.find((r) => r.id === tutorId) ?? null;
  return { parent, tutor };
}

export default router;
