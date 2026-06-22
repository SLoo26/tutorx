# TutorX

**Singapore's credential-verified tutor auto-matching marketplace.** No middleman, lower fees, and matches ranked by what actually matters — not by who paid an agent.

TutorX connects parents/learners with private tutors. A parent posts what they need (level, subject, region, budget, timing); TutorX instantly scores every **verified** tutor and shows a Tinder-style, **priority-ordered** deck of matches. Contact details stay private until the parent confirms a tutor — at which point TutorX keeps a flat **30% of the first month only** (vs the ~50% typical agencies take), with no recurring cut and no middleman.

> Built as a full-stack portfolio project: **React (Vite) + Node/Express REST API + MySQL**.

---

## Why it exists

Today a tutor signs up across several agency sites, writes the same details again and again, then applies to jobs in manual Telegram channels — slow, and not very credible. Agencies act as middlemen and take ~50% of the first month. TutorX fixes this:

- **Credibility** — every tutor must upload an O-Level / A-Level / Poly / University certificate or transcript and get it **verified** before they can be matched or teach a subject.
- **Fairness** — a flat **30% of month one** per subject, then **0% forever**. No middleman.
- **Privacy** — phone, email and exact address are hidden until a job is confirmed. Only **postal code** is stored, never the full address. No NRIC collected. (PDPA-aware.)
- **Automation** — automatic, transparent, **priority** matching instead of random listings.

## Features

**Parents / learners**
- Post a tuition request (level, subject + optional combined subject, region, postal code, budget, day/time, frequency).
- Swipe a **priority-ranked** deck of verified tutors, each with a match score and an explainable **“Why this match.”**
- Guided chat (fixed greetings + preset questions only) before confirming — no off-platform contact swapping.
- Press **“Want this tutor”** to confirm: contacts unlock and the first-month fee summary is shown.
- Cancel (with clear T&C) and review tutors.

**Tutors**
- Build a profile: subjects + grades, region, rate range, availability, teaching style.
- Upload credentials for **admin verification**; only verified tutors appear in matches.
- See incoming matches (parent details masked), express interest, and chat.
- Save default answers to preset questions for one-tap replies.

**Admin (owner)**
- Dashboard metrics (users, verified tutors, matches, jobs, revenue, docs pending).
- Credential **verification queue** (view file, verify/reject).
- **Payments** tracking (mark first-month fees paid; collected vs pending).
- User directory.

## Tech stack

| Layer     | Tech |
|-----------|------|
| Frontend  | React 18, Vite, TypeScript, Tailwind CSS, React Router, Framer Motion, lucide-react |
| Backend   | Node.js, Express, TypeScript, JWT auth, bcryptjs, Multer (uploads), Zod (validation) |
| Database  | MySQL 8 / MariaDB 11 (via `mysql2`) |

## Architecture

```
tutorx-app/
├─ client/                 React SPA (Vite) — dev proxies /api -> :4000
│  └─ src/
│     ├─ api/              fetch client + shared types
│     ├─ auth/             auth context (JWT in localStorage)
│     ├─ components/       layout, tutor card, swipe deck, jobs list, ui kit
│     ├─ pages/            public + parent + tutor + admin pages
│     └─ lib, hooks
├─ server/                 Express REST API
│  └─ src/
│     ├─ routes/           auth, tutor, requests, matches, jobs, admin, meta
│     ├─ matching/         the priority scoring engine
│     ├─ services/         candidate loading, masked cards, matchmaker
│     ├─ middleware/       auth (JWT + role), error handling
│     ├─ util/             regions, grades, contact-scrubber, password, jwt
│     └─ db/               schema runner + seed
└─ db/
   └─ schema.sql           full MySQL schema
```

### The matching engine

`server/src/matching/engine.ts` scores each tutor against a request out of 100, fully explainably:

| Signal               | Weight |
|----------------------|:------:|
| Subject & level fit  | 30 (also the eligibility gate) |
| Budget fit           | 25 |
| Location (region)    | 20 |
| Availability (day/time) | 15 |
| Grade strength       | 5 |
| Experience           | 5 |

Only **verified** tutors with a **verified matching subject** are eligible. Each match stores a per-signal breakdown so both sides see exactly why it ranked where it did. The deck is sorted by score — priority order, never random.

### Privacy by design
- Contact fields are masked everywhere until a job is confirmed; only postal code is stored.
- Pre-confirmation chat is restricted to greetings + preset questions, and every message is run through a **contact scrubber** that redacts phone numbers, emails, messaging handles, postal codes and addresses.

---

## Getting started

### Prerequisites
- Node.js 18+
- MySQL 8 **or** MariaDB 10.5+ running locally

### 1. Install dependencies
```bash
npm run install:all
```

### 2. Configure the database connection
Edit `server/.env` (created from `server/.env.example`) and set your DB credentials:
```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=tutorx
JWT_SECRET=change-me-to-something-long
```

### 3. Create the schema + seed demo data
```bash
npm run db:setup
```
This creates the `tutorx` database, all tables, and demo data (1 admin, 1 parent, 5 tutors, and a sample request with a populated match deck).

### 4. Run both apps
```bash
npm run dev
```
- Client → http://localhost:5173
- API → http://localhost:4000

### Demo logins

| Role   | Email              | Password     |
|--------|--------------------|--------------|
| Parent | parent@tutorx.sg   | password123  |
| Tutor  | nurul@tutorx.sg    | password123  |
| Admin  | admin@tutorx.sg    | admin12345   |

> Log in as the parent and open the seeded request to see the swipe deck. Log in as admin → **Verify docs** to see the verification queue (the unverified tutor "Jia Hui" only appears in matches once approved).

## NPM scripts (root)

| Script              | What it does |
|---------------------|--------------|
| `npm run install:all` | Install root, server and client deps |
| `npm run db:setup`  | Create schema + seed demo data |
| `npm run dev`       | Run API + client together |
| `npm run build`     | Build server (tsc) + client (vite) |

## Roadmap
- Real payment gateway (HitPay/Stripe) with automated 30/70 split
- OCR-assisted credential checks + LLM match explanations
- Email/WhatsApp notifications, review prompts after month one
- Dispute & replacement-tutor workflow
- Deploy (client → static host, server → Node host, managed MySQL)

---

*This is an early-stage startup project. The Terms and Privacy pages are drafts, not legal advice — have them reviewed by a Singapore lawyer / PDPA consultant before any real launch.*
