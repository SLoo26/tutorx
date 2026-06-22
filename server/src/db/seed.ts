import { pool, execute } from '../db';
import { config } from '../config';
import { hashPassword } from '../util/password';
import { DEFAULT_PRESET_ANSWERS } from '../constants';
import { generateMatchesForRequest } from '../services/matchmaker';
import { Day, Region } from '../types';

interface TutorSeed {
  name: string;
  email: string;
  password: string;
  phone: string;
  postal: string;
  region: Region;
  headline: string;
  bio: string;
  education: string;
  institution: string;
  years: number;
  rateMin: number;
  rateMax: number;
  style: string;
  verified: boolean;
  subjects: { subject: string; level: string; grade: string }[];
  availability: { day: Day; start: string; end: string }[];
  document: { type: string; file: string; name: string; status: 'pending' | 'verified' | 'rejected' };
}

async function createTutor(t: TutorSeed): Promise<number> {
  const hash = await hashPassword(t.password);
  const u = await execute(
    `INSERT INTO users (role, name, email, password_hash, phone, postal_code, region)
     VALUES ('tutor', ?, ?, ?, ?, ?, ?)`,
    [t.name, t.email, hash, t.phone, t.postal, t.region],
  );
  const id = u.insertId;
  await execute(
    `INSERT INTO tutor_profiles
       (user_id, headline, bio, highest_education, institution, years_experience,
        rate_min, rate_max, teaching_style, is_verified)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, t.headline, t.bio, t.education, t.institution, t.years, t.rateMin, t.rateMax, t.style, t.verified],
  );
  for (const s of t.subjects) {
    await execute(
      `INSERT INTO tutor_subjects (tutor_id, subject, level, grade, is_verified) VALUES (?, ?, ?, ?, ?)`,
      [id, s.subject, s.level, s.grade, t.verified],
    );
  }
  for (const slot of t.availability) {
    await execute(
      `INSERT INTO tutor_availability (tutor_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?)`,
      [id, slot.day, slot.start, slot.end],
    );
  }
  for (const [key, answer] of Object.entries(DEFAULT_PRESET_ANSWERS)) {
    await execute(`INSERT INTO tutor_preset_answers (tutor_id, question_key, answer) VALUES (?, ?, ?)`, [
      id,
      key,
      answer,
    ]);
  }
  await execute(
    `INSERT INTO tutor_documents (tutor_id, doc_type, file_path, original_name, status, reviewed_at)
     VALUES (?, ?, ?, ?, ?, ${t.document.status === 'pending' ? 'NULL' : 'NOW()'})`,
    [id, t.document.type, t.document.file, t.document.name, t.document.status],
  );
  return id;
}

export async function seed(): Promise<void> {
  console.log('Seeding demo data...');

  // Clean slate (FK cascades clear the rest).
  await execute('DELETE FROM audit_log', []);
  await execute('DELETE FROM users', []);

  // --- Owner / admin ---
  const adminHash = await hashPassword(config.admin.password);
  await execute(
    `INSERT INTO users (role, name, email, password_hash) VALUES ('admin', ?, ?, ?)`,
    [config.admin.name, config.admin.email, adminHash],
  );

  // --- Parent / learner ---
  const parentHash = await hashPassword('password123');
  const parent = await execute(
    `INSERT INTO users (role, name, email, password_hash, phone, postal_code, region)
     VALUES ('parent', 'Mrs Tan', 'parent@tutorx.sg', ?, '91234567', '520123', 'east')`,
    [parentHash],
  );
  const parentId = parent.insertId;

  // --- Tutors ---
  const tutors: TutorSeed[] = [
    {
      name: 'Nurul Aisyah', email: 'nurul@tutorx.sg', password: 'password123', phone: '98010101',
      postal: '520512', region: 'east',
      headline: 'Patient A-Math & E-Math specialist (East)',
      bio: 'NUS undergraduate, 4 years tutoring Sec 3-4 math. Exam-focused with lots of timed practice.',
      education: 'undergraduate', institution: 'NUS', years: 4, rateMin: 40, rateMax: 50,
      style: 'Patient, structured, exam-focused',
      verified: true,
      subjects: [
        { subject: 'A-Math', level: 'Sec 3-4', grade: 'A1' },
        { subject: 'E-Math', level: 'Sec 3-4', grade: 'A1' },
      ],
      availability: [
        { day: 'wed', start: '17:00:00', end: '20:00:00' },
        { day: 'sat', start: '10:00:00', end: '13:00:00' },
      ],
      document: { type: 'o_level_cert', file: 'sample-olevel.pdf', name: 'O-Level-Cert.pdf', status: 'verified' },
    },
    {
      name: 'Marcus Lee', email: 'marcus@tutorx.sg', password: 'password123', phone: '98020202',
      postal: '460088', region: 'east',
      headline: 'NTU Engineering — A-Math & Physics',
      bio: 'Engineering undergraduate who makes Physics and A-Math intuitive. Friendly and detailed.',
      education: 'undergraduate', institution: 'NTU', years: 3, rateMin: 45, rateMax: 55,
      style: 'Concept-first, real-world examples',
      verified: true,
      subjects: [
        { subject: 'A-Math', level: 'Sec 3-4', grade: 'A2' },
        { subject: 'Physics', level: 'Sec 3-4', grade: 'A1' },
      ],
      availability: [
        { day: 'wed', start: '17:00:00', end: '19:00:00' },
        { day: 'thu', start: '18:00:00', end: '20:00:00' },
      ],
      document: { type: 'transcript', file: 'sample-transcript.pdf', name: 'NTU-Transcript.pdf', status: 'verified' },
    },
    {
      name: 'Priya Menon', email: 'priya@tutorx.sg', password: 'password123', phone: '98030303',
      postal: '530123', region: 'north_east',
      headline: 'Full-time tutor, 6 years, Math',
      bio: 'Experienced full-time tutor. Builds strong fundamentals from Primary through Sec 4.',
      education: 'graduate', institution: 'SMU', years: 6, rateMin: 35, rateMax: 45,
      style: 'Fundamentals-first, lots of encouragement',
      verified: true,
      subjects: [
        { subject: 'E-Math', level: 'Sec 3-4', grade: 'A1' },
        { subject: 'A-Math', level: 'Sec 3-4', grade: 'B3' },
        { subject: 'Mathematics', level: 'Primary 6', grade: 'A1' },
      ],
      availability: [
        { day: 'wed', start: '16:00:00', end: '18:00:00' },
        { day: 'tue', start: '17:00:00', end: '19:00:00' },
      ],
      document: { type: 'degree_cert', file: 'sample-degree.pdf', name: 'Degree-Cert.pdf', status: 'verified' },
    },
    {
      name: 'Daniel Ong', email: 'daniel@tutorx.sg', password: 'password123', phone: '98040404',
      postal: '640500', region: 'west',
      headline: 'Poly grad, affordable A-Math help',
      bio: 'Recent poly graduate offering affordable, relatable A-Math tutoring on the west side.',
      education: 'poly', institution: 'Singapore Polytechnic', years: 2, rateMin: 30, rateMax: 40,
      style: 'Relaxed, relatable, step-by-step',
      verified: true,
      subjects: [{ subject: 'A-Math', level: 'Sec 3-4', grade: 'A2' }],
      availability: [
        { day: 'mon', start: '17:00:00', end: '19:00:00' },
        { day: 'wed', start: '19:00:00', end: '21:00:00' },
      ],
      document: { type: 'poly_cert', file: 'sample-poly.pdf', name: 'Poly-Diploma.pdf', status: 'verified' },
    },
    {
      // Not yet verified — should NOT appear in matches until admin approves.
      name: 'Jia Hui', email: 'jiahui@tutorx.sg', password: 'password123', phone: '98050505',
      postal: '520777', region: 'east',
      headline: 'New tutor pending verification',
      bio: 'Just signed up — credential under review.',
      education: 'undergraduate', institution: 'SUTD', years: 1, rateMin: 40, rateMax: 50,
      style: 'Energetic and patient',
      verified: false,
      subjects: [{ subject: 'A-Math', level: 'Sec 3-4', grade: 'A1' }],
      availability: [{ day: 'wed', start: '17:00:00', end: '19:00:00' }],
      document: { type: 'o_level_cert', file: 'sample-pending.pdf', name: 'O-Level-Cert.pdf', status: 'pending' },
    },
  ];

  for (const t of tutors) await createTutor(t);

  // --- A sample request from the parent: the headline scenario ---
  const request = await execute(
    `INSERT INTO requests
       (parent_id, student_level, subject, postal_code, region, budget_per_hour,
        preferred_day, preferred_time, lessons_per_week, hours_per_lesson, notes)
     VALUES (?, 'Sec 4', 'A-Math', '520123', 'east', 50, 'wed', '17:00:00', 1, 1.5,
        'My daughter needs help before her Oct exam. Prefer someone patient.')`,
    [parentId],
  );
  const matchCount = await generateMatchesForRequest(request.insertId);

  console.log(`Seeded 1 admin, 1 parent, ${tutors.length} tutors, 1 request -> ${matchCount} matches.`);
  console.log('Logins:  admin@tutorx.sg / ' + config.admin.password);
  console.log('         parent@tutorx.sg / password123');
  console.log('         nurul@tutorx.sg  / password123  (verified tutor)');
}

// Allow running standalone: `npm run db:seed`
if (require.main === module) {
  seed()
    .then(() => pool.end())
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
