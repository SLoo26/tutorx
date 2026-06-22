import { Router } from 'express';
import { z } from 'zod';
import { execute, query } from '../db';
import { hashPassword, verifyPassword } from '../util/password';
import { signToken } from '../util/jwt';
import { asyncHandler, HttpError } from '../middleware/error';
import { requireAuth } from '../middleware/auth';
import { DEFAULT_PRESET_ANSWERS } from '../constants';

const router = Router();
const regionEnum = z.enum(['north', 'south', 'east', 'west', 'central', 'north_east']);

const registerSchema = z.object({
  role: z.enum(['parent', 'tutor']),
  name: z.string().min(2).max(120),
  email: z.string().email().max(190),
  password: z.string().min(6).max(100),
  phone: z.string().max(40).optional(),
  postal_code: z.string().max(10).optional(),
  region: regionEnum.optional(),
});

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const data = registerSchema.parse(req.body);
    const existing = await query('SELECT id FROM users WHERE email = ?', [data.email]);
    if (existing.length) throw new HttpError(409, 'That email is already registered');

    const hash = await hashPassword(data.password);
    const result = await execute(
      `INSERT INTO users (role, name, email, password_hash, phone, postal_code, region)
       VALUES (:role, :name, :email, :hash, :phone, :postal, :region)`,
      {
        role: data.role,
        name: data.name,
        email: data.email,
        hash,
        phone: data.phone ?? null,
        postal: data.postal_code ?? null,
        region: data.region ?? null,
      },
    );
    const userId = result.insertId;

    if (data.role === 'tutor') {
      await execute('INSERT INTO tutor_profiles (user_id) VALUES (?)', [userId]);
      for (const [key, answer] of Object.entries(DEFAULT_PRESET_ANSWERS)) {
        await execute(
          'INSERT INTO tutor_preset_answers (tutor_id, question_key, answer) VALUES (?, ?, ?)',
          [userId, key, answer],
        );
      }
    }

    const user = { id: userId, role: data.role, name: data.name, email: data.email };
    res.status(201).json({ token: signToken(user), user });
  }),
);

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = loginSchema.parse(req.body);
    const [u] = await query<any>('SELECT * FROM users WHERE email = ?', [email]);
    if (!u || !(await verifyPassword(password, u.password_hash))) {
      throw new HttpError(401, 'Invalid email or password');
    }
    const user = { id: u.id, role: u.role, name: u.name, email: u.email };
    res.json({ token: signToken(user), user });
  }),
);

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const [u] = await query<any>(
      'SELECT id, role, name, email, phone, postal_code, region FROM users WHERE id = ?',
      [req.user!.id],
    );
    if (!u) throw new HttpError(404, 'User not found');
    res.json({ user: u });
  }),
);

export default router;
