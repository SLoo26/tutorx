import { Link } from 'react-router-dom'
import {
  ShieldCheck,
  Database,
  Lock,
  EyeOff,
  MapPin,
  FileCheck2,
  Trash2,
  UserCheck,
  Mail,
} from 'lucide-react'

export default function Privacy() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:py-16">
      <div className="flex items-center gap-2">
        <span className="badge">
          <ShieldCheck className="h-3.5 w-3.5" />
          PDPA-aware
        </span>
      </div>

      <h1 className="mt-4 text-3xl sm:text-4xl">Privacy & PDPA</h1>
      <p className="mt-3 max-w-2xl text-slate-500">
        TutorX is built in Singapore and designed around the Personal Data
        Protection Act (PDPA). We collect only what we need to match parents and
        tutors, we keep contact details hidden until a job is confirmed, and we
        never store your full address or NRIC. Here is exactly how your data is
        handled.
      </p>

      {/* What we collect */}
      <section className="card mt-10 rounded-2xl">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
            <Database className="h-5 w-5" />
          </span>
          <h2 className="text-xl font-semibold text-slate-900">
            What we collect
          </h2>
        </div>
        <ul className="mt-5 space-y-4 text-slate-600">
          <li>
            <span className="font-medium text-slate-900">Account info.</span>{' '}
            Your name, email, and a contact number so we can reach you about a
            match. Tutors and parents each have an account.
          </li>
          <li>
            <span className="font-medium text-slate-900">
              Tutor credentials & grades.
            </span>{' '}
            For tutors only: uploaded certificates or transcripts (O-Level,
            A-Level, Poly or University) and the relevant grades, used to verify
            you before you can be matched for a subject.
          </li>
          <li>
            <span className="font-medium text-slate-900">Request details.</span>{' '}
            Subject and level, budget, region, availability (day and time), and
            any notes a parent adds to a tutoring request.
          </li>
          <li className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
            <span>
              <span className="font-medium text-slate-900">
                Postal code only.
              </span>{' '}
              We store your{' '}
              <span className="font-medium">six-digit postal code</span> for
              region matching &mdash;{' '}
              <span className="font-medium text-slate-900">
                never your full address
              </span>{' '}
              and{' '}
              <span className="font-medium text-slate-900">no NRIC</span> is ever
              requested or kept.
            </span>
          </li>
        </ul>
      </section>

      {/* Why we collect it */}
      <section className="card mt-6 rounded-2xl">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
            <UserCheck className="h-5 w-5" />
          </span>
          <h2 className="text-xl font-semibold text-slate-900">
            Why we collect it
          </h2>
        </div>
        <p className="mt-5 text-slate-600">
          Everything above feeds a single purpose: to automatically match
          parents and tutors in a{' '}
          <span className="font-medium text-slate-900">priority order</span>{' '}
          &mdash; scored on subject and level fit, budget, region, availability,
          grade strength, and experience. We do not sell your data or use it for
          unrelated advertising.
        </p>
      </section>

      {/* How we protect it */}
      <section className="card mt-6 rounded-2xl">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
            <Lock className="h-5 w-5" />
          </span>
          <h2 className="text-xl font-semibold text-slate-900">
            How we protect it
          </h2>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 p-4">
            <EyeOff className="h-5 w-5 text-brand-600" />
            <h3 className="mt-3 font-medium text-slate-900">
              Contacts masked until confirmed
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Phone, email, and exact address stay hidden until a parent
              confirms a tutor with &ldquo;Want this tutor&rdquo;.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 p-4">
            <ShieldCheck className="h-5 w-5 text-brand-600" />
            <h3 className="mt-3 font-medium text-slate-900">
              Pre-confirmation chat scrubbed
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Before a job is confirmed, chat is limited to fixed greetings and
              preset questions, and phone numbers, emails, and handles are
              stripped out.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 p-4">
            <FileCheck2 className="h-5 w-5 text-brand-600" />
            <h3 className="mt-3 font-medium text-slate-900">
              Documents access-controlled
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Credential documents are reviewed by an admin and kept under
              access controls &mdash; not shown to other users.
            </p>
          </div>
        </div>
      </section>

      {/* Retention & deletion */}
      <section className="card mt-6 rounded-2xl">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
            <Trash2 className="h-5 w-5" />
          </span>
          <h2 className="text-xl font-semibold text-slate-900">
            Retention & deletion
          </h2>
        </div>
        <p className="mt-5 text-slate-600">
          We keep your data only as long as it is needed to run your account and
          your matches, or as required for legal and accounting reasons. When a
          request is closed or an account is deleted, we remove or anonymise the
          associated personal data, including credential documents and postal
          codes. You can ask us to delete your account at any time using the
          contact below.
        </p>
      </section>

      {/* Your PDPA rights */}
      <section className="card mt-6 rounded-2xl">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <h2 className="text-xl font-semibold text-slate-900">
            Your PDPA rights
          </h2>
        </div>
        <ul className="mt-5 space-y-3 text-slate-600">
          <li>
            <span className="font-medium text-slate-900">Access.</span> Request a
            copy of the personal data we hold about you and how it has been used.
          </li>
          <li>
            <span className="font-medium text-slate-900">Correction.</span> Ask us
            to fix inaccurate or incomplete details, such as your grades or
            postal code.
          </li>
          <li>
            <span className="font-medium text-slate-900">
              Withdraw consent.
            </span>{' '}
            Withdraw your consent to processing at any time. Note this may mean we
            can no longer match you.
          </li>
        </ul>
      </section>

      {/* Contact for data requests */}
      <section className="card mt-6 rounded-2xl">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
            <Mail className="h-5 w-5" />
          </span>
          <h2 className="text-xl font-semibold text-slate-900">
            Contact for data requests
          </h2>
        </div>
        <p className="mt-5 text-slate-600">
          To exercise any of the rights above, or to ask a question about your
          data, contact our Data Protection Officer at{' '}
          <a
            href="mailto:privacy@tutorx.sg"
            className="font-medium text-brand-700 underline underline-offset-2"
          >
            privacy@tutorx.sg
          </a>
          . We aim to respond within a reasonable time, in line with PDPA
          guidance.
        </p>
      </section>

      <p className="mt-8 text-sm italic text-slate-500">
        Note: This is an early startup draft and not legal advice. We recommend
        reviewing it with a qualified PDPA consultant before launch.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/terms" className="btn-ghost">
          Read our Terms
        </Link>
        <Link to="/how-it-works" className="btn-primary">
          See how matching works
        </Link>
      </div>
    </div>
  )
}
