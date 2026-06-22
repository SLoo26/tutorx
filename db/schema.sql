-- ============================================================
--  TutorX database schema  (MySQL 8 / MariaDB 11 compatible)
-- ============================================================
--  Run with:  mysql -u root -p < db/schema.sql
--  Or use the seed script:  npm --prefix server run db:setup
-- ------------------------------------------------------------

CREATE DATABASE IF NOT EXISTS tutorx
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tutorx;

-- Drop in reverse-dependency order so re-running is clean.
DROP TABLE IF EXISTS audit_log;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS cancellations;
DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS matches;
DROP TABLE IF EXISTS requests;
DROP TABLE IF EXISTS tutor_documents;
DROP TABLE IF EXISTS tutor_preset_answers;
DROP TABLE IF EXISTS tutor_availability;
DROP TABLE IF EXISTS tutor_subjects;
DROP TABLE IF EXISTS tutor_profiles;
DROP TABLE IF EXISTS users;

-- ------------------------------------------------------------
--  Users: parents (learners), tutors, and the owner-admin
-- ------------------------------------------------------------
CREATE TABLE users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  role          ENUM('parent','tutor','admin') NOT NULL,
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  -- Contact + exact location are PERSONAL DATA: masked in the UI until a
  -- job is confirmed. We deliberately store postal_code only, never address.
  phone         VARCHAR(40)  NULL,
  postal_code   VARCHAR(10)  NULL,
  region        ENUM('north','south','east','west','central','north_east') NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
