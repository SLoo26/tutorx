import { Router } from 'express';
import { z } from 'zod';
import { config } from '../config';
import { execute, query } from '../db';
import { asyncHandler, HttpError } from '../middleware/error';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

/** Jobs for the logged-in user (as parent or tutor), with the other party's revealed contact. */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const id = req.user!.id;
    const rows = await query<any>(
      `SELECT j.*,
              pu.name AS parent_name, pu.email AS parent_email, pu.phone AS parent_phone,
              pu.postal_code AS parent_postal, pu.region AS parent_region,
              tu.name AS tutor_name, tu.email AS tutor_email, tu.phone AS tutor_phone,
              tu.postal_code AS tutor_postal, tu.region AS tutor_region,
              (SELECT COUNT(*) FROM reviews rv WHERE rv.job_id = j.id) AS reviewed
       FROM jobs j
       JOIN users pu ON pu.id = j.parent_id
       JOIN users tu ON tu.id = j.tutor_id
       WHERE j.parent_id = ? OR j.tutor_id = ?
       ORDER BY j.confirmed_at DESC`,
      [id, id],
    );
    const jobs = rows.map((j) => ({
      id: j.id,
      match_id: j.match_id,
      subject: j.subject,
      hourly_rate: j.hourly_rate,
      lessons_per_week: j.lessons_per_week,
      hours_per_lesson: j.hours_per_lesson,
      first_month_value: j.first_month_value,
      platform_fee: j.platform_fee,
      tutor_payout: j.tutor_payout,
      payment_status: j.payment_status,
      status: j.status,
      confirmed_at: j.confirmed_at,
      reviewed: Boolean(j.reviewed),
      your_side: j.parent_id === id ? 'parent' : 'tutor',
      counterparty:
        j.parent_id === id
          ? { role: 'tutor', name: j.tutor_name, email: j.tutor_email, phone: j.tutor_phone, postal_code: j.tutor_postal, region: j.tutor_region }
          : { role: 'parent', name: j.parent_name, email: j.parent_email, phone: j.parent_phone, postal_code: j.parent_postal, region: j.parent_region },
    }));
    res.json({ jobs });
  }),
);

const cancelSchema = z.object({ reason: z.string().max(500).optional() });

/**
 * Cancel a job. T&C: when the first class is cancelled the tutor is still paid
 * 70% of that first class and the platform keeps 30%.
 */
router.post(
  '/:id/cancel',
  asyncHandler(async (req, res) => {
    const id = req.user!.id;
    const [job] = await query<any>('SELECT * FROM jobs WHERE id = ?', [Number(req.params.id)]);
    if (!job) throw new HttpError(404, 'Job not found');
    if (job.parent_id !== id && job.tutor_id !== id) throw new HttpError(403, 'Not your job');
    if (job.status === 'cancelled') throw new HttpError(409, 'Job already cancelled');

    const { reason } = cancelSchema.parse(req.body);
    const firstClassValue = Math.round(job.hourly_rate * job.hours_per_lesson);
    const platformFee = Math.round(firstClassValue * config.platformFeeRate);
    const tutorCompensation = firstClassValue - platformFee;
    const cancelledBy = job.parent_id === id ? 'parent' : 'tutor';

    await execute(
      `INSERT INTO cancellations (job_id, cancelled_by, reason, tutor_compensation, platform_fee)
       VALUES (?, ?, ?, ?, ?)`,
      [job.id, cancelledBy, reason ?? null, tutorCompensation, platformFee],
    );
    await execute(`UPDATE jobs SET status = 'cancelled' WHERE id = ?`, [job.id]);
    await execute(`UPDATE matches SET status = 'cancelled' WHERE id = ?`, [job.match_id]);

    res.json({ ok: true, tutor_compensation: tutorCompensation, platform_fee: platformFee, first_class_value: firstClassValue });
  }),
);

const reviewSchema = z.object({ rating: z.number().int().min(1).max(5), comment: z.string().max(500).optional() });

router.post(
  '/:id/review',
  asyncHandler(async (req, res) => {
    const id = req.user!.id;
    const [job] = await query<any>('SELECT * FROM jobs WHERE id = ?', [Number(req.params.id)]);
    if (!job) throw new HttpError(404, 'Job not found');
    if (job.parent_id !== id) throw new HttpError(403, 'Only the parent can review');

    const data = reviewSchema.parse(req.body);
    await execute('INSERT INTO reviews (job_id, parent_id, tutor_id, rating, comment) VALUES (?, ?, ?, ?, ?)', [
      job.id,
      job.parent_id,
      job.tutor_id,
      data.rating,
      data.comment ?? null,
    ]);
    res.status(201).json({ ok: true });
  }),
);

export default router;
