import { Router } from 'express';
import { z } from 'zod';
import { execute, query } from '../db';
import { asyncHandler, HttpError } from '../middleware/error';
import { requireAuth, requireRole } from '../middleware/auth';
import { generateMatchesForRequest, parseBreakdown } from '../services/matchmaker';
import { buildTutorCards } from '../services/tutors';

const router = Router();
router.use(requireAuth, requireRole('parent'));

const requestSchema = z.object({
  student_level: z.string().min(1).max(40),
  subject: z.string().min(1).max(80),
  second_subject: z.string().max(80).optional(),
  postal_code: z.string().min(1).max(10),
  region: z.enum(['north', 'south', 'east', 'west', 'central', 'north_east']),
  budget_per_hour: z.number().int().min(5).max(1000),
  preferred_day: z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']).optional(),
  preferred_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).optional(),
  lessons_per_week: z.number().int().min(1).max(7).default(1),
  hours_per_lesson: z.number().min(0.5).max(8).default(1.5),
  notes: z.string().max(2000).optional(),
});

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const data = requestSchema.parse(req.body);
    const result = await execute(
      `INSERT INTO requests
         (parent_id, student_level, subject, second_subject, postal_code, region,
          budget_per_hour, preferred_day, preferred_time, lessons_per_week, hours_per_lesson, notes)
       VALUES (:parent, :level, :subject, :second, :postal, :region,
          :budget, :day, :time, :lpw, :hpl, :notes)`,
      {
        parent: req.user!.id,
        level: data.student_level,
        subject: data.subject,
        second: data.second_subject ?? null,
        postal: data.postal_code,
        region: data.region,
        budget: data.budget_per_hour,
        day: data.preferred_day ?? null,
        time: data.preferred_time ?? null,
        lpw: data.lessons_per_week,
        hpl: data.hours_per_lesson,
        notes: data.notes ?? null,
      },
    );
    const requestId = result.insertId;
    const matchCount = await generateMatchesForRequest(requestId);
    res.status(201).json({ id: requestId, matchCount });
  }),
);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const rows = await query<any>(
      `SELECT r.*,
              (SELECT COUNT(*) FROM matches m WHERE m.request_id = r.id) AS match_count,
              (SELECT COUNT(*) FROM matches m WHERE m.request_id = r.id AND m.parent_decision = 'like') AS liked_count
       FROM requests r WHERE r.parent_id = ? ORDER BY r.created_at DESC`,
      [req.user!.id],
    );
    res.json({ requests: rows });
  }),
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const [request] = await query<any>('SELECT * FROM requests WHERE id = ? AND parent_id = ?', [
      Number(req.params.id),
      req.user!.id,
    ]);
    if (!request) throw new HttpError(404, 'Request not found');
    res.json({ request });
  }),
);

/** The swipe deck: priority-ordered matched tutors for a request. */
router.get(
  '/:id/matches',
  asyncHandler(async (req, res) => {
    const requestId = Number(req.params.id);
    const [request] = await query<any>('SELECT * FROM requests WHERE id = ? AND parent_id = ?', [
      requestId,
      req.user!.id,
    ]);
    if (!request) throw new HttpError(404, 'Request not found');

    const matchRows = await query<any>(
      `SELECT m.*, EXISTS(SELECT 1 FROM jobs j WHERE j.match_id = m.id) AS has_job
       FROM matches m WHERE m.request_id = ? ORDER BY m.score DESC`,
      [requestId],
    );
    const cards = await buildTutorCards(matchRows.map((m) => m.tutor_id));

    const matches = matchRows.map((m) => ({
      match_id: m.id,
      tutor_id: m.tutor_id,
      score: m.score,
      score_breakdown: parseBreakdown(m.score_breakdown),
      parent_decision: m.parent_decision,
      tutor_decision: m.tutor_decision,
      status: m.status,
      chat_enabled: m.parent_decision === 'like' || m.status === 'chatting' || m.status === 'confirmed',
      has_job: Boolean(m.has_job),
      tutor: cards.get(m.tutor_id) ?? null,
    }));
    res.json({ request, matches });
  }),
);

export default router;