--  Tutor profile (1:1 with a user whose role = 'tutor')
-- ------------------------------------------------------------
CREATE TABLE tutor_profiles (
  user_id          INT PRIMARY KEY,
  headline         VARCHAR(160) NULL,
  bio              TEXT NULL,
  highest_education ENUM('o_level','a_level','poly','undergraduate','graduate','postgraduate')
                   NOT NULL DEFAULT 'o_level',
  institution      VARCHAR(160) NULL,
  years_experience INT NOT NULL DEFAULT 0,
  rate_min         INT NOT NULL DEFAULT 0,   -- SGD / hour
  rate_max         INT NOT NULL DEFAULT 0,   -- SGD / hour
  teaching_style   VARCHAR(255) NULL,
  -- TRUE once the tutor has at least one admin-verified credential.
  is_verified      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
--  Subjects a tutor can teach, with the grade they achieved.
--  is_verified is gated on a matching uploaded + verified document.
-- ------------------------------------------------------------
CREATE TABLE tutor_subjects (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  tutor_id    INT NOT NULL,
  subject     VARCHAR(80) NOT NULL,   -- 'E-Math','A-Math','Physics','Chemistry'...
  level       VARCHAR(40) NOT NULL,   -- 'Primary','Sec 1-2','Sec 3-4','JC'
  grade       VARCHAR(8)  NULL,       -- 'A1','A2','B3','Distinction'
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  FOREIGN KEY (tutor_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
--  Tutor weekly availability slots
-- ------------------------------------------------------------
CREATE TABLE tutor_availability (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  tutor_id    INT NOT NULL,
  day_of_week ENUM('mon','tue','wed','thu','fri','sat','sun') NOT NULL,
  start_time  TIME NOT NULL,
  end_time    TIME NOT NULL,
  FOREIGN KEY (tutor_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
--  Preset answers a tutor pre-writes; surfaced when a parent asks a
--  preset question in chat so no free-text contact swapping is needed.
-- ------------------------------------------------------------
CREATE TABLE tutor_preset_answers (
  tutor_id     INT NOT NULL,
  question_key VARCHAR(40) NOT NULL,   -- 'start','rate','combined','mode'
  answer       VARCHAR(280) NOT NULL,
  PRIMARY KEY (tutor_id, question_key),
  FOREIGN KEY (tutor_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
--  Uploaded credentials (the credibility gate). Files live on disk
--  in server/uploads; only the path + review status are stored here.
-- ------------------------------------------------------------
CREATE TABLE tutor_documents (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  tutor_id      INT NOT NULL,
  doc_type      ENUM('o_level_cert','a_level_cert','poly_cert','degree_cert','transcript','resume','other')
                NOT NULL,
  file_path     VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  status        ENUM('pending','verified','rejected') NOT NULL DEFAULT 'pending',
  reviewer_note VARCHAR(255) NULL,
  reviewed_by   INT NULL,
  reviewed_at   TIMESTAMP NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tutor_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
--  A parent's tuition request (what they need)
-- ------------------------------------------------------------
CREATE TABLE requests (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  parent_id       INT NOT NULL,
  student_level   VARCHAR(40) NOT NULL,   -- 'Sec 4'
  subject         VARCHAR(80) NOT NULL,   -- primary subject
  second_subject  VARCHAR(80) NULL,       -- combined subject (optional)
  postal_code     VARCHAR(10) NOT NULL,
  region          ENUM('north','south','east','west','central','north_east') NOT NULL,
  budget_per_hour INT NOT NULL,           -- SGD / hour
  preferred_day   ENUM('mon','tue','wed','thu','fri','sat','sun') NULL,
  preferred_time  TIME NULL,
  lessons_per_week  INT NOT NULL DEFAULT 1,
  hours_per_lesson  DECIMAL(3,1) NOT NULL DEFAULT 1.5,
  notes           TEXT NULL,
  status          ENUM('open','matched','closed') NOT NULL DEFAULT 'open',
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
--  Match = (request x tutor) with a priority score. These are the
--  swipe-deck cards, ordered by score (highest first).
-- ------------------------------------------------------------
CREATE TABLE matches (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  request_id      INT NOT NULL,
  tutor_id        INT NOT NULL,
  score           INT NOT NULL DEFAULT 0,   -- 0..100 priority score
  score_breakdown JSON NULL,                -- explains the score to both sides
  parent_decision ENUM('pending','like','pass') NOT NULL DEFAULT 'pending',
  tutor_decision  ENUM('pending','like','pass') NOT NULL DEFAULT 'pending',
  status          ENUM('suggested','chatting','confirmed','rejected','cancelled')
                  NOT NULL DEFAULT 'suggested',
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_match (request_id, tutor_id),
  FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE,
  FOREIGN KEY (tutor_id)   REFERENCES users(id)    ON DELETE CASCADE
);

-- ------------------------------------------------------------
--  Chat messages within a match. Before a job is confirmed only
--  greeting / preset_question / preset_answer types are allowed and
--  the server scrubs contact details from any body.
-- ------------------------------------------------------------
CREATE TABLE messages (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  match_id     INT NOT NULL,
  sender_id    INT NOT NULL,
  sender_role  ENUM('parent','tutor') NOT NULL,
  message_type ENUM('greeting','preset_question','preset_answer','free') NOT NULL DEFAULT 'greeting',
  body         VARCHAR(500) NOT NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (match_id)  REFERENCES matches(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id)   ON DELETE CASCADE
);

-- ------------------------------------------------------------
--  Job = parent pressed "Want this tutor". This is the money record;
--  contacts get revealed at this point. Platform keeps 30% of month 1.
-- ------------------------------------------------------------
CREATE TABLE jobs (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  match_id          INT NOT NULL UNIQUE,
  request_id        INT NOT NULL,
  parent_id         INT NOT NULL,
  tutor_id          INT NOT NULL,
  subject           VARCHAR(80) NOT NULL,
  hourly_rate       INT NOT NULL,
  lessons_per_week  INT NOT NULL DEFAULT 1,
  hours_per_lesson  DECIMAL(3,1) NOT NULL DEFAULT 1.5,
  first_month_value INT NOT NULL,   -- rate * hours * lessons/wk * 4 weeks
  platform_fee      INT NOT NULL,   -- 30% of first_month_value
  tutor_payout      INT NOT NULL,   -- 70% of first_month_value
  payment_status    ENUM('unpaid','paid','refunded') NOT NULL DEFAULT 'unpaid',
  status            ENUM('active','completed','cancelled') NOT NULL DEFAULT 'active',
  confirmed_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  paid_at           TIMESTAMP NULL,
  FOREIGN KEY (match_id)   REFERENCES matches(id)  ON DELETE CASCADE,
  FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id)  REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (tutor_id)   REFERENCES users(id)    ON DELETE CASCADE
);

-- ------------------------------------------------------------
--  Cancellation record. T&C: if the parent cancels the very first
--  class, tutor is paid 70% of that first class and platform keeps 30%.
-- ------------------------------------------------------------
CREATE TABLE cancellations (
  id                 INT AUTO_INCREMENT PRIMARY KEY,
  job_id             INT NOT NULL,
  cancelled_by       ENUM('parent','tutor','admin') NOT NULL,
  reason             VARCHAR(500) NULL,
  tutor_compensation INT NOT NULL DEFAULT 0,
  platform_fee       INT NOT NULL DEFAULT 0,
  created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
--  Reviews after an engagement
-- ------------------------------------------------------------
CREATE TABLE reviews (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  job_id     INT NOT NULL,
  parent_id  INT NOT NULL,
  tutor_id   INT NOT NULL,
  rating     TINYINT NOT NULL,   -- 1..5
  comment    VARCHAR(500) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
--  Admin audit log (PDPA accountability)
-- ------------------------------------------------------------
CREATE TABLE audit_log (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  actor_id   INT NULL,
  action     VARCHAR(80) NOT NULL,
  detail     VARCHAR(500) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Helpful indexes for the matching + dashboards
CREATE INDEX idx_requests_open    ON requests (status, region);
CREATE INDEX idx_matches_request  ON matches (request_id, score);
CREATE INDEX idx_matches_tutor    ON matches (tutor_id, status);
CREATE INDEX idx_subjects_tutor   ON tutor_subjects (tutor_id);
CREATE INDEX idx_docs_status      ON tutor_documents (status);
CREATE INDEX idx_jobs_payment     ON jobs (payment_status);
