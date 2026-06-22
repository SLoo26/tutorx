import { Router } from 'express';
import { config } from '../config';
import { GREETINGS, PRESET_QUESTIONS } from '../constants';
import { REGION_LABEL, REGIONS } from '../util/regions';

const router = Router();

const DAYS = [
  { value: 'mon', label: 'Monday' },
  { value: 'tue', label: 'Tuesday' },
  { value: 'wed', label: 'Wednesday' },
  { value: 'thu', label: 'Thursday' },
  { value: 'fri', label: 'Friday' },
  { value: 'sat', label: 'Saturday' },
  { value: 'sun', label: 'Sunday' },
];

const EDUCATION = [
  { value: 'o_level', label: 'O-Level' },
  { value: 'a_level', label: 'A-Level' },
  { value: 'poly', label: 'Polytechnic Diploma' },
  { value: 'undergraduate', label: 'Undergraduate' },
  { value: 'graduate', label: 'University Graduate' },
  { value: 'postgraduate', label: 'Postgraduate' },
];

const LEVELS = [
  'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6',
  'Sec 1', 'Sec 2', 'Sec 3', 'Sec 4', 'Sec 5', 'JC1', 'JC2',
];

const SUBJECTS = [
  'English', 'Mathematics', 'E-Math', 'A-Math', 'Science', 'Physics', 'Chemistry',
  'Biology', 'Combined Science', 'Geography', 'History', 'Social Studies', 'Literature',
  'Chinese', 'Malay', 'Tamil', 'Economics', 'Principles of Accounts', 'Computing',
];

router.get('/', (_req, res) => {
  res.json({
    regions: REGIONS.map((r) => ({ value: r, label: REGION_LABEL[r] })),
    days: DAYS,
    education: EDUCATION,
    levels: LEVELS,
    subjects: SUBJECTS,
    greetings: GREETINGS,
    presetQuestions: PRESET_QUESTIONS,
    feeRate: config.platformFeeRate,
  });
});

export default router;
