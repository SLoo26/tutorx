import path from 'path';
import { Router } from 'express';
import { z } from 'zod';
import { config } from '../config';
import { execute, query } from '../db';
import { asyncHandler, HttpError } from '../middleware/error';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();
router.use(requireAuth, requireRole('admin'));

router.get(
  '/metrics',
  asyncHandler(async (_req, res) => {
    const [[users], [tutors], [verified], [openReq], [matches], [jobs], [revenue], [pendingDocs]] =
      await Promise.all([
        query<any>(`SELECT COUNT(*) AS n FROM users`),
        query<any>(`SELECT COUNT(*) AS n FROM users WHERE role = 'tutor'`),
        query<any>(`SELECT COUNT(*) AS n FROM tutor_profiles WHERE is_verified = TRUE`),
        query<any>(`SELECT COUNT(*) AS n FROM requests WHERE status = 'open'`),
        query<any>(`SELECT COUNT(*) AS n FROM matches`),
        query<any>(`SELECT COUNT(*) AS n FROM jobs`),
        query<any>(`SELECT COALESCE(SUM(platform_fee), 0) AS n FROM jobs WHERE payment_status = 'paid'`),
        query<any>(`SELECT COUNT(*) AS n FROM tutor_documents WHERE status = 'pending'`),
      ]);
    res.json({
      metrics: {
        total_users: users.n,
        tutors: tutors.n,
        verified_tutors: verified.n,
        open_requests: openReq.n,
        total_matches: matches.n,
        total_jobs: jobs.n,
        collected_revenue: revenue.n,
        pending_documents: pendingDocs.n,
        fee_rate: config.platformFeeRate,
      },
    });
  }),
);

router.get(
  '/documents',
  asyncHandler(async (req, res) => {
    const status = req.query.status as string | undefined;
    const where = status ? 'WHERE d.status = ?' : '';
    const docs = await query<any>(
      `SELECT d.*, u.name AS tutor_name, u.email AS tutor_email
       FROM tutor_documents d JOIN users u ON u.id = d.tutor_id
       ${where} ORDER BY d.created_at DESC`,
      status ? [status] : [],
    );
    res.json({ documents: docs });
  }),
);

/** Stream an uploaded credential file to the admin for review. */
router.get(
  '/documents/:id/file',
  asyncHandler(async (req, res) => {
    const [doc] = await query<any>('SELECT file_path, original_name FROM tutor_documents WHERE id = ?', [
      Number(req.params.id),
    ]);
    if (!doc) throw new HttpError(404, 'Document not found');
    res.sendFile(path.join(config.uploadDir, doc.file_path));
  }),
);

const verifySchema = z.object({
  status: z.enum(['verified', 'rejected']),
  note: z.string().max(255).optional(),
});

/**
 * Approve/reject a credential. Approving marks the tutor verified and trusts
 * the subjects they listed (so they can appear in matches).
 */
router.post(
  '/documents/:id/verify',
  asyncHandler(async (req, res) => {
    const docId = Number(req.params.id);
    const data = verifySchema.parse(req.body);
    const [doc] = await query<any>('SELECT * FROM tutor_documents WHERE id = ?', [docId]);
    if (!doc) throw new HttpError(404, 'Document not found');

    await execute(
      `UPDATE tutor_documents SET status = ?, reviewer_note = ?, reviewed_by = ?, reviewed_at = NOW() WHERE id = ?`,
      [data.status, data.note ?? null, req.user!.id, docId],
    );

    if (data.status === 'verified') {
      await execute('UPDATE tutor_profiles SET is_verified = TRUE WHERE user_id = ?', [doc.tutor_id]);
      await execute('UPDATE tutor_subjects SET is_verified = TRUE WHERE tutor_id = ?', [doc.tutor_id]);
    }
    await execute(`INSERT INTO audit_log (actor_id, action, detail) VALUES (?, 'document_review', ?)`, [
      req.user!.id,
      `doc ${docId} -> ${data.status}`,
    ]);
    res.json({ ok: true });
  }),
);

router.get(
  '/jobs',
  asyncHandler(async (_req, res) => {
    const jobs = await query<any>(
      `SELECT j.*, pu.name AS parent_name, tu.name AS tutor_name
       FROM jobs j JOIN users pu ON pu.id = j.parent_id JOIN users tu ON tu.id = j.tutor_id
       ORDER BY j.confirmed_at DESC`,
    );
    res.json({ jobs });
  }),
);

router.post(
  '/jobs/:id/mark-paid',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const result = await execute(`UPDATE jobs SET payment_status = 'paid', paid_at = NOW() WHERE id = ?`, [id]);
    if (result.affectedRows === 0) throw new HttpError(404, 'Job not found');
    await execute(`INSERT INTO audit_log (actor_id, action, detail) VALUES (?, 'job_marked_paid', ?)`, [
      req.user!.id,
      `job ${id}`,
    ]);
    res.json({ ok: true });
  }),
);

router.get(
  '/users',
  asyncHandler(async (_req, res) => {
    const users = await query<any>(
      `SELECT u.id, u.role, u.name, u.email, u.region, u.created_at,
              p.is_verified
       FROM users u LEFT JOIN tutor_profiles p ON p.user_id = u.id
       ORDER BY u.created_at DESC`,
    );
    res.json({ users });
  }),
);

export default router;
