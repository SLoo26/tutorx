import { Link } from 'react-router-dom';
import {
  Wallet,
  Percent,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Calculator,
  GraduationCap,
  Info,
  ArrowRight,
} from 'lucide-react';

export default function Rates() {
  const indicativeRates = [
    { level: 'Primary', range: '$25 – $40 / h' },
    { level: 'Lower Secondary', range: '$30 – $50 / h' },
    { level: 'Upper Secondary / O-Level', range: '$35 – $60 / h' },
    { level: 'JC / A-Level', range: '$50 – $90 / h' },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
      <header className="max-w-2xl">
        <span className="badge bg-brand-50 text-brand-700">
          <Wallet className="h-3.5 w-3.5" /> Pricing
        </span>
        <h1 className="mt-4 text-3xl sm:text-4xl">Simple, transparent fees.</h1>
        <p className="mt-3 text-slate-500">
          TutorX takes 30% of a tutor's <strong className="text-slate-700">first month only</strong>, per
          subject — then 0% forever after. No recurring cut, no middleman, no manual Telegram channels. You
          keep what you earn.
        </p>
      </header>

      {/* Headline fee cards */}
      <section className="mt-10 grid gap-4 sm:grid-cols-3">
        <div className="card flex flex-col gap-2 rounded-2xl">
          <Percent className="h-6 w-6 text-brand-600" />
          <p className="text-3xl font-extrabold text-slate-900">30%</p>
          <p className="text-sm font-semibold text-slate-700">First month, per subject</p>
          <p className="text-sm text-slate-500">
            A one-time placement fee charged once you're matched and teaching a new subject.
          </p>
        </div>
        <div className="card flex flex-col gap-2 rounded-2xl">
          <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          <p className="text-3xl font-extrabold text-slate-900">0%</p>
          <p className="text-sm font-semibold text-slate-700">Every month after</p>
          <p className="text-sm text-slate-500">
            From month two onwards you keep 100% of what the parent pays. No ongoing commission.
          </p>
        </div>
        <div className="card flex flex-col gap-2 rounded-2xl">
          <ShieldCheck className="h-6 w-6 text-brand-600" />
          <p className="text-3xl font-extrabold text-slate-900">$0</p>
          <p className="text-sm font-semibold text-slate-700">To sign up &amp; get verified</p>
          <p className="text-sm text-slate-500">
            Creating an account and verifying your credentials is free. You only pay when you're matched.
          </p>
        </div>
      </section>

      {/* Comparison vs agencies */}
      <section className="mt-12">
        <h2 className="text-xl font-bold text-slate-900">How that compares to a typical agency</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="card rounded-2xl border-brand-100 bg-brand-50/40">
            <div className="flex items-center gap-2">
              <span className="badge bg-brand-100 text-brand-700">TutorX</span>
              <span className="text-sm font-semibold text-slate-700">Automated &amp; cheaper</span>
            </div>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
              <li className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                30% of the first month only, then 0% forever
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                Automatic, priority-ordered matching
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                Credential-verified tutors only
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                No middleman — you deal directly once matched
              </li>
            </ul>
          </div>
          <div className="card rounded-2xl">
            <div className="flex items-center gap-2">
              <span className="badge bg-slate-100 text-slate-600">Typical agency</span>
              <span className="text-sm font-semibold text-slate-700">Manual &amp; pricier</span>
            </div>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
              <li className="flex gap-2">
                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                Often ~50% of the first month
              </li>
              <li className="flex gap-2">
                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                Manual matching over Telegram channels
              </li>
              <li className="flex gap-2">
                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                A coordinator sits between tutor and parent
              </li>
              <li className="flex gap-2">
                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                Verification often inconsistent or skipped
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Worked example */}
      <section className="mt-12">
        <h2 className="text-xl font-bold text-slate-900">A worked example</h2>
        <p className="mt-2 text-sm text-slate-500">
          Say you charge $50/h, teach 1.5 hours per lesson, once a week. Here's exactly what TutorX takes.
        </p>
        <div className="card mt-4 rounded-2xl">
          <div className="flex items-center gap-2 text-brand-700">
            <Calculator className="h-5 w-5" />
            <span className="font-semibold">First month, one subject</span>
          </div>

          <dl className="mt-5 divide-y divide-slate-100 text-sm">
            <div className="flex items-center justify-between py-2.5">
              <dt className="text-slate-500">Rate</dt>
              <dd className="font-medium text-slate-700">$50 / hour</dd>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <dt className="text-slate-500">Lesson length</dt>
              <dd className="font-medium text-slate-700">1.5 hours</dd>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <dt className="text-slate-500">Lessons / month</dt>
              <dd className="font-medium text-slate-700">4 (1 per week)</dd>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <dt className="text-slate-500">First-month value</dt>
              <dd className="font-medium text-slate-700">$50 × 1.5 × 4 = $300</dd>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <dt className="text-slate-600">TutorX fee (30%, one-time)</dt>
              <dd className="font-semibold text-rose-600">−$90</dd>
            </div>
            <div className="flex items-center justify-between py-3">
              <dt className="font-semibold text-slate-900">Tutor keeps (first month)</dt>
              <dd className="text-lg font-extrabold text-emerald-600">$210</dd>
            </div>
          </dl>

          <div className="mt-4 flex items-start gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Every month after the first, you keep the full <strong>$300</strong> — TutorX takes 0%.
            </span>
          </div>
        </div>
      </section>

      {/* Indicative rates table */}
      <section className="mt-12">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-brand-600" />
          <h2 className="text-xl font-bold text-slate-900">Indicative tuition rates</h2>
        </div>
        <p className="mt-2 text-sm text-slate-500">
          Rough Singapore guideline ranges by level — for reference only. Tutors set their own rate, and what
          you can command depends on your credentials, grades, and experience.
        </p>
        <div className="card mt-4 overflow-hidden rounded-2xl p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-slate-500">
                <th className="px-5 py-3 font-semibold">Level</th>
                <th className="px-5 py-3 text-right font-semibold">Indicative rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {indicativeRates.map((row) => (
                <tr key={row.level} className="text-slate-700">
                  <td className="px-5 py-3 font-medium">{row.level}</td>
                  <td className="px-5 py-3 text-right tabular-nums text-slate-600">{row.range}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 flex items-start gap-1.5 text-xs text-slate-400">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Guideline only. Ranges vary by subject demand, region, and the tutor's profile — not a quote.
        </p>
      </section>

      {/* Cancellation policy */}
      <section className="mt-12">
        <h2 className="text-xl font-bold text-slate-900">If a first class is cancelled</h2>
        <div className="card mt-4 rounded-2xl border-amber-100 bg-amber-50/40">
          <p className="text-sm text-slate-600">
            If a parent cancels the very first class, the tutor is still paid{' '}
            <strong className="text-slate-800">70%</strong> of that first class and TutorX keeps{' '}
            <strong className="text-slate-800">30%</strong>. A parent who isn't satisfied can request a
            different tutor at any time — your time is never wasted for free.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="card mt-12 flex flex-col items-start gap-4 rounded-2xl bg-brand-600 text-white sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold">Ready to start matching?</h2>
          <p className="mt-1 text-sm text-brand-100">
            Sign up free, get your credentials verified, and keep more of what you earn.
          </p>
        </div>
        <Link to="/register" className="btn-primary bg-white text-brand-700 hover:bg-brand-50">
          Create your account
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}
