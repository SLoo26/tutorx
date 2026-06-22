import fs from 'fs';
import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { config } from '../config';
import { execute, query } from '../db';
import { asyncHandler, HttpError } from '../middleware/error';
import { requireAuth, requireRole } from '../middleware/auth';
import { parseBreakdown } from '../services/matchmaker';

const router = Router();
router.use(requireAuth, requireRole('tutor'));

// --- File uploads for credentials ---
fs.mkdirSync(config.uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, config.uploadDir),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^\w.\-]/g, '_');
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}-${safe}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'].includes(file.mimetype);
    if (ok) cb(null, true);
    else cb(new HttpError(400, 'Only PDF, PNG or JPG files are allowed'));
  },
});

/** Full profile bundle for the logged-in tutor. */
router.get(
  '/profile',
  asyncHandler(async (req, res) => {
    const id = req.user!.id;
    const [profile] = await query<any>(
      `SELECT u.id, u.name, u.email, u.phone, u.postal_code, u.region,
              p.headline, p.bio, p.highest_education, p.institution, p.years_experience,
              p.rate_min, p.rate_max, p.teaching_style, p.is_verified
       FROM users u JOIN tutor_profiles p ON p.user_id = u.id WHERE u.id = ?`,
      [id],
    );
    const subjects = await query('SELECT * FROM tutor_subjects WHERE tutor_id = ?', [id]);
    const availability = await query('SELECT * FROM tutor_availability WHERE tutor_id = ?', [id]);
    const documents = await query('SELECT * FROM tutor_documents WHERE tutor_id = ? ORDER BY created_at DESC', [id]);
    const presetRows = await query<any>('SELECT question_key, answer FROM tutor_preset_answers WHERE tutor_id = ?', [id]);
    const presetAnswers: Record<string, string> = {};
    for (const r of presetRows) presetAnswers[r.question_key] = r.answer;
    res.json({ profile, subjects, availability, documents, presetAnswers });
  }),
);

const profileSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  phone: z.string().max(40).optional(),
  postal_code: z.string().max(10).optional(),
  region: z.enum(['north', 'south', 'east', 'west', 'central', 'north_east']).optional(),
  headline: z.string().max(160).optional(),
  bio: z.string().max(2000).optional(),
  highest_education: z.enum(['o_level', 'a_level', 'poly', 'undergraduate', 'graduate', 'postgraduate']).optional(),
  institution: z.string().max(160).optional(),
  years_experience: z.number().int().min(0).max(60).optional(),
  rate_min: z.number().int().min(0).max(1000).optional(),
  rate_max: z.number().int().min(0).max(1000).optional(),
  teaching_style: z.string().max(255).optional(),
});

router.put(
  '/profile',
  asyncHandler(async (req, res) => {
    const id = req.user!.id;
    const data = profileSchema.parse(req.body);
    if (data.name !== undefined || data.phone !== undefined || data.postal_code !== undefined || data.region !== undefined) {
      await execute(
        `UPDATE users SET name = COALESCE(:name, name), phone = COALESCE(:phone, phone),
                postal_code = COALESCE(:postal, postal_code), region = COALESCE(:region, region)
         WHERE id = :id`,
        { name: data.name ?? null, phone: data.phone ?? null, postal: data.postal_code ?? null, region: data.region ?? null, id },
      );
    }
    await execute(
      `UPDATE tutor_profiles SET
         headline = COALESCE(:headline, headline),
         bio = COALESCE(:bio, bio),
         highest_education = COALESCE(:edu, highest_education),
         institution = COALESCE(:institution, institution),
         years_experience = COALESCE(:years, years_experience),
         rate_min = COALESCE(:rateMin, rate_min),
         rate_max = COALESCE(:rateMax, rate_max),
         teaching_style = COALESCE(:style, teaching_style)
       WHERE user_id = :id`,
      {
        headline: data.headline ?? null,
        bio: data.bio ?? null,
        edu: data.highest_education ?? null,
        institution: data.institution ?? null,
        years: data.years_experience ?? null,
        rateMin: data.rate_min ?? null,
        rateMax: data.rate_max ?? null,
        style: data.teaching_style ?? null,
        id,
      },
    );
    res.json({ ok: true });
  }),
);

