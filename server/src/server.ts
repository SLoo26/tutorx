import express from 'express';
import cors from 'cors';
import { config } from './config';
import { errorHandler } from './middleware/error';
import authRoutes from './routes/auth';
import metaRoutes from './routes/meta';
import tutorRoutes from './routes/tutor';
import requestRoutes from './routes/requests';
import matchRoutes from './routes/matches';
import jobRoutes from './routes/jobs';
import adminRoutes from './routes/admin';

const app = express();

app.use(cors({ origin: config.clientOrigin }));
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'tutorx-api' }));
app.use('/api/meta', metaRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tutor', tutorRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/admin', adminRoutes);

app.use(errorHandler);

app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`TutorX API running on http://localhost:${config.port}`);
});
