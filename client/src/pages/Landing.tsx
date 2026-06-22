import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, Lock, Sparkles, Wallet } from 'lucide-react';

const features = [
  {
    icon: BadgeCheck,
    title: 'Credential-verified tutors',
    body: 'Every tutor uploads their O-Level, Poly or University certificate. We verify before they can ever be matched.',
  },
  {
    icon: Sparkles,
    title: 'Priority matching, not random',
    body: 'Tutors are scored on subject, level, budget, location and timing — then shown in priority order with reasons.',
  },
  {
    icon: Lock,
    title: 'Your details stay private',
    body: 'Phone, email and address are hidden until you confirm a tutor. We only ever store your postal code.',
  },
  {
    icon: Wallet,
    title: 'Fair, one-time fee',
    body: 'No middleman. We keep 30% of the first month only — then 0% forever. Agencies often take half.',
  },
];

export default function Landing() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-50 to-white" />
        <div className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="badge bg-white text-brand-700 shadow-sm ring-1 ring-brand-100">
              <BadgeCheck className="h-3.5 w-3.5" /> Singapore · credential-verified
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight sm:text-6xl">
              Verified tutors, <span className="text-brand-600">auto-matched.</span>
              <br className="hidden sm:block" /> No middleman.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
              Tell us the level, subject, budget and timing. TutorX instantly matches you with verified Singapore
              tutors — ranked by fit, not by who paid an agent. Your contact details stay private until you say yes.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/register" className="btn-primary px-6 py-3 text-base">
                Find a tutor <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/register" className="btn-ghost px-6 py-3 text-base">
                Become a tutor
              </Link>
            </div>
            <p className="mt-4 text-sm text-slate-500">
              Credential-verified · Priority-matched · Contacts protected
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="card p-6">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works strip */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="card overflow-hidden">
          <div className="grid gap-px bg-slate-100 sm:grid-cols-3">
            {[
              { n: '1', t: 'Post what you need', d: 'Level, subject, region, budget and preferred timing — takes a minute.' },
              { n: '2', t: 'Swipe your matches', d: 'A priority-ranked deck of verified tutors, each with a clear "why matched".' },
              { n: '3', t: 'Confirm & connect', d: 'Press “Want this tutor” to reveal contacts and lock in your first month.' },
            ].map((s) => (
              <div key={s.n} className="bg-white p-6">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-600 text-sm font-bold text-white">
                  {s.n}
                </span>
                <h3 className="mt-3 text-base">{s.t}</h3>
                <p className="mt-1 text-sm text-slate-500">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6 text-center">
          <Link to="/how-it-works" className="text-sm font-semibold text-brand-700 hover:underline">
            See the full walkthrough →
          </Link>
        </div>
      </section>

      {/* CTA band */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="rounded-3xl bg-brand-600 px-6 py-12 text-center text-white sm:px-12">
          <h2 className="text-2xl font-extrabold text-white sm:text-3xl">Ready to get matched?</h2>
          <p className="mx-auto mt-2 max-w-xl text-brand-100">
            Join as a parent to find a verified tutor, or as a tutor to get hired without giving away half your pay.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/register" className="btn bg-white px-6 py-3 text-base text-brand-700 hover:bg-brand-50">
              Create your account <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/login" className="btn px-6 py-3 text-base text-white ring-1 ring-white/40 hover:bg-white/10">
              Log in
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