const subjectSchema = z.object({
  subject: z.string().min(1).max(80),
  level: z.string().min(1).max(40),
  grade: z.string().max(8).optional(),
});

router.post(
  '/subjects',
  asyncHandler(async (req, res) => {
    const data = subjectSchema.parse(req.body);
    const result = await execute(
      'INSERT INTO tutor_subjects (tutor_id, subject, level, grade) VALUES (?, ?, ?, ?)',
      [req.user!.id, data.subject, data.level, data.grade ?? null],
    );
    res.status(201).json({ id: result.insertId });
  }),
);

router.delete(
  '/subjects/:id',
  asyncHandler(async (req, res) => {
    await execute('DELETE FROM tutor_subjects WHERE id = ? AND tutor_id = ?', [Number(req.params.id), req.user!.id]);
    res.json({ ok: true });
  }),
);

const availabilitySchema = z.object({
  slots: z
    .array(
      z.object({
        day_of_week: z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']),
        start_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
        end_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
      }),
    )
    .max(40),
});

/** Replace the whole availability set in one call. */
router.put(
  '/availability',
  asyncHandler(async (req, res) => {
    const id = req.user!.id;
    const { slots } = availabilitySchema.parse(req.body);
    await execute('DELETE FROM tutor_availability WHERE tutor_id = ?', [id]);
    for (const s of slots) {
      await execute(
        'INSERT INTO tutor_availability (tutor_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?)',
        [id, s.day_of_week, s.start_time, s.end_time],
      );
    }
    res.json({ ok: true, count: slots.length });
  }),
);

const presetSchema = z.object({ answers: z.record(z.string(), z.string().max(280)) });

router.put(
  '/preset-answers',
  asyncHandler(async (req, res) => {
    const id = req.user!.id;
    const { answers } = presetSchema.parse(req.body);
    for (const [key, answer] of Object.entries(answers)) {
      await execute(
        `INSERT INTO tutor_preset_answers (tutor_id, question_key, answer) VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE answer = VALUES(answer)`,
        [id, key, answer],
      );
    }
    res.json({ ok: true });
  }),
);

router.post(
  '/documents',
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) throw new HttpError(400, 'No file uploaded');
    const docType = z
      .enum(['o_level_cert', 'a_level_cert', 'poly_cert', 'degree_cert', 'transcript', 'resume', 'other'])
      .parse(req.body.doc_type);
    const result = await execute(
      'INSERT INTO tutor_documents (tutor_id, doc_type, file_path, original_name) VALUES (?, ?, ?, ?)',
      [req.user!.id, docType, req.file.filename, req.file.originalname],
    );
    res.status(201).json({ id: result.insertId, status: 'pending' });
  }),
);

/** Requests this tutor has been matched to (parent details masked). */
router.get(
  '/matches',
  asyncHandler(async (req, res) => {
    const rows = await query<any>(
      `SELECT m.id AS match_id, m.score, m.score_breakdown, m.parent_decision, m.tutor_decision, m.status,
              r.id AS request_id, r.student_level, r.subject, r.second_subject, r.region,
              r.budget_per_hour, r.preferred_day, r.preferred_time, r.lessons_per_week,
              r.hours_per_lesson, r.notes, r.created_at
       FROM matches m JOIN requests r ON r.id = m.request_id
       WHERE m.tutor_id = ? AND m.parent_decision <> 'pass' AND m.status <> 'rejected'
       ORDER BY (m.parent_decision = 'like') DESC, m.score DESC`,
      [req.user!.id],
    );
    res.json({
      matches: rows.map((m) => ({
        ...m,
        score_breakdown: parseBreakdown(m.score_breakdown),
        chat_enabled:
          m.parent_decision === 'like' || m.status === 'chatting' || m.status === 'confirmed',
      })),
    });
  }),
);

export default router;
