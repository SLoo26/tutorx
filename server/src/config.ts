import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

/** Central app configuration, read once from the environment. */
export const config = {
  port: Number(process.env.PORT ?? 4000),
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  db: {
    host: process.env.DB_HOST ?? '127.0.0.1',
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? 'tutorx',
  },
  jwtSecret: process.env.JWT_SECRET ?? 'dev-only-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  admin: {
    name: process.env.ADMIN_NAME ?? 'TutorX Admin',
    email: process.env.ADMIN_EMAIL ?? 'admin@tutorx.sg',
    password: process.env.ADMIN_PASSWORD ?? 'admin12345',
  },
  uploadDir: path.resolve(process.cwd(), process.env.UPLOAD_DIR ?? 'uploads'),
  /** Platform keeps this share of the first month. */
  platformFeeRate: 0.3,
};
